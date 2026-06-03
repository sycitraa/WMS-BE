const prisma = require('../config/prisma');

// Helper: hitung awal minggu ini (Senin)
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon, ...
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // adjust ke Senin
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Helper: buat array 7 hari terakhir (termasuk hari ini)
const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

// Helper: format date ke 'YYYY-MM-DD'
const formatDate = (date) => date.toISOString().split('T')[0];

// Helper: Ambil daily throughput (semua operator atau per operator)
const getDailyThroughput = async (userId = null) => {
  const days = getLast7Days();
  const result = [];

  for (const day of days) {
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereBase = {
      scanned_at: { gte: day, lt: nextDay },
      ...(userId ? { id_user: userId } : {}),
    };

    const [inbound, outbound] = await Promise.all([
      prisma.rfidScan.count({
        where: {
          ...whereBase,
          work_order: { work_order_category: 'INBOUND' },
        },
      }),
      prisma.rfidScan.count({
        where: {
          ...whereBase,
          work_order: { work_order_category: 'OUTBOUND' },
        },
      }),
    ]);

    result.push({ date: formatDate(day), inbound, outbound });
  }

  return result;
};

// Helper: Ambil module pallet stock (dipakai Supervisor & BoD)
const getModulePalletStock = async () => {
  const palletTypes = await prisma.palletType.findMany({
    where: { deleted_at: null },
  });

  const stocks = await Promise.all(
    palletTypes.map(async (pt) => {
      const [currentStock, totalRegistered] = await Promise.all([
        prisma.pallet.count({
          where: { id_pallet_type: pt.id_pallet_type, status: 'AVAILABLE', deleted_at: null },
        }),
        prisma.pallet.count({
          where: { id_pallet_type: pt.id_pallet_type, deleted_at: null },
        }),
      ]);

      const percent = totalRegistered > 0
        ? Math.round((currentStock / totalRegistered) * 100)
        : 0;

      return {
        id_pallet_type: pt.id_pallet_type,
        pallet_name: pt.pallet_name,
        pallet_category: pt.pallet_category,
        current_stock: currentStock,
        total_registered: totalRegistered,
        percent,
      };
    })
  );

  // Sort ASC (yang hampir habis di atas)
  return stocks.sort((a, b) => a.percent - b.percent);
};

// Helper: Ambil recent input scan
const getRecentInput = async (userId = null, limit = 10) => {
  const scans = await prisma.rfidScan.findMany({
    where: userId ? { id_user: userId } : {},
    orderBy: { scanned_at: 'desc' },
    take: limit,
    include: {
      pallet: { include: { pallet_type: true } },
      work_order: { include: { details: { include: { storage_bins: true } } } },
      user: true,
    },
  });

  return scans.map((scan) => {
    // Cari bin dari work_order_detail
    const binNumber = scan.work_order?.details?.[0]?.storage_bins?.bin_number || null;
    return {
      scanned_at: scan.scanned_at,
      rfid_tag: scan.pallet?.rfid_tag || null,
      pallet_name: scan.pallet?.pallet_type?.pallet_name || null,
      operator_name: scan.user?.nama || null,
      bin_number: binNumber,
      work_order_number: scan.work_order?.work_order_number || null,
    };
  });
};

module.exports = {
  getStartOfWeek,
  getLast7Days,
  formatDate,
  getDailyThroughput,
  getModulePalletStock,
  getRecentInput,
};
