const express = require('express');
const warehouseAreaController = require('../controllers/warehouseAreaController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Warehouse Area
 *     description: Endpoint API untuk Master Data Warehouse Area
 */

/**
 * @swagger
 * /api/warehouse-areas:
 *   get:
 *     summary: Ambil semua area gudang dengan pagination dan filtering
 *     tags: [Master Data Warehouse Area]
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
 *         description: Pencarian berdasarkan nomor atau nama area gudang.
 *     responses:
 *       200:
 *         description: Data warehouse area berhasil diambil.
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
 *                   example: Data Warehouse Area berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_warehouse_area:
 *                         type: integer
 *                         example: 1
 *                       warehouse_area_number:
 *                         type: string
 *                         example: WH-AREA-001
 *                       warehouse_area_name:
 *                         type: string
 *                         example: Transit
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 15
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 */
router.get('/', warehouseAreaController.getAreas);

/**
 * @swagger
 * /api/warehouse-areas:
 *   post:
 *     summary: Tambah area baru
 *     tags: [Master Data Warehouse Area]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouse_area_number:
 *                 type: string
 *                 example: "WH-AREA-001"
 *               warehouse_area_name:
 *                 type: string
 *                 example: "Transit"
 *     responses:
 *       201:
 *         description: Berhasil
 */
router.post('/', warehouseAreaController.addArea);

/**
 * @swagger
 * /api/warehouse-areas/{id}:
 *   put:
 *     summary: Update area gudang
 *     tags: [Master Data Warehouse Area]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID area gudang
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               warehouse_area_number:
 *                 type: string
 *                 example: "WH-AREA-001"
 *               warehouse_area_name:
 *                 type: string
 *                 example: "Transit"
 *     responses:
 *       200:
 *         description: Berhasil
 *       400:
 *         description: Data tidak valid.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Area gudang tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', warehouseAreaController.updateArea);

/**
 * @swagger
 * /api/warehouse-areas/{id}:
 *   delete:
 *     summary: Hapus area gudang
 *     tags: [Master Data Warehouse Area]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID area gudang
 *     responses:
 *       200:
 *         description: Berhasil
 *       400:
 *         description: Data tidak valid.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Area gudang tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', warehouseAreaController.deleteArea);

module.exports = router;