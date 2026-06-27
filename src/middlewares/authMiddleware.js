const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/responseFormatter');

const verifyToken = (req, res, next) => {
  let token;

  // 1. Cek Header Authorization (format: Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Jika tidak ada token
  if (!token) {
    return errorResponse(res, 401, 'Akses ditolak. Anda harus login terlebih dahulu.');
  }

  try {
    // 3. Verifikasi token menggunakan JWT_SECRET di .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Masukkan data user yang terenkripsi di token ke dalam request
    // Sehingga di Controller nanti kita bisa tahu siapa yang sedang akses
    req.user = decoded;
    
    next(); // Lanjut ke proses berikutnya
  } catch (error) {
    return errorResponse(res, 401, 'Sesi tidak valid atau telah kedaluwarsa. Silakan login ulang.');
  }
};

module.exports = verifyToken;