const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getAllUsers = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';

  const skip = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition.OR = [
      { nama: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      select: {
        id_user: true,
        nama: true,
        email: true,
        created_at: true,
        role: { select: { id_role: true, nama_role: true } }
      },
      orderBy: { id_user: 'asc' }
    }),
    prisma.user.count({ where: whereCondition })
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

const createUser = async (data) => {
  const { nama, email, password, id_role } = data;

  // Cek duplikasi email
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AppError('Email sudah digunakan', 400);

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  return await prisma.user.create({
    data: { nama, email, password: hashedPassword, id_role },
    select: { id_user: true, nama: true, email: true, id_role: true }
  });
};

const updateUser = async (id, data) => {
  const { nama, email, id_role, password } = data;

  // Cek user ada atau tidak
  const user = await prisma.user.findUnique({ where: { id_user: id } });
  if (!user) throw new AppError('User tidak ditemukan', 404);

  // Cek duplikasi email jika email diubah
  if (email && email !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new AppError('Email sudah digunakan oleh user lain', 400);
  }

  const updateData = { nama, email, id_role };

  // Jika password diisi, hash ulang
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  return await prisma.user.update({
    where: { id_user: id },
    data: updateData,
    select: { id_user: true, nama: true, email: true, id_role: true }
  });
};

const deleteUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id_user: id } });
  if (!user) throw new AppError('User tidak ditemukan', 404);

  return await prisma.user.delete({ where: { id_user: id } });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };