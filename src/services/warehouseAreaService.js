const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllWarehouseAreas = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';

  const skip = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { warehouse_area_number: { contains: search, mode: 'insensitive' } },
      { warehouse_area_name: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.warehouseArea.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_warehouse_area: 'asc' }
    }),
    prisma.warehouseArea.count({ where: whereCondition })
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages
    }
  };
};

const createArea = async (data) => {
  const { warehouse_area_number, warehouse_area_name } = data;

  if (!warehouse_area_number || !warehouse_area_name) {
    throw new AppError('warehouse area number dan warehouse_area_name harus diisi', 400);
  }

  const exists = await prisma.warehouseArea.findFirst({
    where: { warehouse_area_number: warehouse_area_number }
  });

  if (exists) throw new AppError('warehouse area number sudah digunakan', 400);

  return await prisma.warehouseArea.create({
    data: { warehouse_area_number, warehouse_area_name }
  });
};

const updateArea = async (id, data) => {
  const { warehouse_area_number, warehouse_area_name } = data;

  const area = await prisma.warehouseArea.findUnique({ where: { id_warehouse_area: id } });
  if (!area) throw new AppError('Warehouse area tidak ditemukan', 404);

  if (warehouse_area_number && warehouse_area_number !== area.warehouse_area_number) {
    const exists = await prisma.warehouseArea.findFirst({ where: { warehouse_area_number } });
    if (exists) throw new AppError('Warehouse area number sudah digunakan', 400);
  }

  return await prisma.warehouseArea.update({
    where: { id_warehouse_area: id },
    data: {
      warehouse_area_number: warehouse_area_number || area.warehouse_area_number,
      warehouse_area_name: warehouse_area_name || area.warehouse_area_name
    }
  });
}

const deleteArea = async (id) => {
  const area = await prisma.warehouseArea.findUnique({ where: { id_warehouse_area: id } });
  if (!area) throw new AppError('Warehouse area tidak ditemukan', 404);

  await prisma.warehouseArea.delete({ where: { id_warehouse_area: id } });
}

module.exports = { getAllWarehouseAreas, createArea, updateArea, deleteArea };