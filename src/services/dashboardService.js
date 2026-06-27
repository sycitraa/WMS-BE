const prisma = require('../config/prisma');
const {
  getStartOfWeek,
  getDailyThroughput,
  getModulePalletStock,
  getRecentInput,
} = require('../utils/dashboardHelper');

const getAdminDashboard = async () => {
  const [
    activeStock,
    totalBins,
    occupiedBins,
    palletTypes,
    inboundPlanningSum,
    outboundPlanningSum,
    dailyThroughput,
    storageBins,
    recentInput,
  ] = await Promise.all([
    // 1. Active stock (pallet AVAILABLE)
    prisma.pallet.count({ where: { status: 'AVAILABLE', deleted_at: null } }),

    // 2. Total bins
    prisma.storageBin.count({ where: { deleted_at: null } }),

    // 3. Occupied bins (stock > 0)
    prisma.storageBin.count({ where: { stock: { gt: 0 }, deleted_at: null } }),

    // 4. Semua pallet type untuk hitung attention
    prisma.palletType.findMany({ where: { deleted_at: null } }),

    // 5. Inbound planning (SUM quantity dari detail yang plannya APPROVE)
    prisma.inboundPlanDetail.aggregate({
      _sum: { quantity: true },
      where: { plan: { status: 'APPROVE', deleted_at: null } },
    }),

    // 6. Outbound planning
    prisma.outboundPlanDetail.aggregate({
      _sum: { quantity: true },
      where: { plan: { status: 'APPROVE', deleted_at: null } },
    }),

    // 7. Daily throughput (7 hari, semua operator)
    getDailyThroughput(),

    // 8. Storage bin utilization (5 teratas)
    prisma.storageBin.findMany({
      where: { deleted_at: null },
      include: { warehouse_area: true },
      orderBy: { stock: 'desc' },
      take: 5,
    }),

    // 9. Recent input (10 terbaru, semua operator)
    getRecentInput(null, 10),
  ]);

  // Hitung attention: pallet type dengan stok < 20% dari total terdaftar
  const attentionItems = await Promise.all(
    palletTypes.map(async (pt) => {
      const [available, total] = await Promise.all([
        prisma.pallet.count({ where: { id_pallet_type: pt.id_pallet_type, status: 'AVAILABLE', deleted_at: null } }),
        prisma.pallet.count({ where: { id_pallet_type: pt.id_pallet_type, deleted_at: null } }),
      ]);
      return total > 0 && available < total * 0.2;
    })
  );
  const attentionCount = attentionItems.filter(Boolean).length;

  const utilizationPercent = totalBins > 0
    ? Math.round((occupiedBins / totalBins) * 100)
    : 0;

  const binUtilization = storageBins.map((bin) => ({
    bin_number: bin.bin_number,
    warehouse_area: bin.warehouse_area?.warehouse_area_name || null,
    stock: bin.stock,
    max_quantity: bin.max_quantity,
    utilization_percent: bin.max_quantity > 0
      ? Math.round((bin.stock / bin.max_quantity) * 100)
      : 0,
  }));

  return {
    role: 'ADMIN',
    stats: {
      active_stock: activeStock,
      utilization_percent: utilizationPercent,
      attention_items: attentionCount,
      outbound_planning: outboundPlanningSum._sum.quantity || 0,
      inbound_planning: inboundPlanningSum._sum.quantity || 0,
    },
    daily_throughput: dailyThroughput,
    storage_bin_utilization: binUtilization,
    recent_input: recentInput,
  };
};

