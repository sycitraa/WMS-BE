const multer = require('multer');
const AppError = require('../utils/AppError');

// Konfigurasi storage di memory buffer
const storage = multer.memoryStorage();

// Filter file hanya untuk ekstensi yang diizinkan (.csv, .xlsx)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.originalname.endsWith('.csv') ||
    file.originalname.endsWith('.xlsx')
  ) {
    cb(null, true);
  } else {
    cb(new AppError('Format file tidak didukung. Gunakan file .csv atau .xlsx', 400), false);
  }
};

// Konfigurasi upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

module.exports = upload;
