const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');
const { generateDocumentNumber } = require('../utils/numberGenerator');

const getAllOutboundPlans = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';
  const status = query.status || '';
  const planning_month = query.planning_month || '';

  const skip = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { document_number: { contains: search, mode: 'insensitive' } },
      { status: { contains: search, mode: 'insensitive' } },
      { user: { nama: { contains: search, mode: 'insensitive' } } }
    ];
  }

  if (status) {
    whereCondition.status = status;
  }

  if (planning_month) {
    const [year, month] = planning_month.split('-');
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      whereCondition.planning_month = {
        gte: startDate,
        lt: endDate
      };
    }
  }

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

const createOutboundPlan = async (userId, data) => {
  const { planning_month, remarks, details } = data;

  // Validasi relasi pada details
  for (let i = 0; i < details.length; i++) {
    const item = details[i];
    const palletType = await prisma.palletType.findUnique({ where: { id_pallet_type: parseInt(item.id_pallet_type, 10) } });
    if (!palletType) throw new AppError(`Pallet Type dengan ID ${item.id_pallet_type} tidak ditemukan atau sudah dihapus`, 404);

    const destination = await prisma.destination.findUnique({ where: { id_destination: parseInt(item.id_destination, 10) } });
    if (!destination) throw new AppError(`Destination dengan ID ${item.id_destination} tidak ditemukan atau sudah dihapus`, 404);
  }

  const planDate = new Date(planning_month);
  const document_number = await generateDocumentNumber('OUTBOUND', planDate);

  const formattedDetails = details.map((item) => {
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

const updateOutboundPlan = async (id, data) => {
  const { planning_month, remarks, details } = data;

  const existingPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  // Guard: plan yang sudah berjalan di WO tidak boleh diedit
  const relatedWO = await prisma.workOrder.findFirst({
    where: { id_outbound_plan: id }
  });
  if (relatedWO && relatedWO.status !== 'TO_DO') {
    throw new AppError('Plan tidak dapat diedit karena Work Order sudah berjalan atau selesai', 400);
  }

  // Validasi relasi pada details
  for (let i = 0; i < details.length; i++) {
    const item = details[i];
    const palletType = await prisma.palletType.findUnique({ where: { id_pallet_type: parseInt(item.id_pallet_type, 10) } });
    if (!palletType) throw new AppError(`Pallet Type dengan ID ${item.id_pallet_type} tidak ditemukan atau sudah dihapus`, 404);

    const destination = await prisma.destination.findUnique({ where: { id_destination: parseInt(item.id_destination, 10) } });
    if (!destination) throw new AppError(`Destination dengan ID ${item.id_destination} tidak ditemukan atau sudah dihapus`, 404);
  }

  const formattedDetails = details.map((item) => {
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

const updateOutboundPlanStatus = async (id, data) => {
  const { status, remarks } = data;

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

const deleteOutboundPlan = async (id) => {
  const existingPlan = await prisma.outboundPlan.findUnique({
    where: { id_outbound_plan: id }
  });
  if (!existingPlan) {
    throw new AppError('Outbound Plan tidak ditemukan', 404);
  }

  // Guard: plan tidak bisa dihapus jika sudah ada WO
  const relatedWO = await prisma.workOrder.findFirst({
    where: { id_outbound_plan: id }
  });
  if (relatedWO) {
    throw new AppError('Plan tidak bisa dihapus karena sudah memiliki Work Order', 400);
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
