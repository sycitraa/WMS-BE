const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/numberGenerator');

const workOrderIncludes = {
  user: { select: { nama: true } },
  warehouse_area: { select: { warehouse_area_name: true } },
  inbound_plan: { select: { document_number: true, status: true } },
  outbound_plan: { select: { document_number: true, status: true } },
  details: {
    include: {
      pallet_type: { select: { pallet_name: true, pallet_category: true } },
      storage_bins: { select: { bin_number: true, stock: true, max_quantity: true } }
    }
  }
};

const getAllWorkOrders = async (query, requestingUser) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';
  const category = query.category || '';   // Filter: INBOUND / OUTBOUND
  const status = query.status || '';       // Filter: TO_DO / ON_PROGRESS / DONE

  const skip = (page - 1) * limit;

  // Build WHERE condition secara dinamis
  const whereCondition = {};

  // Jika yang request adalah Operator, tampilkan hanya WO miliknya
  if (requestingUser.nama_role === 'OPERATOR') {
    whereCondition.id_user = requestingUser.id_user;
  }

  // Filter berdasarkan kategori (INBOUND / OUTBOUND)
  if (category) {
    whereCondition.work_order_category = category;
  }

  // Filter berdasarkan status (TO_DO / ON_PROGRESS / DONE)
  if (status) {
    whereCondition.status = status;
  }

  // Pencarian berdasarkan nomor WO, nama operator, atau remarks
  if (search) {
    whereCondition.OR = [
      { work_order_number: { contains: search, mode: 'insensitive' } },
      { user: { nama: { contains: search, mode: 'insensitive' } } },
      { remarks: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.workOrder.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_work_order: 'desc' },
      include: workOrderIncludes
    }),
    prisma.workOrder.count({ where: whereCondition })
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

const getWorkOrderById = async (id, requestingUser) => {
  const workOrder = await prisma.workOrder.findUnique({
    where: { id_work_order: id },
    include: workOrderIncludes
  });

  if (!workOrder) {
    throw new AppError('Work Order tidak ditemukan', 404);
  }

  // Guard: Operator hanya boleh melihat WO miliknya sendiri
  if (requestingUser.nama_role === 'OPERATOR' && workOrder.id_user !== requestingUser.id_user) {
    throw new AppError('Anda tidak memiliki akses ke Work Order ini', 403);
  }

  return workOrder;
};

