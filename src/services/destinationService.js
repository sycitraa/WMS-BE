const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllDestinations = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';

  const skip = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { destination_number: { contains: search, mode: 'insensitive' } },
      { destination_name: { contains: search, mode: 'insensitive' } },
      { destination_email: { contains: search, mode: 'insensitive' } },
      { destination_address: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.destination.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      orderBy: { id_destination: 'asc' }
    }),
    prisma.destination.count({ where: whereCondition })
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

const getDestinationById = async (id) => {
  const destination = await prisma.destination.findUnique({
    where: { id_destination: id }
  });
  if (!destination) throw new AppError('Destination tidak ditemukan', 404);
  return destination;
};

const createDestination = async (data) => {
  const { destination_number, destination_name, destination_email, destination_address } = data;

  if (!destination_number || !destination_name || !destination_email || !destination_address) {
    throw new AppError('Semua field harus diisi', 400);
  }

  const exists = await prisma.destination.findFirst({
    where: { destination_number }
  });

  if (exists) {
    throw new AppError(`Destination Number ${destination_number} sudah digunakan`, 400);
  }

  return await prisma.destination.create({
    data: {
      destination_number,
      destination_name,
      destination_email,
      destination_address
    }
  });
};

const updateDestination = async (id, data) => {
  const { destination_number, destination_name, destination_email, destination_address } = data;

  const destination = await prisma.destination.findUnique({
    where: { id_destination: id }
  });
  if (!destination) throw new AppError('Destination tidak ditemukan', 404);

  if (destination_number && destination_number !== destination.destination_number) {
    const exists = await prisma.destination.findFirst({ where: { destination_number } });
    if (exists) throw new AppError(`Destination Number ${destination_number} sudah digunakan`, 400);
  }

  return await prisma.destination.update({
    where: { id_destination: id },
    data: {
      destination_number: destination_number || destination.destination_number,
      destination_name: destination_name || destination.destination_name,
      destination_email: destination_email || destination.destination_email,
      destination_address: destination_address || destination.destination_address
    }
  });
};

const deleteDestination = async (id) => {
  const destination = await prisma.destination.findUnique({
    where: { id_destination: id }
  });
  if (!destination) throw new AppError('Destination tidak ditemukan', 404);

  await prisma.destination.delete({
    where: { id_destination: id }
  });
}

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination
}
