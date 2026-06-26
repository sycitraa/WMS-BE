const { parse } = require('csv-parse/sync');
const ExcelJS = require('exceljs');
const AppError = require('./AppError');

/**
 * Mendapatkan konfigurasi validasi kolom per module
 */
const getExpectedHeaders = (moduleType) => {
  switch (moduleType) {
    case 'pallet-type':
      return ['pallet_name', 'pallet_category'];
    case 'pallet':
      return ['rfid_tag', 'pallet_type_name', 'location', 'status'];
    case 'factory':
      return ['factory_number', 'factory_name', 'factory_email', 'factory_address'];
    case 'destination':
      return ['destination_number', 'destination_name', 'destination_email', 'destination_address'];
    default:
      throw new Error(`Module ${moduleType} tidak didukung`);
  }
};

/**
 * Validasi array header dari file dengan expected header
 */
const validateHeaders = (actualHeaders, expectedHeaders) => {
  const missingHeaders = expectedHeaders.filter(h => !actualHeaders.includes(h));
  if (missingHeaders.length > 0) {
    throw new AppError(`Header kolom tidak sesuai. Kolom yang hilang: ${missingHeaders.join(', ')}. Kolom yang diharapkan: ${expectedHeaders.join(', ')}`, 400);
  }
};

/**
 * Parse file import dan jadikan array of object
 */
const parseImportFile = async (file, moduleType) => {
  const expectedHeaders = getExpectedHeaders(moduleType);
  let rows = [];

  const isCsv = file.mimetype === 'text/csv' || file.originalname.endsWith('.csv');
  const isXlsx = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.originalname.endsWith('.xlsx');

  if (isCsv) {
    const fileContent = file.buffer.toString('utf-8');
    rows = parse(fileContent, {
      columns: true, // auto mapping baris 1 sebagai object keys
      skip_empty_lines: true,
      trim: true
    });
    
    if (rows.length > 0) {
      validateHeaders(Object.keys(rows[0]), expectedHeaders);
    }
  } else if (isXlsx) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    const worksheet = workbook.worksheets[0]; // baca sheet pertama

    if (!worksheet) {
      throw new AppError('File Excel tidak memiliki worksheet', 400);
    }

    let headers = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Baris 1 adalah header
        row.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value ? cell.value.toString().trim() : '';
        });
        // bersihkan header undefined jika ada
        headers = headers.filter(h => h !== undefined);
        validateHeaders(headers, expectedHeaders);
      } else {
        // Baris data
        const rowData = {};
        expectedHeaders.forEach(expectedHeader => {
          const colIndex = headers.indexOf(expectedHeader);
          if (colIndex !== -1) {
            const cell = row.getCell(colIndex + 1);
            // exceljs handle value date, boolean, dll, kita convert ke string
            rowData[expectedHeader] = cell.value ? cell.value.toString().trim() : '';
          } else {
            rowData[expectedHeader] = '';
          }
        });
        
        // Cek jika baris tidak sepenuhnya kosong
        const isEmptyRow = Object.values(rowData).every(v => v === '');
        if (!isEmptyRow) {
          rows.push(rowData);
        }
      }
    });
  } else {
    throw new AppError('Format file tidak didukung. Gunakan file .csv atau .xlsx', 400);
  }

  // Validasi max row limit
  if (rows.length > 1000) {
    throw new AppError(`Jumlah baris melebihi batas maksimal 1000. File Anda memiliki ${rows.length} baris.`, 400);
  }
  
  if (rows.length === 0) {
    throw new AppError('File tidak berisi data (hanya header atau kosong)', 400);
  }

  return rows;
};

module.exports = {
  getExpectedHeaders,
  parseImportFile
};
