const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllPallets = async () => {
  return await prisma.pallet.findMany({
    include: {
      pallet_type: {
        select: { pallet_category: true, pallet_name: true }
      }
    },
    orderBy: { id_pallet: 'asc' }
  });
};

const getPalletById = async (id) => {
  const pallet = await prisma.pallet.findUnique({
    where: { id_pallet: id },
    include: { pallet_type: true }
  });
  if (!pallet) throw new AppError('Pallet tidak ditemukan', 404);
  return pallet;
};

const createPallet = async (data) => {
  const { rfid_tag, id_pallet_type, location, status } = data;

  if (!rfid_tag || !id_pallet_type) {
    throw new AppError('rfid_tag dan id_pallet_type wajib diisi', 400);
  }

  const typeId = parseInt(id_pallet_type, 10);
  if (isNaN(typeId)) {
    throw new AppError('id_pallet_type harus berupa angka', 400);
  }

  const typeExists = await prisma.palletType.findUnique({ where: { id_pallet_type: typeId } });
  if (!typeExists) {
    throw new AppError(`Pallet Type dengan id ${id_pallet_type} tidak ditemukan`, 404);
  }

  const rfidExists = await prisma.pallet.findFirst({ where: { rfid_tag } });
  if (rfidExists) {
    throw new AppError(`RFID "${rfid_tag}" sudah digunakan`, 400);
  }

  return await prisma.pallet.create({
    data: {
      rfid_tag,
      id_pallet_type: typeId,
      location: location || UNASSIGNED,
      status: status || 'AVAILABLE'
    }
  })
};

const updatePallet = async (id, data) => {
  const { rfid_tag, id_pallet_type, location, status } = data;

  const pallet = await prisma.pallet.findUnique({ where: { id_pallet: id } });
  if (!pallet) throw new AppError('Pallet tidak ditemukan', 404);

  if (rfid_tag && rfid_tag !== pallet.rfid_tag) {
    const rfidExists = await prisma.pallet.findUnique({ where: { rfid_tag } });
    if (rfidExists) throw new AppError(`RFID Tag '${rfid_tag}' sudah digunakan oleh Pallet lain`, 400);
  }

  let typeId = pallet.id_pallet_type;
  if (id_pallet_type) {
    typeId = parseInt(id_pallet_type, 10);
    const typeExists = await prisma.palletType.findUnique({ where: { id_pallet_type: typeId } });
    if (!typeExists) throw new AppError('Pallet Type tidak ditemukan', 404);
  }

  return await prisma.pallet.update({
    where: { id_pallet: id },
    data: {
      rfid_tag: rfid_tag || pallet.rfid_tag,
      id_pallet_type: typeId,
      location: location || pallet.location,
      status: status || pallet.status
    }
  });
};

const deletePallet = async (id) => {
  const pallet = await prisma.pallet.findUnique({ where: { id_pallet: id } });
  if (!pallet) throw new AppError('Pallet tidak ditemukan', 404);

  await prisma.pallet.delete({ where: { id_pallet: id } });
};

module.exports = { getAllPallets, getPalletById, createPallet, updatePallet, deletePallet };