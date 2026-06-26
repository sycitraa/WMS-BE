const { parseImportFile, getExpectedHeaders } = require('../utils/importHelper');
const { processImport } = require('../services/importService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const AppError = require('../utils/AppError');
const ExcelJS = require('exceljs');

const importData = async (req, res) => {
  try {
    const { moduleType } = req.params;
    const file = req.file;

    if (!file) {
      throw new AppError('File tidak ditemukan', 400);
    }

    const rows = await parseImportFile(file, moduleType);
    const result = await processImport(moduleType, rows);

    return successResponse(res, 200, `Import selesai. ${result.success_count} data berhasil, ${result.failed_count} data gagal.`, result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(res, error.statusCode, error.message);
    }
    console.error('Import Error:', error);
    return errorResponse(res, 500, 'Terjadi kesalahan pada server saat import data');
  }
};

const downloadTemplate = async (req, res) => {
  try {
    const { moduleType } = req.params;
    const expectedHeaders = getExpectedHeaders(moduleType);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template');

    worksheet.columns = expectedHeaders.map(header => ({
      header,
      key: header,
      width: 20
    }));

    // Styling header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Tambah contoh data
    if (moduleType === 'pallet-type') {
      worksheet.addRow({ pallet_name: 'T1B', pallet_category: 'Standard' });
    } else if (moduleType === 'pallet') {
      worksheet.addRow({ rfid_tag: 'RFID-12345', pallet_type_name: 'T1B', location: 'UNASSIGNED', status: 'AVAILABLE' });
    } else if (moduleType === 'factory') {
      worksheet.addRow({ factory_number: 'F-001', factory_name: 'PT Maju Jaya', factory_email: 'maju@email.com', factory_address: 'Jl. Industri No. 1' });
    } else if (moduleType === 'destination') {
      worksheet.addRow({ destination_number: 'D-001', destination_name: 'Gudang Utama', destination_email: 'gudang@email.com', destination_address: 'Jl. Logistik No. 10' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Template_Import_${moduleType}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return errorResponse(res, 500, 'Gagal mengunduh template');
  }
};

module.exports = {
  importData,
  downloadTemplate
};
