const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const AppError = require('../utils/AppError');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id_user: true,
      nama: true,
      email: true,
      created_at: true,
      role: { select: { id_role: true, nama_role: true } }
    },
    orderBy: { id_user: 'asc' }
  });
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