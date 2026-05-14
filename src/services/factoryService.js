const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllFactories = async () => {
  return await prisma.factory.findMany({
    orderBy: { id_factory: 'asc' }
  })
};

const getFactoryById = async (id) => {
  const factory = await prisma.factory.findUnique({
    where: { id_factory: id }
  });
  if (!factory) throw new AppError('Factory tidak ditemukan', 404);
  return factory;
};

const createFactory = async (data) => {
  const { factory_number, factory_name, factory_email, factory_address } = data;
  if (!factory_number || !factory_name || !factory_email || !factory_address) {
    throw new AppError('Semua field wajib diisi', 400);
  }

  const exists = await prisma.factory.findFirst({ where: { factory_number } });
  if (exists) throw new AppError('Factory dengan nomor tersebut sudah ada', 400);

  return await prisma.factory.create({
    data: {
      factory_number,
      factory_name,
      factory_email,
      factory_address
    }
  });
};

const updateFactory = async (id, data) => {
  const { factory_number, factory_name, factory_email, factory_address } = data;

  const factory = await prisma.factory.findUnique({ where: { id_factory: id } });
  if (!factory) throw new AppError('Factory tidak ditemukan', 404);

  if (factory_number && factory_number !== factory.factory_number) {
    const exists = await prisma.factory.findFirst({ where: { factory_number } });
    if (exists) throw new AppError('Factory dengan nomor tersebut sudah ada', 400);
  }

  return await prisma.factory.update({
    where: { id_factory: id },
    data: {
      factory_number: factory_number || factory.factory_number,
      factory_name: factory_name || factory.factory_name,
      factory_email: factory_email || factory.factory_email,
      factory_address: factory_address || factory.factory_address
    }
  });
};

const deleteFactory = async (id) => {
  const factory = await prisma.factory.findUnique({ where: { id_factory: id } });
  if (!factory) throw new AppError('Factory tidak ditemukan', 404);

  await prisma.factory.delete({ where: { id_factory: id } });
};

module.exports = {
  getAllFactories,
  getFactoryById,
  createFactory,
  updateFactory,
  deleteFactory
}