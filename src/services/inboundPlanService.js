const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/numberGenerator');

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

  const [data, totalItems] = await prisma.$transaction([
    prisma.inboundPlan.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_inbound_plan: 'desc' },
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

const createInboundPlan = async (userId, data) => {
  const { planning_month, remarks, details } = data;

  if (!planning_month) {
    throw new AppError('Planning Month wajib diisi', 400);
  }
  if (!details || !Array.isArray(details) || details.length === 0) {
    throw new AppError('Inbound Plan harus memiliki minimal 1 Detail Item', 400);
  }

  const planDate = new Date(planning_month);
  const document_number = await generateDocumentNumber('INBOUND', planDate);
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

  const updatedPlan = await prisma.$transaction(async (tx) => {
    await tx.inboundPlanDetail.deleteMany({
      where: { id_inbound_plan: id }
    });
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

const deleteInboundPlan = async (id) => {
  // 1. Pastikan plan ada di database
  const existingPlan = await prisma.inboundPlan.findUnique({
    where: { id_inbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Inbound Plan tidak ditemukan', 404);
  }

  // 2. Transaction: hapus detail (child) dulu, baru hapus plan (parent)
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