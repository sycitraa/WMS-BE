const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const getAllBins = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const search = query.search || '';
  const id_warehouse_area = query.id_warehouse_area || '';

  const skip = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition.bin_number = { contains: search, mode: 'insensitive' };
  }

  if (id_warehouse_area) {
    whereCondition.id_warehouse_area = parseInt(id_warehouse_area, 10);
  }

  const [data, totalItems] = await prisma.$transaction([
    prisma.storageBin.findMany({
      where: whereCondition,
      skip: skip,
      take: limit,
      include: {
        warehouse_area: {
          select: { warehouse_area_number: true, warehouse_area_name: true }
        }
      },
      orderBy: { id_storage_bins: 'asc' }
    }),
    prisma.storageBin.count({ where: whereCondition })
  ]);

  return {
    data,
    meta: {
      totalItems,
      itemPerpage: limit,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit)
    }
  }
};

const getBinById = async (id) => {
  const bin = await prisma.storageBin.findUnique({
    where: { id_storage_bins: id },
    include: { warehouse_area: true }
  });
  if (!bin) throw new AppError('Storage Bin tidak ditemukan', 404);
  return bin;
};

const createBin = async (data) => {
  const { bin_number, id_warehouse_area, max_quantity } = data;

  // 1. VALIDASI: Pastikan data tidak kosong
  if (!bin_number || !id_warehouse_area) {
    throw new AppError('bin_number dan id_warehouse_area wajib diisi', 400);
  }

  // 2. VALIDASI: Pastikan id_warehouse_area berupa angka
  const areaId = parseInt(id_warehouse_area, 10);
  if (isNaN(areaId)) {
    throw new AppError('id_warehouse_area harus berupa angka yang valid', 400);
  }

  const area = await prisma.warehouseArea.findUnique({ where: { id_warehouse_area: areaId } });
  if (!area) throw new AppError('Warehouse Area tidak ditemukan', 404);

  const exists = await prisma.storageBin.findFirst({ where: { bin_number } });
  if (exists) throw new AppError('Nomor Storage Bin sudah terdaftar', 400);

  return await prisma.storageBin.create({
    data: {
      bin_number,
      id_warehouse_area: areaId,
      max_quantity: max_quantity ? parseInt(max_quantity, 10) : 50,
      stock: 0
    }
  });
};

const updateBin = async (id, data) => {
  const { bin_number, id_warehouse_area, max_quantity, stock } = data;

  const bin = await prisma.storageBin.findUnique({ where: { id_storage_bins: id } });
  if (!bin) throw new AppError('Storage Bin tidak ditemukan', 404);

  // 3. VALIDASI UPDATE: Jika nomor rak diubah, pastikan tidak bentrok dengan rak lain
  if (bin_number && bin_number !== bin.bin_number) {
    const exists = await prisma.storageBin.findFirst({ where: { bin_number } });
    if (exists) throw new AppError('Nomor Storage Bin sudah digunakan oleh Bin lain', 400);
  }

  // Validasi stock tidak boleh melebihi max_quantity
  const finalMaxQuantity = max_quantity !== undefined ? parseInt(max_quantity, 10) : bin.max_quantity;
  const finalStock = stock !== undefined ? parseInt(stock, 10) : bin.stock;

  if (finalStock > finalMaxQuantity) {
    throw new AppError(`Gagal: Jumlah Stock (${finalStock}) melebihi Kapasitas Maksimal rak (${finalMaxQuantity}).`, 400);
  }

  if (finalStock < 0) {
    throw new AppError('Gagal: Jumlah Stock tidak boleh kurang dari 0 (negatif).', 400);
  }

  return await prisma.storageBin.update({
    where: { id_storage_bins: id },
    data: {
      bin_number,
      id_warehouse_area: id_warehouse_area ? parseInt(id_warehouse_area, 10) : undefined,
      max_quantity: finalMaxQuantity,
      stock: finalStock
    }
  });
};

const deleteBin = async (id) => {
  const bin = await prisma.storageBin.findUnique({ where: { id_storage_bins: id } });
  if (!bin) throw new AppError('Storage Bin tidak ditemukan', 404);

  await prisma.storageBin.delete({ where: { id_storage_bins: id } });
};

module.exports = { getAllBins, getBinById, createBin, updateBin, deleteBin };