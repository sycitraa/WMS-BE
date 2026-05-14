const { parse } = require('node:path');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllPalletTypes = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';
  const category = query.category || '';

  const skip = (page - 1) * limit;
  const whereCondition = {};

  if (search) {
    whereCondition.pallet_name = {
      contains: search,
      mode: 'insensitive'
    };
  }

  if (category) {
    whereCondition.pallet_category = category;
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.palletType.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_pallet_type: 'asc' }
    }),
    prisma.palletType.count({
      where: whereCondition
    })
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    data,
    meta: {
      totalItems,
      itemsPerPage: limit,
      currentPage: page,
      totalPages,
    }
  };
};

const getPalletTypeById = async (id) => {
  const type = await prisma.palletType.findUnique({
    where: { id_pallet_type: id }
  });
  if (!type) throw new AppError('Pallet Type tidak ditemukan', 404);
  return type;
};

const createPalletType = async (data) => {
  const { pallet_category, pallet_name } = data;

  if (!pallet_category || !pallet_name) {
    throw new AppError('pallet_category dan pallet_name wajib diisi', 400);
  }

  const exists = await prisma.palletType.findFirst({ where: { pallet_name } });
  if (exists) throw new AppError('Nama Pallet Type sudah digunakan', 400);

  return await prisma.palletType.create({
    data: { pallet_category, pallet_name }
  });
};

const updatePalletType = async (id, data) => {
  const { pallet_category, pallet_name } = data;

  const type = await prisma.palletType.findUnique({ where: { id_pallet_type: id } });
  if (!type) throw new AppError('Pallet Type tidak ditemukan', 404);

  if (pallet_name && pallet_name !== type.pallet_name) {
    const exists = await prisma.palletType.findFirst({ where: { pallet_name } });
    if (exists) throw new AppError(`pallet_name "${pallet_name}" sudah digunakan`, 400);
  }

  return await prisma.palletType.update({
    where: { id_pallet_type: id },
    data: {
      pallet_category: pallet_category || type.pallet_category,
      pallet_name: pallet_name || type.pallet_name
    }
  });
};

const deletePalletType = async (id) => {
  const type = await prisma.palletType.findUnique({ where: { id_pallet_type: id } });
  if (!type) throw new AppError('Pallet Type tidak ditemukan', 404);

  await prisma.palletType.delete({ where: { id_pallet_type: id } });
}

module.exports = {
  getAllPalletTypes,
  getPalletTypeById,
  createPalletType,
  updatePalletType,
  deletePalletType
};