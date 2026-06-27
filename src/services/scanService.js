const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const scanPallet = async (data, requestingUser) => {
  const { id_work_order, rfid_tag } = data;

  // --- VALIDASI INPUT ---
  if (!id_work_order || !rfid_tag) {
    throw new AppError('id_work_order dan rfid_tag wajib diisi', 400);
  }

  const woId = parseInt(id_work_order, 10);

  // 1. Pastikan WO ada dan ambil detail lengkapnya
  const workOrder = await prisma.workOrder.findUnique({
    where: { id_work_order: woId },
    include: {
      details: {
        include: {
          storage_bins: true
        }
      }
    }
  });
  if (!workOrder) throw new AppError('Work Order tidak ditemukan', 404);

  // 2. Guard: WO harus berstatus ON_PROGRESS
  if (workOrder.status !== 'ON_PROGRESS') {
    const msg = workOrder.status === 'TO_DO'
      ? 'Work Order belum dimulai. Ubah status ke ON_PROGRESS terlebih dahulu'
      : 'Work Order sudah selesai (DONE). Tidak bisa melakukan scan lagi';
    throw new AppError(msg, 400);
  }

  // 3. Guard: Operator hanya bisa scan WO miliknya
  if (requestingUser.nama_role === 'OPERATOR' && workOrder.id_user !== requestingUser.id_user) {
    throw new AppError('Anda tidak memiliki akses ke Work Order ini', 403);
  }

  // 4. Cari pallet berdasarkan rfid_tag
  const pallet = await prisma.pallet.findUnique({
    where: { rfid_tag: rfid_tag.trim() }
  });
  if (!pallet) {
    throw new AppError(`Pallet dengan RFID tag "${rfid_tag}" tidak ditemukan`, 404);
  }

  // 5. Guard: Pallet tidak boleh di-scan dua kali di WO yang sama
  const existingScan = await prisma.rfidScan.findFirst({
    where: {
      id_pallet: pallet.id_pallet,
      id_work_order: woId
    }
  });
  if (existingScan) {
    throw new AppError(`Pallet "${rfid_tag}" sudah di-scan sebelumnya pada Work Order ini`, 400);
  }

  // 6. Cari WorkOrderDetail yang cocok dengan pallet_type pallet
  const matchingDetail = workOrder.details.find(
    (d) => d.id_pallet_type === pallet.id_pallet_type && d.actual_pcs < d.total_planning
  );
  if (!matchingDetail) {
    // Cek apakah pallet_type memang ada di WO ini tapi sudah penuh
    const anyMatch = workOrder.details.find(
      (d) => d.id_pallet_type === pallet.id_pallet_type
    );
    if (anyMatch) {
      throw new AppError('Target scan untuk tipe pallet ini sudah tercapai (actual_pcs = total_planning)', 400);
    }
    throw new AppError('Tipe pallet ini tidak sesuai dengan Work Order ini', 400);
  }

  // 7. Validasi kapasitas StorageBin
  const storageBin = matchingDetail.storage_bins;

  if (workOrder.work_order_category === 'INBOUND') {
    // INBOUND: stok bertambah, cek apakah tidak melebihi kapasitas
    if (storageBin.stock + 1 > storageBin.max_quantity) {
      throw new AppError(
        `Storage Bin "${storageBin.bin_number}" sudah penuh (${storageBin.stock}/${storageBin.max_quantity})`,
        400
      );
    }
  }

  if (workOrder.work_order_category === 'OUTBOUND') {
    // OUTBOUND: stok berkurang, cek apakah tidak negatif
    if (storageBin.stock - 1 < 0) {
      throw new AppError(
        `Stok di Storage Bin "${storageBin.bin_number}" sudah habis (0)`,
        400
      );
    }
  }

  const result = await prisma.$transaction(async (tx) => {

    const scanRecord = await tx.rfidScan.create({
      data: {
        id_pallet: pallet.id_pallet,
        id_work_order: woId,
        id_user: requestingUser.id_user
      }
    });

    if (workOrder.work_order_category === 'INBOUND') {
      await tx.pallet.update({
        where: { id_pallet: pallet.id_pallet },
        data: {
          status: 'AVAILABLE',
          location: storageBin.bin_number
        }
      });
    } else {
      await tx.pallet.update({
        where: { id_pallet: pallet.id_pallet },
        data: {
          status: 'SHIPPED',
          location: null
        }
      });
    }

    const stockChange = workOrder.work_order_category === 'INBOUND' ? 1 : -1;
    await tx.storageBin.update({
      where: { id_storage_bins: storageBin.id_storage_bins },
      data: {
        stock: { increment: stockChange }
      }
    });

    await tx.workOrderDetail.update({
      where: { id_work_order_detail: matchingDetail.id_work_order_detail },
      data: {
        actual_pcs: { increment: 1 }
      }
    });

    return scanRecord;
  });

  // Ambil data scan lengkap untuk response
  const scanWithRelations = await prisma.rfidScan.findUnique({
    where: { id_scan: result.id_scan },
    include: {
      pallet: {
        select: {
          rfid_tag: true,
          status: true,
          location: true,
          pallet_type: { select: { pallet_name: true, pallet_category: true } }
        }
      },
      work_order: {
        select: { work_order_number: true, work_order_category: true }
      },
      user: { select: { nama: true } }
    }
  });

  return scanWithRelations;
};

const getScansByWorkOrder = async (woId, requestingUser, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  // 1. Pastikan WO ada
  const workOrder = await prisma.workOrder.findUnique({
    where: { id_work_order: woId }
  });
  if (!workOrder) throw new AppError('Work Order tidak ditemukan', 404);

  // 2. Guard: Operator hanya bisa lihat scan WO miliknya
  if (requestingUser.nama_role === 'OPERATOR' && workOrder.id_user !== requestingUser.id_user) {
    throw new AppError('Anda tidak memiliki akses ke Work Order ini', 403);
  }

  // 3. Ambil semua scan untuk WO ini
  const [scans, totalScans] = await prisma.$transaction([
    prisma.rfidScan.findMany({
      where: { id_work_order: woId },
      skip: skip,
      take: limit,
      orderBy: { scanned_at: 'desc' },
      include: {
        pallet: {
          select: {
            rfid_tag: true,
            status: true,
            location: true,
            pallet_type: { select: { pallet_name: true, pallet_category: true } }
          }
        },
        user: { select: { nama: true } }
      }
    }),
    prisma.rfidScan.count({ where: { id_work_order: woId } })
  ]);

  return {
    work_order_number: workOrder.work_order_number,
    work_order_category: workOrder.work_order_category,
    status: workOrder.status,
    total_scans: totalScans,
    scans,
    meta: {
      totalItems: totalScans,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalScans / limit)
    }
  };
};

module.exports = {
  scanPallet,
  getScansByWorkOrder
};
