const prisma = require('../config/prisma');
const { formatDatetime } = require('../utils/excelHelper');

const getInventoryData = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    deleted_at: null,
    OR: [
      { pallet_name: { contains: search, mode: 'insensitive' } },
      { pallet_category: { contains: search, mode: 'insensitive' } }
    ]
  };

  const [palletTypes, totalItems] = await prisma.$transaction([
    prisma.palletType.findMany({
      where: whereCondition,
      skip: parseInt(skip),
      take: parseInt(limit),
    }),
    prisma.palletType.count({ where: whereCondition })
  ]);

  const inboundWODGroup = await prisma.workOrderDetail.groupBy({
    by: ['id_pallet_type'],
    _sum: { actual_pcs: true },
    where: {
      work_order: {
        work_order_category: 'INBOUND',
        deleted_at: null,
      }
    }
  });

  const outboundWODGroup = await prisma.workOrderDetail.groupBy({
    by: ['id_pallet_type'],
    _sum: { actual_pcs: true },
    where: {
      work_order: {
        work_order_category: 'OUTBOUND',
        deleted_at: null,
      }
    }
  });

  const totalStockGroup = await prisma.pallet.groupBy({
    by: ['id_pallet_type'],
    _count: { id_pallet: true },
    where: {
      status: 'AVAILABLE',
      deleted_at: null,
    }
  });

  const inboundMap = inboundWODGroup.reduce((acc, curr) => {
    acc[curr.id_pallet_type] = curr._sum.actual_pcs || 0;
    return acc;
  }, {});

  const outboundMap = outboundWODGroup.reduce((acc, curr) => {
    acc[curr.id_pallet_type] = curr._sum.actual_pcs || 0;
    return acc;
  }, {});

  const stockMap = totalStockGroup.reduce((acc, curr) => {
    acc[curr.id_pallet_type] = curr._count.id_pallet || 0;
    return acc;
  }, {});

  const items = palletTypes.map((pt) => {
    const inbound = inboundMap[pt.id_pallet_type] || 0;
    const outbound = outboundMap[pt.id_pallet_type] || 0;
    const totalStock = stockMap[pt.id_pallet_type] || 0;

    let stock_level;
    if (totalStock === 0) {
      stock_level = 'OUT_OF_STOCK';
    } else if (totalStock <= 10) {
      stock_level = 'LOW_STOCK';
    } else {
      stock_level = 'IN_STOCK';
    }

    return {
      id_pallet_type: pt.id_pallet_type,
      pallet_category: pt.pallet_category,
      pallet_name: pt.pallet_name,
      inbound,
      outbound,
      total_stock: totalStock,
      stock_level
    };
  });

  const totalAvailable = await prisma.pallet.count({
    where: { status: 'AVAILABLE', deleted_at: null }
  });
  const totalShipped = await prisma.pallet.count({
    where: { status: 'SHIPPED', deleted_at: null }
  });

  return {
    stats: {
      total_available: totalAvailable,
      total_shipped: totalShipped,
      total_all: totalAvailable + totalShipped
    },
    items,
    meta: {
      totalItems: totalItems,
      itemsPerPage: parseInt(limit),
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / limit)
    }
  };
};