const getSupervisorDashboard = async () => {
  const startOfWeek = getStartOfWeek();

  const [
    receivingPlansThisWeek,
    outboundPlansThisWeek,
    waitingInbound,
    waitingOutbound,
    rejectedInbound,
    rejectedOutbound,
    dailyThroughput,
    modulePalletStock,
  ] = await Promise.all([
    // 1. Inbound plans dibuat minggu ini
    prisma.inboundPlan.count({
      where: { created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 2. Outbound plans dibuat minggu ini
    prisma.outboundPlan.count({
      where: { created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 3a. Inbound waiting approval
    prisma.inboundPlan.count({
      where: { status: 'WAITING_APPROVAL', deleted_at: null },
    }),
    // 3b. Outbound waiting approval
    prisma.outboundPlan.count({
      where: { status: 'WAITING_APPROVAL', deleted_at: null },
    }),
    // 4a. Inbound rejected minggu ini
    prisma.inboundPlan.count({
      where: { status: 'REJECT', created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 4b. Outbound rejected minggu ini
    prisma.outboundPlan.count({
      where: { status: 'REJECT', created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 5. Daily throughput
    getDailyThroughput(),
    // 6. Module pallet stock
    getModulePalletStock(),
  ]);

  // Recent documents: gabung inbound + outbound, ambil 10 terbaru
  const [inboundDocs, outboundDocs] = await Promise.all([
    prisma.inboundPlan.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { user: true },
    }),
    prisma.outboundPlan.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: 10,
      include: { user: true },
    }),
  ]);

  const allDocs = [
    ...inboundDocs.map((d) => ({
      type: 'INBOUND',
      document_number: d.document_number,
      planning_month: d.planning_month,
      status: d.status,
      created_by: d.user?.nama || null,
      created_at: d.created_at,
    })),
    ...outboundDocs.map((d) => ({
      type: 'OUTBOUND',
      document_number: d.document_number,
      planning_month: d.planning_month,
      status: d.status,
      created_by: d.user?.nama || null,
      created_at: d.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return {
    role: 'SUPERVISOR',
    stats: {
      receiving_plans_this_week: receivingPlansThisWeek,
      outbound_plans_this_week: outboundPlansThisWeek,
      waiting_for_review: waitingInbound + waitingOutbound,
      rejected_this_week: rejectedInbound + rejectedOutbound,
    },
    daily_throughput: dailyThroughput,
    module_pallet_stock: modulePalletStock,
    recent_documents: allDocs,
  };
};

const getOperatorDashboard = async (userId) => {
  const startOfWeek = getStartOfWeek();

  const [
    inboundWOD,
    outboundWOD,
    totalTodo,
    totalCompleted,
    dailyThroughput,
    recentInput,
  ] = await Promise.all([
    // 1. Inbound actual & planning minggu ini milik operator ini
    prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true, total_planning: true },
      where: {
        work_order: {
          id_user: userId,
          work_order_category: 'INBOUND',
          date: { gte: startOfWeek },
          deleted_at: null,
        },
      },
    }),
    // 2. Outbound actual & planning minggu ini milik operator ini
    prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true, total_planning: true },
      where: {
        work_order: {
          id_user: userId,
          work_order_category: 'OUTBOUND',
          date: { gte: startOfWeek },
          deleted_at: null,
        },
      },
    }),
    // 3. Total TO_DO (keseluruhan, bukan harian)
    prisma.workOrder.count({
      where: { id_user: userId, status: 'TO_DO', deleted_at: null },
    }),
    // 4. Total DONE (keseluruhan, bukan harian)
    prisma.workOrder.count({
      where: { id_user: userId, status: 'DONE', deleted_at: null },
    }),
    // 5. Daily throughput milik operator ini
    getDailyThroughput(userId),
    // 6. Recent input milik operator ini
    getRecentInput(userId, 10),
  ]);

  return {
    role: 'OPERATOR',
    stats: {
      inbound_actual: inboundWOD._sum.actual_pcs || 0,
      inbound_planning: inboundWOD._sum.total_planning || 0,
      outbound_actual: outboundWOD._sum.actual_pcs || 0,
      outbound_planning: outboundWOD._sum.total_planning || 0,
      total_todo: totalTodo,
      total_completed: totalCompleted,
    },
    daily_throughput: dailyThroughput,
    recent_input: recentInput,
  };
};

const getBoDDashboard = async ({ page = 1, limit = 10 } = {}) => {
  const startOfWeek = getStartOfWeek();

  const [
    inboundWOD,
    outboundWOD,
    rejectedInbound,
    rejectedOutbound,
    dailyThroughput,
    modulePalletStock,
    totalDocuments,
  ] = await Promise.all([
    // 1. Inbound actual & planning minggu ini (semua operator)
    prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true, total_planning: true },
      where: {
        work_order: {
          work_order_category: 'INBOUND',
          date: { gte: startOfWeek },
          deleted_at: null,
        },
      },
    }),
    // 2. Outbound actual & planning minggu ini (semua operator)
    prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true, total_planning: true },
      where: {
        work_order: {
          work_order_category: 'OUTBOUND',
          date: { gte: startOfWeek },
          deleted_at: null,
        },
      },
    }),
    // 3a. Inbound rejected minggu ini
    prisma.inboundPlan.count({
      where: { status: 'REJECT', created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 3b. Outbound rejected minggu ini
    prisma.outboundPlan.count({
      where: { status: 'REJECT', created_at: { gte: startOfWeek }, deleted_at: null },
    }),
    // 4. Daily throughput semua operator
    getDailyThroughput(),
    // 5. Module pallet stock
    getModulePalletStock(),
    // 6. Hitung total dokumen untuk pagination
    Promise.all([
      prisma.inboundPlan.count({ where: { deleted_at: null } }),
      prisma.outboundPlan.count({ where: { deleted_at: null } }),
    ]),
  ]);

  const totalDocs = totalDocuments[0] + totalDocuments[1];
  const skip = (page - 1) * limit;

  const inboundActual = inboundWOD._sum.actual_pcs || 0;
  const inboundPlanning = inboundWOD._sum.total_planning || 0;
  const outboundActual = outboundWOD._sum.actual_pcs || 0;
  const outboundPlanning = outboundWOD._sum.total_planning || 0;
  const difference = (inboundPlanning + outboundPlanning) - (inboundActual + outboundActual);

  // All documents planning (gabung inbound + outbound, dengan pagination yang lebih optimal)
  const [inboundDocs, outboundDocs] = await Promise.all([
    prisma.inboundPlan.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: skip + limit,
      include: { user: true },
    }),
    prisma.outboundPlan.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      take: skip + limit,
      include: { user: true },
    }),
  ]);

  const allDocs = [
    ...inboundDocs.map((d) => ({
      type: 'INBOUND',
      document_number: d.document_number,
      planning_month: d.planning_month,
      status: d.status,
      created_by: d.user?.nama || null,
      created_at: d.created_at,
    })),
    ...outboundDocs.map((d) => ({
      type: 'OUTBOUND',
      document_number: d.document_number,
      planning_month: d.planning_month,
      status: d.status,
      created_by: d.user?.nama || null,
      created_at: d.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(skip, skip + limit);

  return {
    role: 'BOD',
    stats: {
      inbound_actual: inboundActual,
      inbound_planning: inboundPlanning,
      outbound_actual: outboundActual,
      outbound_planning: outboundPlanning,
      difference,
      rejected_this_week: rejectedInbound + rejectedOutbound,
    },
    daily_throughput: dailyThroughput,
    module_pallet_stock: modulePalletStock,
    all_documents_planning: {
      data: allDocs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total_items: totalDocs,
        total_pages: Math.ceil(totalDocs / limit),
      },
    },
  };
};

module.exports = {
  getAdminDashboard,
  getSupervisorDashboard,
  getOperatorDashboard,
  getBoDDashboard,
};
