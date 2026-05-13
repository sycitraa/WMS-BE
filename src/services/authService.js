const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const login = async (email, password) => {
  // 1. Cari user di database beserta data Role-nya
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });

  // 2. Jika email tidak ditemukan
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  // 3. Bandingkan password input dengan hash di database
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  // 4. Susun data yang akan diselipkan ke dalam Token JWT
  const payload = {
    id_user: user.id_user,
    email: user.email,
    id_role: user.id_role,
    nama_role: user.role.nama_role, 
  };

  // 5. Generate Access Token (Masa berlaku 8 jam)
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  // 6. Generate Refresh Token (Masa berlaku 7 hari)
  const refreshTokenExpiresIn = 7 * 24 * 60 * 60 * 1000; // 7 hari dalam milliseconds
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // 7. Simpan refresh token ke database
  await prisma.refreshToken.create({
    data: {
      id_user: user.id_user,
      token: refreshToken,
      expires_at: new Date(Date.now() + refreshTokenExpiresIn),
    },
  });

  // 8. Kembalikan access token, refresh token, dan data user (tanpa password!)
  return {
    accessToken,
    refreshToken,
    user: {
      id_user: user.id_user,
      nama: user.nama,
      email: user.email,
      role: user.role.nama_role,
    }
  };
};

const logout = async (userId, refreshToken) => {
  // 1. Hapus refresh token dari database berdasarkan user ID dan token
  const deletedToken = await prisma.refreshToken.deleteMany({
    where: {
      id_user: userId,
      token: refreshToken,
    },
  });

  // 2. Jika token tidak ditemukan di database
  if (deletedToken.count === 0) {
    throw new AppError('Token tidak valid atau sudah logout', 401);
  }

  return {
    message: 'Logout berhasil',
  };
};

const refreshAccessToken = async (refreshToken) => {
  // 1. Verifikasi refresh token dari request
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Refresh token tidak valid atau telah kedaluwarsa', 401);
  }

  // 2. Cek apakah refresh token ada di database
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: { role: true } } },
  });

  if (!tokenRecord) {
    throw new AppError('Refresh token tidak ditemukan atau sudah logout', 401);
  }

  // 3. Cek apakah token sudah expired
  if (new Date() > tokenRecord.expires_at) {
    // Hapus token yang expired
    await prisma.refreshToken.delete({
      where: { id_refresh_token: tokenRecord.id_refresh_token },
    });
    throw new AppError('Refresh token telah kedaluwarsa. Silakan login ulang', 401);
  }

  // 4. Buat payload baru dengan data user terbaru
  const user = tokenRecord.user;
  const newPayload = {
    id_user: user.id_user,
    email: user.email,
    id_role: user.id_role,
    nama_role: user.role.nama_role,
  };

  // 5. Generate access token baru
  const newAccessToken = jwt.sign(newPayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return {
    accessToken: newAccessToken,
  };
};

module.exports = {
  login,
  logout,
  refreshAccessToken,
};