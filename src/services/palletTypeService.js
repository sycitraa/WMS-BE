const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllPalletTypes = async () => {
  return await prisma.palletType.findMany({
    orderBy: { id_pallet_type: 'asc' }
  });
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

module.exports = { getAllPalletTypes, getPalletTypeById, createPalletType, updatePalletType, deletePalletType };