const getInventoryLocations = async ({ page = 1, limit = 10, search = '', id_warehouse_area = '' }) => {
  const skip = (page - 1) * limit;

  const binWhere = {
    stock: { gt: 0 },
    deleted_at: null,
  };

  if (id_warehouse_area) {
    binWhere.id_warehouse_area = parseInt(id_warehouse_area, 10);
  }

  const storageBins = await prisma.storageBin.findMany({
    where: binWhere,
    include: {
      warehouse_area: { select: { warehouse_area_name: true } }
    }
  });

  const binNumbers = storageBins.map(b => b.bin_number);
  const binMap = storageBins.reduce((acc, curr) => {
    acc[curr.bin_number] = curr.warehouse_area?.warehouse_area_name || 'Unknown';
    return acc;
  }, {});

  const palletCounts = await prisma.pallet.groupBy({
    by: ['id_pallet_type', 'location'],
    where: {
      status: 'AVAILABLE',
      deleted_at: null,
      location: { in: binNumbers }
    },
    _count: { id_pallet: true }
  });

  const palletTypeIds = [...new Set(palletCounts.map(pc => pc.id_pallet_type))];
  const allPalletTypes = await prisma.palletType.findMany({
    where: { id_pallet_type: { in: palletTypeIds }, deleted_at: null },
    select: { id_pallet_type: true, pallet_name: true, pallet_category: true }
  });

  const ptMap = allPalletTypes.reduce((acc, curr) => {
    acc[curr.id_pallet_type] = curr;
    return acc;
  }, {});

  const rows = [];
  for (const pc of palletCounts) {
    const palletType = ptMap[pc.id_pallet_type];
    if (!palletType) continue;

    if (search) {
      const term = search.toLowerCase();
      if (
        !palletType.pallet_name.toLowerCase().includes(term) &&
        !palletType.pallet_category.toLowerCase().includes(term)
      ) {
        continue;
      }
    }

    const warehouseAreaName = binMap[pc.location];
    const locationLabel = `${warehouseAreaName} / ${pc.location}`;

    rows.push({
      id_pallet_type: pc.id_pallet_type,
      pallet_name: palletType.pallet_name,
      pallet_category: palletType.pallet_category,
      stock: pc._count.id_pallet,
      bin_number: pc.location,
      warehouse_area_name: warehouseAreaName,
      location: locationLabel
    });
  }

  rows.sort((a, b) => a.location.localeCompare(b.location));

  const totalItems = rows.length;
  const paginatedRows = rows.slice(skip, skip + parseInt(limit));

  return {
    data: paginatedRows,
    meta: {
      totalItems,
      itemsPerPage: parseInt(limit),
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalItems / parseInt(limit))
    }
  };
};

const getStockLevelExportData = async () => {
  const palletTypes = await prisma.palletType.findMany({
    where: { deleted_at: null },
    orderBy: { pallet_name: 'asc' },
  });

  const stockGroup = await prisma.pallet.groupBy({
    by: ['id_pallet_type'],
    where: { status: 'AVAILABLE', deleted_at: null },
    _count: { id_pallet: true },
  });

  const stockMap = stockGroup.reduce((acc, curr) => {
    acc[curr.id_pallet_type] = curr._count.id_pallet;
    return acc;
  }, {});

  const reportDate = formatDatetime(new Date());

  return palletTypes.map((pt, index) => {
    const totalStock = stockMap[pt.id_pallet_type] || 0;

    let stockLevel;
    if (totalStock === 0) stockLevel = 'OUT_OF_STOCK';
    else if (totalStock <= 10) stockLevel = 'LOW_STOCK';
    else stockLevel = 'IN_STOCK';

    return [index + 1, pt.pallet_name, pt.pallet_category, stockLevel, totalStock, reportDate];
  });
};

const getLocationsExportData = async (idPalletType) => {
  const palletType = await prisma.palletType.findFirst({
    where: { id_pallet_type: idPalletType, deleted_at: null },
  });

  if (!palletType) return null;

  const palletCounts = await prisma.pallet.groupBy({
    by: ['location'],
    where: {
      id_pallet_type: idPalletType,
      status: 'AVAILABLE',
      deleted_at: null,
      location: { not: null },
    },
    _count: { id_pallet: true },
    orderBy: { location: 'asc' },
  });

  const reportDate = formatDatetime(new Date());

  const rows = palletCounts.map((pc, index) => [
    index + 1,
    palletType.pallet_name,
    palletType.pallet_category,
    pc._count.id_pallet,
    pc.location,
    reportDate,
  ]);

  return { palletName: palletType.pallet_name, rows };
};

module.exports = {
  getInventoryData,
  getInventoryLocations,
  getStockLevelExportData,
  getLocationsExportData,
};