const createWorkOrder = async (data) => {
  const {
    work_order_category,
    id_inbound_plan,
    id_outbound_plan,
    id_warehouse_area,
    id_user,
    transfer_point,
    date,
    remarks,
    details
  } = data;

  // ---- VALIDASI INPUT ----

  // 1. Kategori wajib diisi dan hanya boleh INBOUND atau OUTBOUND
  const allowedCategories = ['INBOUND', 'OUTBOUND'];
  if (!work_order_category || !allowedCategories.includes(work_order_category)) {
    throw new AppError('Kategori Work Order harus INBOUND atau OUTBOUND', 400);
  }

  // 2. Validasi field wajib
  if (!id_warehouse_area || !id_user || !date) {
    throw new AppError('Warehouse Area, User (Operator), dan Tanggal wajib diisi', 400);
  }

  // 3. Validasi detail items
  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Work Order harus memiliki minimal 1 Detail Item', 400);
  }

  // ---- VALIDASI RELASI ----

  // 4. Validasi bahwa Plan yang direferensikan sudah APPROVE
  if (work_order_category === 'INBOUND') {
    if (!id_inbound_plan) {
      throw new AppError('Inbound Plan wajib dipilih untuk WO kategori INBOUND', 400);
    }
    const planId = parseInt(id_inbound_plan, 10);
    const plan = await prisma.inboundPlan.findUnique({
      where: { id_inbound_plan: planId }
    });
    if (!plan) throw new AppError('Inbound Plan tidak ditemukan', 404);
    if (plan.status !== 'APPROVE') {
      throw new AppError(`Inbound Plan berstatus "${plan.status}". Hanya Plan berstatus APPROVE yang bisa dibuatkan WO`, 400);
    }

    // Guard: 1 Plan = 1 Work Order (cegah duplikasi)
    const existingWO = await prisma.workOrder.findFirst({
      where: { id_inbound_plan: planId }
    });
    if (existingWO) {
      throw new AppError(`Inbound Plan ini sudah memiliki Work Order (${existingWO.work_order_number}). Satu Plan hanya boleh memiliki satu Work Order`, 400);
    }
  }

  if (work_order_category === 'OUTBOUND') {
    if (!id_outbound_plan) {
      throw new AppError('Outbound Plan wajib dipilih untuk WO kategori OUTBOUND', 400);
    }
    const planId = parseInt(id_outbound_plan, 10);
    const plan = await prisma.outboundPlan.findUnique({
      where: { id_outbound_plan: planId }
    });
    if (!plan) throw new AppError('Outbound Plan tidak ditemukan', 404);
    if (plan.status !== 'APPROVE') {
      throw new AppError(`Outbound Plan berstatus "${plan.status}". Hanya Plan berstatus APPROVE yang bisa dibuatkan WO`, 400);
    }

    // Guard: 1 Plan = 1 Work Order (cegah duplikasi)
    const existingWO = await prisma.workOrder.findFirst({
      where: { id_outbound_plan: planId }
    });
    if (existingWO) {
      throw new AppError(`Outbound Plan ini sudah memiliki Work Order (${existingWO.work_order_number}). Satu Plan hanya boleh memiliki satu Work Order`, 400);
    }
  }

  // 5. Validasi bahwa id_user adalah OPERATOR
  const assignedUser = await prisma.user.findUnique({
    where: { id_user: parseInt(id_user, 10) },
    include: { role: true }
  });
  if (!assignedUser) throw new AppError('User yang ditugaskan tidak ditemukan', 404);
  if (assignedUser.role.nama_role !== 'OPERATOR') {
    throw new AppError(`User "${assignedUser.nama}" bukan Operator. WO hanya bisa ditugaskan kepada role OPERATOR`, 400);
  }

  // 6. Validasi Warehouse Area
  const warehouseArea = await prisma.warehouseArea.findUnique({
    where: { id_warehouse_area: parseInt(id_warehouse_area, 10) }
  });
  if (!warehouseArea) throw new AppError('Warehouse Area tidak ditemukan', 404);

  // ---- FORMAT DATA ----

  // 7. Auto-generate work_order_number
  const woDate = new Date(date);
  const work_order_number = await generateDocumentNumber('WORK_ORDER', woDate);

  // 8. Format detail items (actual_pcs selalu mulai dari 0)
  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_storage_bins || !item.total_planning) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_storage_bins: parseInt(item.id_storage_bins, 10),
      total_planning: parseInt(item.total_planning, 10),
      actual_pcs: 0 // Awal selalu 0, akan terupdate saat RFID scan
    };
  });

  // ---- SIMPAN KE DATABASE ----

  const newWorkOrder = await prisma.workOrder.create({
    data: {
      id_inbound_plan: work_order_category === 'INBOUND'
        ? parseInt(id_inbound_plan, 10) : null,
      id_outbound_plan: work_order_category === 'OUTBOUND'
        ? parseInt(id_outbound_plan, 10) : null,
      id_warehouse_area: parseInt(id_warehouse_area, 10),
      id_user: parseInt(id_user, 10),
      work_order_number,
      work_order_category,
      transfer_point: transfer_point || null,
      date: woDate,
      remarks: remarks || null,
      status: 'TO_DO', // Status awal selalu TO_DO
      details: {
        create: formattedDetails
      }
    },
    include: workOrderIncludes
  });

  return newWorkOrder;
};

