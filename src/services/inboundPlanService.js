const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/numberGenerator');

// ============================================================
// 1. GET ALL - Ambil semua Inbound Plan (Pagination + Search)
// ============================================================
const getAllInboundPlans = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';

  const skip = (page - 1) * limit;

  // Build WHERE condition secara dinamis berdasarkan parameter search
  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { document_number: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { user: { nama: { contains: search, mode: 'insensitive' } } }
    ];
  }

  // $transaction: Jalankan findMany + count secara atomic (bersamaan)
  // Ini menjamin total data dan data yang ditampilkan selalu konsisten
  const [data, totalItems] = await prisma.$transaction([
    prisma.inboundPlan.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_inbound_plan: 'desc' },
      // include: Sertakan data relasi agar FE tidak perlu request tambahan
      include: {
        user: { select: { nama: true } },
        details: {
          include: {
            pallet_type: { select: { pallet_name: true } },
            factory: { select: { factory_name: true } }
          }
        }
      }
    }),
    prisma.inboundPlan.count({ where: whereCondition })
  ]);

  return {
    data,
    meta: {
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

// ============================================================
// 2. GET BY ID - Ambil detail 1 Inbound Plan + detail items
// ============================================================
const getInboundPlanById = async (id) => {
  const inboundPlan = await prisma.inboundPlan.findUnique({
    where: { id_inbound_plan: id },
    include: {
      user: { select: { nama: true } },
      details: {
        include: {
          pallet_type: { select: { pallet_name: true } },
          factory: { select: { factory_name: true } }
        }
      }
    }
  });

  if (!inboundPlan) {
    throw new AppError('Inbound Plan tidak ditemukan', 404);
  }

  return inboundPlan;
};

// ============================================================
// 3. CREATE - Buat Inbound Plan baru (ADMIN only)
//    document_number di-generate otomatis oleh numberGenerator
// ============================================================
const createInboundPlan = async (userId, data) => {
  const { planning_month, remarks, details } = data;

  // 1. Validasi: planning_month wajib diisi
  if (!planning_month) {
    throw new AppError('Planning Month wajib diisi', 400);
  }

  // 2. Validasi: minimal harus ada 1 detail item
  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Inbound Plan harus memiliki minimal 1 Detail Item', 400);
  }

  // 3. Auto-generate document_number menggunakan numberGenerator
  //    Contoh hasil: "RCV.PLAN-052026-0001"
  const planDate = new Date(planning_month);
  const document_number = await generateDocumentNumber('INBOUND', planDate);

  // 4. Format setiap detail item & validasi kelengkapan data
  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_factory || !item.quantity) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_factory: parseInt(item.id_factory, 10),
      quantity: parseInt(item.quantity, 10)
    };
  });

  // 5. Simpan ke database menggunakan Nested Writes
  //    Prisma otomatis membuat InboundPlan + InboundPlanDetail dalam 1 transaksi
  const newInboundPlan = await prisma.inboundPlan.create({
    data: {
      id_user: userId,
      document_number,
      planning_month: planDate,
      status: 'WAITING_APPROVAL',
      remarks: remarks || null,
      details: {
        create: formattedDetails
      }
    },
    include: {
      user: { select: { nama: true } },
      details: {
        include: {
          pallet_type: { select: { pallet_name: true } },
          factory: { select: { factory_name: true } }
        }
      }
    }
  });

  return newInboundPlan;
};

