const express = require('express');
const storageBinController = require('../controllers/storageBinController');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Storage Bin
 *     description: Endpoint API untuk Master Data Storage Bin
 */

/**
 * @swagger
 * /api/storage-bins:
 *   get:
 *     summary: Ambil semua storage bin dengan pagination dan filtering
 *     tags: [Master Data Storage Bin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman.
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nomor bin.
 *       - in: query
 *         name: id_warehouse_area
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID warehouse area.
 *     responses:
 *       200:
 *         description: Data storage bin berhasil diambil.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Data Storage Bin berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_storage_bins:
 *                         type: integer
 *                         example: 1
 *                       bin_number:
 *                         type: string
 *                         example: BIN-001
 *                       id_warehouse_area:
 *                         type: integer
 *                         example: 1
 *                       max_quantity:
 *                         type: integer
 *                         example: 100
 *                       stock:
 *                         type: integer
 *                         example: 50
 *                       warehouse_area:
 *                         type: object
 *                         properties:
 *                           warehouse_area_number:
 *                             type: string
 *                             example: WH-AREA-001
 *                           warehouse_area_name:
 *                             type: string
 *                             example: Transit
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 40
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 4
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak diizinkan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get('/', authorizeRoles('ADMIN', 'SUPERVISOR'), storageBinController.getBins);

/**
 * @swagger
 * /api/storage-bins/{id}:
 *   get:
 *     summary: Ambil detail storage bin berdasarkan ID
 *     tags: [Master Data Storage Bin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID storage bin
 *     responses:
 *       200:
 *         description: Berhasil mengambil detail storage bin
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_storage_bins:
 *                   type: integer
 *                   example: 1
 *                 bin_number:
 *                   type: string
 *                   example: "BIN-001"
 *                 id_warehouse_area:
 *                   type: integer
 *                   example: 1
 *                 max_quantity:
 *                   type: integer
 *                   example: 100
 *                 stock:
 *                   type: integer
 *                   example: 50
 *                 warehouse_area:
 *                   type: object
 *                   properties:
 *                     id_warehouse_area:
 *                       type: integer
 *                       example: 1
 *                     warehouse_area_number:
 *                       type: string
 *                       example: WH-AREA-001
 *                     warehouse_area_name:
 *                       type: string
 *                       example: Transit
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak diizinkan
 *       404:
 *         description: Storage bin tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.get('/:id', authorizeRoles('ADMIN', 'SUPERVISOR'), storageBinController.getBinDetail);

/**
 * @swagger
 * /api/storage-bins:
 *   post:
 *     summary: Tambah storage bin baru
 *     tags: [Master Data Storage Bin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bin_number
 *               - id_warehouse_area
 *               - max_quantity
 *             properties:
 *               bin_number:
 *                 type: string
 *                 example: "BIN-001"
 *               id_warehouse_area:
 *                 type: integer
 *                 example: 1
 *               max_quantity:
 *                 type: integer
 *                 example: 100
 *               stock:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Storage bin berhasil ditambahkan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_storage_bins:
 *                   type: integer
 *                   example: 1
 *                 bin_number:
 *                   type: string
 *                   example: "BIN-001"
 *                 id_warehouse_area:
 *                   type: integer
 *                   example: 1
 *                 max_quantity:
 *                   type: integer
 *                   example: 100
 *                 stock:
 *                   type: integer
 *                   example: 0
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak diizinkan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.post('/', authorizeRoles('ADMIN'), storageBinController.addBin);

/**
 * @swagger
 * /api/storage-bins/{id}:
 *   put:
 *     summary: Update storage bin
 *     tags: [Master Data Storage Bin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID storage bin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bin_number:
 *                 type: string
 *                 example: "BIN-001"
 *               id_warehouse_area:
 *                 type: integer
 *                 example: 1
 *               max_quantity:
 *                 type: integer
 *                 example: 100
 *               stock:
 *                 type: integer
 *                 example: 50
 *     responses:
 *       200:
 *         description: Storage bin berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_storage_bins:
 *                   type: integer
 *                   example: 1
 *                 bin_number:
 *                   type: string
 *                   example: "BIN-001"
 *                 id_warehouse_area:
 *                   type: integer
 *                   example: 1
 *                 max_quantity:
 *                   type: integer
 *                   example: 100
 *                 stock:
 *                   type: integer
 *                   example: 50
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak diizinkan
 *       404:
 *         description: Storage bin tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.put('/:id', authorizeRoles('ADMIN'), storageBinController.updateBinData);

/**
 * @swagger
 * /api/storage-bins/{id}:
 *   delete:
 *     summary: Hapus storage bin
 *     tags: [Master Data Storage Bin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID storage bin
 *     responses:
 *       200:
 *         description: Storage bin berhasil dihapus
 *       401:
 *         description: Tidak terautentikasi
 *       403:
 *         description: Tidak diizinkan
 *       404:
 *         description: Storage bin tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan server
 */
router.delete('/:id', authorizeRoles('ADMIN'), storageBinController.removeBin);

module.exports = router;