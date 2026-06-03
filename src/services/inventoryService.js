const prisma = require('../config/prisma');

const getInventoryData = async ({ page = 1, limit = 10, search = '' }) => {
  const skip = (page - 1) * limit;

  // 1. Ambil data Pallet Type dengan search & pagination
  const palletTypes = await prisma.palletType.findMany({
    where: {
      deleted_at: null,
      OR: [
        { pallet_name: { contains: search, mode: 'insensitive' } },
        { pallet_category: { contains: search, mode: 'insensitive' } }
      ]
    },
    skip: parseInt(skip),
    take: parseInt(limit),
  });

  // Hitung total data untuk pagination
  const totalItems = await prisma.palletType.count({
    where: {
      deleted_at: null,
      OR: [
        { pallet_name: { contains: search, mode: 'insensitive' } },
        { pallet_category: { contains: search, mode: 'insensitive' } }
      ]
    }
  });

  // 2. Kalkulasi data Inbound, Outbound, Total Stock per Pallet Type
  const items = await Promise.all(palletTypes.map(async (pt) => {
    // Hitung inbound dari WorkOrderDetail INBOUND
    const inboundWOD = await prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true },
      where: {
        id_pallet_type: pt.id_pallet_type,
        work_order: {
          work_order_category: 'INBOUND',
          deleted_at: null,
        }
      }
    });

    // Hitung outbound dari WorkOrderDetail OUTBOUND
    const outboundWOD = await prisma.workOrderDetail.aggregate({
      _sum: { actual_pcs: true },
      where: {
        id_pallet_type: pt.id_pallet_type,
        work_order: {
          work_order_category: 'OUTBOUND',
          deleted_at: null,
        }
      }
    });

    // Hitung total stock AVAILABLE
    const totalStock = await prisma.pallet.count({
      where: {
        id_pallet_type: pt.id_pallet_type,
        status: 'AVAILABLE',
        deleted_at: null,
      }
    });

    return {
      id_pallet_type: pt.id_pallet_type,
      pallet_category: pt.pallet_category,
      pallet_name: pt.pallet_name,
      inbound: inboundWOD._sum.actual_pcs || 0,
      outbound: outboundWOD._sum.actual_pcs || 0,
      total_stock: totalStock
    };
  }));

  // 3. Stat cards global
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
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total_items: totalItems,
      total_pages: Math.ceil(totalItems / limit)
    }
  };
};

module.exports = {
  getInventoryData
};