const updateWorkOrder = async (id, data) => {
  const {
    id_warehouse_area,
    id_user,
    transfer_point,
    date,
    remarks,
    details
  } = data;

  // 1. Pastikan WO ada
  const existingWO = await prisma.workOrder.findUnique({
    where: { id_work_order: id }
  });
  if (!existingWO) throw new AppError('Work Order tidak ditemukan', 404);

  // 2. Guard: hanya boleh edit jika status masih TO_DO
  if (existingWO.status !== 'TO_DO') {
    throw new AppError(
      `Work Order berstatus "${existingWO.status}" tidak dapat diedit. Hanya WO berstatus TO_DO yang bisa diubah`,
      400
    );
  }

  // 3. Validasi detail items
  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Work Order harus memiliki minimal 1 Detail Item', 400);
  }

  // 4. Jika id_user diubah, pastikan user baru adalah OPERATOR
  if (id_user) {
    const assignedUser = await prisma.user.findUnique({
      where: { id_user: parseInt(id_user, 10) },
      include: { role: true }
    });
    if (!assignedUser) throw new AppError('User yang ditugaskan tidak ditemukan', 404);
    if (assignedUser.role.nama_role !== 'OPERATOR') {
      throw new AppError(`User "${assignedUser.nama}" bukan Operator`, 400);
    }
  }

  // 5. Jika id_warehouse_area diubah, pastikan ada di database
  if (id_warehouse_area) {
    const warehouseArea = await prisma.warehouseArea.findUnique({
      where: { id_warehouse_area: parseInt(id_warehouse_area, 10) }
    });
    if (!warehouseArea) throw new AppError('Warehouse Area tidak ditemukan', 404);
  }

  // 6. Format detail items
  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_storage_bins || !item.total_planning) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_storage_bins: parseInt(item.id_storage_bins, 10),
      total_planning: parseInt(item.total_planning, 10),
      actual_pcs: 0
    };
  });

  // 7. Transaction: hapus detail lama → update WO + insert detail baru
  const updatedWO = await prisma.$transaction(async (tx) => {
    await tx.workOrderDetail.deleteMany({
      where: { id_work_order: id }
    });

    return await tx.workOrder.update({
      where: { id_work_order: id },
      data: {
        id_warehouse_area: id_warehouse_area
          ? parseInt(id_warehouse_area, 10) : existingWO.id_warehouse_area,
        id_user: id_user
          ? parseInt(id_user, 10) : existingWO.id_user,
        transfer_point: transfer_point !== undefined
          ? transfer_point : existingWO.transfer_point,
        date: date ? new Date(date) : existingWO.date,
        remarks: remarks !== undefined ? remarks : existingWO.remarks,
        details: {
          create: formattedDetails
        }
      },
      include: workOrderIncludes
    });
  });

  return updatedWO;
};

const updateWorkOrderStatus = async (id, data, requestingUser) => {
  const { status } = data;

  // 1. Validasi status yang dikirim
  const allowedStatuses = ['ON_PROGRESS', 'DONE'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new AppError('Status harus ON_PROGRESS atau DONE', 400);
  }

  // 2. Pastikan WO ada
  const existingWO = await prisma.workOrder.findUnique({
    where: { id_work_order: id }
  });
  if (!existingWO) throw new AppError('Work Order tidak ditemukan', 404);

  // 3. Guard: Operator hanya bisa mengubah status WO miliknya
  if (requestingUser.nama_role === 'OPERATOR' && existingWO.id_user !== requestingUser.id_user) {
    throw new AppError('Anda tidak memiliki akses ke Work Order ini', 403);
  }

  // 4. Guard: Alur status harus berurutan (tidak boleh loncat/mundur)
  //    TO_DO → ON_PROGRESS → DONE
  if (status === 'ON_PROGRESS' && existingWO.status !== 'TO_DO') {
    throw new AppError(
      `Tidak bisa mengubah status dari "${existingWO.status}" ke "ON_PROGRESS". Status harus "TO_DO" terlebih dahulu`,
      400
    );
  }
  if (status === 'DONE' && existingWO.status !== 'ON_PROGRESS') {
    throw new AppError(
      `Tidak bisa mengubah status dari "${existingWO.status}" ke "DONE". Status harus "ON_PROGRESS" terlebih dahulu`,
      400
    );
  }

  // 5. Update status
  const updatedWO = await prisma.workOrder.update({
    where: { id_work_order: id },
    data: { status },
    include: workOrderIncludes
  });

  return updatedWO;
};

const deleteWorkOrder = async (id) => {
  const existingWO = await prisma.workOrder.findUnique({
    where: { id_work_order: id }
  });
  if (!existingWO) throw new AppError('Work Order tidak ditemukan', 404);

  // Guard: hanya boleh hapus jika status masih TO_DO
  if (existingWO.status !== 'TO_DO') {
    throw new AppError(
      `Work Order berstatus "${existingWO.status}" tidak dapat dihapus. Hanya WO berstatus TO_DO yang bisa dihapus`,
      400
    );
  }

  // Soft delete WO (detail tetap di database, hanya parent yang di-mark)
  await prisma.workOrder.delete({
    where: { id_work_order: id }
  });
};

module.exports = {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder
};
