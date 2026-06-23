const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: API untuk mendapatkan data agregasi inventory pallet
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Mendapatkan data inventory (agregasi per pallet type) dengan stock level
 *     description: Mengembalikan data jumlah pallet available, shipped, beserta tabel stok masuk/keluar per kategori pallet type. Field stock_level menunjukkan kondisi stok (IN_STOCK jika >10, LOW_STOCK jika <=10, OUT_OF_STOCK jika 0).
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword pencarian berdasarkan nama pallet atau kategori
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman (pagination)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil data inventory
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total_available:
 *                           type: integer
 *                           example: 4
 *                         total_shipped:
 *                           type: integer
 *                           example: 0
 *                         total_all:
 *                           type: integer
 *                           example: 4
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_pallet_type:
 *                             type: integer
 *                             example: 1
 *                           pallet_name:
 *                             type: string
 *                             example: T1B
 *                           pallet_category:
 *                             type: string
 *                             example: Standard
 *                           inbound:
 *                             type: integer
 *                             example: 120
 *                           outbound:
 *                             type: integer
 *                             example: 20
 *                           total_stock:
 *                             type: integer
 *                             example: 4
 *                           stock_level:
 *                             type: string
 *                             enum: [IN_STOCK, LOW_STOCK, OUT_OF_STOCK]
 *                             example: LOW_STOCK
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 5
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       500:
 *         description: Internal Server Error
 */
router.get('/', inventoryController.getInventory);

/**
 * @swagger
 * /api/inventory/locations:
 *   get:
 *     summary: Mendapatkan data inventory per lokasi (storage bin)
 *     description: Mengembalikan breakdown stock pallet berdasarkan lokasi storage bin. Setiap baris menampilkan tipe pallet, jumlah stock, dan lokasi bin (format "Nama Area / Nomor Bin").
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Filter berdasarkan nama pallet atau kategori
 *       - in: query
 *         name: id_warehouse_area
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID Warehouse Area
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman (pagination)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data lokasi inventory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil data lokasi inventory
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_pallet_type:
 *                             type: integer
 *                             example: 1
 *                           pallet_name:
 *                             type: string
 *                             example: T1B
 *                           pallet_category:
 *                             type: string
 *                             example: Standard
 *                           stock:
 *                             type: integer
 *                             example: 4000
 *                           bin_number:
 *                             type: string
 *                             example: 001-01
 *                           warehouse_area_name:
 *                             type: string
 *                             example: Transit Incoming Area
 *                           location:
 *                             type: string
 *                             example: "Transit Incoming Area / 001-01"
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 4
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 1
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       500:
 *         description: Internal Server Error
 */
router.get('/locations', inventoryController.getInventoryLocations);

/**
 * @swagger
 * /api/inventory/export/stock-level:
 *   get:
 *     summary: Export laporan Stock Level ke file Excel (.xlsx)
 *     description: Mengunduh laporan stok pallet per kategori dalam format Excel. Hanya dapat diakses oleh role BOD. Nama file otomatis menyertakan tanggal download.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File Excel berhasil diunduh
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       403:
 *         description: Akses ditolak (role bukan BOD)
 *       500:
 *         description: Gagal mengirim file laporan
 */
router.get('/export/stock-level', verifyToken, authorizeRoles('BOD'), inventoryController.exportStockLevel);

/**
 * @swagger
 * /api/inventory/export/locations/{id_pallet_type}:
 *   get:
 *     summary: Export laporan Location per Pallet Type ke file Excel (.xlsx)
 *     description: Mengunduh laporan lokasi pallet tertentu berdasarkan id_pallet_type. Hanya dapat diakses oleh role BOD. Nama file otomatis menyertakan nama pallet dan tanggal download.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_pallet_type
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Pallet Type yang ingin di-export lokasinya
 *     responses:
 *       200:
 *         description: File Excel berhasil diunduh
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parameter id_pallet_type wajib diisi
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       403:
 *         description: Akses ditolak (role bukan BOD)
 *       404:
 *         description: Pallet type tidak ditemukan
 *       500:
 *         description: Gagal mengirim file laporan
 */
router.get('/export/locations/:id_pallet_type', verifyToken, authorizeRoles('BOD'), inventoryController.exportLocations);

module.exports = router;

