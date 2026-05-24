const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/numberGenerator');

// ============================================================
// 1. GET ALL - Ambil semua Outbound Plan (Pagination + Search)
// ============================================================
const getAllOutboundPlans = async (query) => {
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
  const [data, totalItems] = await prisma.$transaction([
    prisma.outboundPlan.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_outbound_plan: 'desc' },
      include: {
        user: { select: { nama: true } },
        details: {
          include: {
            pallet_type: { select: { pallet_name: true } },
            destination: { select: { destination_name: true } }
          }
        }
      }
    }),
    prisma.outboundPlan.count({ where: whereCondition })
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
// 2. GET BY ID - Ambil detail 1 Outbound Plan + detail items
// ============================================================
const getOutboundPlanById = async (id) => {
  const outboundPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id },
    include: {
      user: { select: { nama: true } },
      details: {
        include: {
          pallet_type: { select: { pallet_name: true } },
          destination: { select: { destination_name: true } }
        }
      }
    }
  });

  if (!outboundPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  return outboundPlan;
};

// ============================================================
// 3. CREATE - Buat Outbound Plan baru (ADMIN only)
//    document_number di-generate otomatis oleh numberGenerator
// ============================================================
const createOutboundPlan = async (userId, data) => {
  const { planning_month, remarks, details } = data;

  if (!planning_month) {
    throw new AppError('Planning Month wajib diisi', 400);
  }

  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Outbound Plan harus memiliki minimal 1 Detail Item', 400);
  }

  const planDate = new Date(planning_month);
  const document_number = await generateDocumentNumber('OUTBOUND', planDate);

  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_destination || !item.quantity) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_destination: parseInt(item.id_destination, 10),
      quantity: parseInt(item.quantity, 10)
    };
  });

  const newOutboundPlan = await prisma.outboundPlan.create({
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
          destination: { select: { destination_name: true } }
        }
      }
    }
  });

  return newOutboundPlan;
};

// ============================================================
// 4. UPDATE (PUT) - Admin update data Plan (ADMIN only)
//    Status otomatis di-reset ke WAITING_APPROVAL
// ============================================================
const updateOutboundPlan = async (id, data) => {
  const { planning_month, remarks, details } = data;

  const existingPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Outbound Plan harus memiliki minimal 1 Detail Item', 400);
  }

  const formattedDetails = details.map((item, index) => {
    if (!item.id_pallet_type || !item.id_destination || !item.quantity) {
      throw new AppError(`Data item pada baris ke-${index + 1} tidak lengkap`, 400);
    }
    return {
      id_pallet_type: parseInt(item.id_pallet_type, 10),
      id_destination: parseInt(item.id_destination, 10),
      quantity: parseInt(item.quantity, 10)
    };
  });

  const updatedPlan = await prisma.$transaction(async (tx) => {
    await tx.outboundPlanDetail.deleteMany({
      where: { id_outbound_plan: id }
    });

    return await tx.outboundPlan.update({
      where: { id_outbound_plan: id },
      data: {
        planning_month: planning_month
          ? new Date(planning_month)
          : existingPlan.planning_month,
        status: 'WAITING_APPROVAL',
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
            destination: { select: { destination_name: true } }
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
const updateOutboundPlanStatus = async (id, data) => {
  const { status, remarks } = data;

  const allowedStatuses = ['APPROVE', 'REJECT'];
  if (!status || !allowedStatuses.includes(status)) {
    throw new AppError('Status harus APPROVE atau REJECT', 400);
  }

  const existingPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  if (existingPlan.status !== 'WAITING_APPROVAL') {
    throw new AppError(
      `Plan dengan status "${existingPlan.status}" tidak dapat di-approve/reject`,
      400
    );
  }

  const updatedPlan = await prisma.outboundPlan.update({
    where: { id_outbound_plan: id },
    data: {
      status,
      remarks: remarks || existingPlan.remarks
    },
    include: {
      user: { select: { nama: true } },
      details: {
        include: {
          pallet_type: { select: { pallet_name: true } },
          destination: { select: { destination_name: true } }
        }
      }
    }
  });

  return updatedPlan;
};

// ============================================================
// 6. DELETE - Hapus Outbound Plan beserta semua detail-nya
// ============================================================
const deleteOutboundPlan = async (id) => {
  const existingPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.outboundPlanDetail.deleteMany({
      where: { id_outbound_plan: id }
    });
    await tx.outboundPlan.delete({
      where: { id_outbound_plan: id }
    });
  });
};

module.exports = {
  getAllOutboundPlans,
  getOutboundPlanById,
  createOutboundPlan,
  updateOutboundPlan,
  updateOutboundPlanStatus,
  deleteOutboundPlan
};
