const { errorResponse } = require('../utils/responseFormatter');

// Fungsi ini menggunakan teknik 'closure' agar kita bisa memasukkan parameter role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Pastikan user sudah melewati verifyToken sebelumnya
    if (!req.user || !req.user.nama_role) {
      return errorResponse(res, 403, 'Akses dilarang. Data otorisasi tidak ditemukan.');
    }

    // Periksa apakah role user ada di dalam daftar role yang diizinkan
    if (!allowedRoles.includes(req.user.nama_role)) {
      return errorResponse(
        res, 
        403, 
        `Akses ditolak. Role ${req.user.nama_role} tidak memiliki izin untuk fitur ini.`
      );
    }

    next(); // Jika role sesuai, izinkan masuk!
  };
};

module.exports = authorizeRoles;