// ============================================================
// 4. UPDATE (PUT) - Admin update data Plan (ADMIN only)
//    Status otomatis di-reset ke WAITING_APPROVAL
// ============================================================
const updateInboundPlan = async (id, data) => {
  const { planning_month, remarks, details } = data;

  // 1. Pastikan Inbound Plan dengan ID ini ada di database
  const existingPlan = await prisma.inboundPlan.findUnique({
    where: { id_inbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Inbound Plan tidak ditemukan', 404);
  }

  // 2. Validasi: minimal harus ada 1 detail item
  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Inbound Plan harus memiliki minimal 1 Detail Item', 400);
  }

  // 3. Format & validasi setiap detail item
  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_factory || !item.quantity) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_factory: parseInt(item.id_factory, 10),
      quantity: parseInt(item.quantity, 10)
    };
  });

  // 4. Interactive Transaction: hapus detail lama → update plan + insert detail baru
  //    Strategi "Replace": karena user bisa menambah/hapus/ubah item,
  //    lebih aman hapus semua detail lama lalu buat ulang semuanya
  const updatedPlan = await prisma.$transaction(async (tx) => {
    // Langkah A: Hapus semua detail lama
    await tx.inboundPlanDetail.deleteMany({
      where: { id_inbound_plan: id }
    });

    // Langkah B: Update data plan + insert detail baru sekaligus
    return await tx.inboundPlan.update({
      where: { id_inbound_plan: id },
      data: {
        planning_month: planning_month
          ? new Date(planning_month)
          : existingPlan.planning_month,
        status: 'WAITING_APPROVAL', // Reset status sesuai aturan bisnis
        remarks: remarks !== undefined ? remarks : existingPlan.remarks,
        details: {
          create: formattedDetails
        }
      },
      include: {
        user: { select: { nama: true } },
        details: {
          include: {
            pallet_type: { select: { pallet_name: true } },
            factory: { select: { factory_name: true } }
          }
        }
      }
    });
  });

  return updatedPlan;
};

// ============================================================
// 5. PATCH STATUS - Supervisor approve/reject (SUPERVISOR only)
//    Hanya mengubah status dan remarks
// ============================================================
const updateInboundPlanStatus = async (id, data) => {
  const { status, remarks } = data;

  // 1. Validasi: status hanya boleh APPROVE atau REJECT
  const allowedStatuses = ['APPROVE', 'REJECT'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new AppError('Status harus APPROVE atau REJECT', 400);
  }

  // 2. Pastikan plan ada di database
  const existingPlan = await prisma.inboundPlan.findUnique({
    where: { id_inbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Inbound Plan tidak ditemukan', 404);
  }

  // 3. Guard: hanya plan dengan status WAITING_APPROVAL yang bisa di-approve/reject
  if (existingPlan.status !== 'WAITING_APPROVAL') {
    throw new AppError(
      `Plan dengan status "${existingPlan.status}" tidak dapat di-approve/reject`,
      400
    );
  }

  // 4. Update hanya field status dan remarks
  const updatedPlan = await prisma.inboundPlan.update({
    where: { id_inbound_plan: id },
    data: {
      status,
      remarks: remarks || existingPlan.remarks
    },
    include: {
      user: { select: { nama: true } },
      details: {
        include: {
          pallet_type: { select: { pallet_name: true } },
          factory: { select: { factory_name: true } }
        }
      }
    }
  });

  return updatedPlan;
};

// ============================================================
// 6. DELETE - Hapus Inbound Plan beserta semua detail-nya
// ============================================================
const deleteInboundPlan = async (id) => {
  // 1. Pastikan plan ada di database
  const existingPlan = await prisma.inboundPlan.findUnique({
    where: { id_inbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Inbound Plan tidak ditemukan', 404);
  }

  // 2. Transaction: hapus detail (child) dulu, baru hapus plan (parent)
  //    Karena ada foreign key constraint, child harus dihapus terlebih dahulu
  await prisma.$transaction(async (tx) => {
    await tx.inboundPlanDetail.deleteMany({
      where: { id_inbound_plan: id }
    });
    await tx.inboundPlan.delete({
      where: { id_inbound_plan: id }
    });
  });
};

module.exports = {
  getAllInboundPlans,
  getInboundPlanById,
  createInboundPlan,
  updateInboundPlan,
  updateInboundPlanStatus,
  deleteInboundPlan
};