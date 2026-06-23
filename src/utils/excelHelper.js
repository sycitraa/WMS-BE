const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');
const os = require('os');

const HEADER_STYLE = {
  font: { bold: true, color: { argb: 'FFFFFFFF' } },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E79' } },
  alignment: { vertical: 'middle', horizontal: 'center' },
};

const formatDatetime = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
};

const createTempExcelFile = async (sheetName, headers, rows, filename) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'WMS-JMP System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.addRow(headers);

  const headerRow = worksheet.getRow(1);
  headerRow.height = 20;
  Object.assign(headerRow, HEADER_STYLE);
  headerRow.eachCell((cell) => {
    cell.font = HEADER_STYLE.font;
    cell.fill = HEADER_STYLE.fill;
    cell.alignment = HEADER_STYLE.alignment;
  });

  rows.forEach((row) => worksheet.addRow(row));

  worksheet.columns.forEach((col, i) => {
    const contentLengths = rows.map((r) => String(r[i] ?? '').length);
    const maxLength = Math.max(headers[i]?.length || 0, ...contentLengths);
    col.width = Math.min(maxLength + 4, 50);
  });

  const tempPath = path.join(os.tmpdir(), `${filename}_${Date.now()}.xlsx`);
  await workbook.xlsx.writeFile(tempPath);

  return tempPath;
};

const getExcelFilename = (type) => {
  const today = new Date().toISOString().split('T')[0];
  return `WMS_${type}_${today}`;
};

const cleanupTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { createTempExcelFile, getExcelFilename, cleanupTempFile, formatDatetime };
