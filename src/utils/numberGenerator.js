const prisma = require('../config/prisma');

/**
 * Fungsi untuk membuat nomor dokumen otomatis.
 * Format: [PREFIX]-[MMYYYY]-[XXXX]
 * Contoh: RCV.PLAN-052024-0001
 */
const generateDocumentNumber = async (type, planDate) => {
  let prefixText = '';
  let modelName = '';
  let columnName = '';

  switch (type) {
    case 'INBOUND':
      prefixText = 'RCV.PLAN';
      modelName = 'inboundPlan';
      columnName = 'document_number';
      break;
    case 'OUTBOUND':
      prefixText = 'SHP.PLAN';
      modelName = 'outboundPlan';
      columnName = 'document_number';
      break;
    case 'WORK_ORDER':
      prefixText = 'WO';
      modelName = 'workOrder';
      columnName = 'work_order_number';
      break;
    default:
      throw new Error('Tipe dokumen tidak valid');
  }

  // 1. Ambil Bulan (2 digit) dan Tahun (4 digit) dari planDate
  const month = (planDate.getMonth() + 1).toString().padStart(2, '0');
  const year = planDate.getFullYear().toString();
  
  // 2. Format: RCV.PLAN-052024-
  const dateStr = `${month}${year}`;
  const searchPrefix = `${prefixText}-${dateStr}-`;

  // 3. Cari dokumen terakhir di bulan dan tahun yang sama
  const lastDocument = await prisma[modelName].findFirst({
    where: {
      [columnName]: { startsWith: searchPrefix }
    },
    orderBy: {
      [columnName]: 'desc'
    }
  });

  // 4. Hitung nomor urut
  let newSequenceNumber = 1;
  if (lastDocument) {
    // Ambil 4 digit terakhir dari string, contoh: "RCV.PLAN-052024-0005" -> "0005"
    const lastSequenceStr = lastDocument[columnName].slice(-4);
    newSequenceNumber = parseInt(lastSequenceStr, 10) + 1;
  }

  const formattedSequence = newSequenceNumber.toString().padStart(4, '0');
  
  return `${searchPrefix}${formattedSequence}`;
};

module.exports = { generateDocumentNumber };