const express = require('express')
const palletController = require('../controllers/palletController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Pallet
 *     description: Endpoint API untuk Master Data Pallet
 */

/**
 * @swagger
 * /api/pallets:
 *   get:
 *     summary: Ambil semua data pallet dengan pagination dan filtering
 *     tags: [Master Data Pallet]
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
 *         description: Pencarian berdasarkan RFID tag atau lokasi.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter berdasarkan status pallet.
 *       - in: query
 *         name: id_pallet_type
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID pallet type.
 *     responses:
 *       200:
 *         description: Data pallet berhasil diambil.
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
 *                   example: Data Pallet berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_pallet:
 *                         type: integer
 *                         example: 1
 *                       rfid_tag:
 *                         type: string
 *                         example: "0123456789ABC"
 *                       id_pallet_type:
 *                         type: integer
 *                         example: 1
 *                       location:
 *                         type: string
 *                         example: "UNASSIGNED"
 *                       status:
 *                         type: string
 *                         example: "AVAILABLE"
 *                       pallet_type:
 *                         type: object
 *                         properties:
 *                           pallet_category:
 *                             type: string
 *                             example: "Standard"
 *                           pallet_name:
 *                             type: string
 *                             example: "T2F"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 120
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/', palletController.getPallets);

/**
 * @swagger
 * /api/pallets/{id}:
 *   get:
 *     summary: Ambil detail pallet berdasarkan ID
 *     tags: [Master Data Pallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet.
 *     responses:
 *       200:
 *         description: Detail pallet berhasil diambil.
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
 *                   example: Detail Pallet berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet:
 *                       type: integer
 *                       example: 1
 *                     rfid_tag:
 *                       type: string
 *                       example: "0123456789ABC"
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     location:
 *                       type: string
 *                       example: "UNASSIGNED"
 *                     status:
 *                       type: string
 *                       example: "AVAILABLE"
 *                     pallet_type:
 *                       type: object
 *                       properties:
 *                         id_pallet_type:
 *                           type: integer
 *                           example: 1
 *                         pallet_category:
 *                           type: string
 *                           example: "Standard"
 *                         pallet_name:
 *                           type: string
 *                           example: "T2F"
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', palletController.getPalletDetail);

/**
 * @swagger
 * /api/pallets:
 *   post:
 *     summary: Tambah pallet baru
 *     tags: [Master Data Pallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rfid_tag
 *               - id_pallet_type
 *             properties:
 *               rfid_tag:
 *                 type: string
 *                 example: "0123456789ABC"
 *               id_pallet_type:
 *                 type: integer
 *                 example: 1
 *               location:
 *                 type: string
 *                 example: "BIN-001"
 *               status:
 *                 type: string
 *                 example: "AVAILABLE"
 *     responses:
 *       201:
 *         description: Pallet berhasil ditambahkan.
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
 *                   example: Pallet berhasil ditambahkan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet:
 *                       type: integer
 *                       example: 1
 *                     rfid_tag:
 *                       type: string
 *                       example: "0123456789ABC"
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     location:
 *                       type: string
 *                       example: "BIN-001"
 *                     status:
 *                       type: string
 *                       example: "AVAILABLE"
 *       400:
 *         description: Data tidak valid atau RFID tag sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet Type tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', palletController.addPallet);

/**
 * @swagger
 * /api/pallets/{id}:
 *   put:
 *     summary: Update data pallet
 *     tags: [Master Data Pallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rfid_tag:
 *                 type: string
 *                 example: "0123456789ABC-UPDATED"
 *               id_pallet_type:
 *                 type: integer
 *                 example: 2
 *               location:
 *                 type: string
 *                 example: "BIN-002"
 *               status:
 *                 type: string
 *                 example: "SHIPPED"
 *     responses:
 *       200:
 *         description: Pallet berhasil diperbarui.
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
 *                   example: Pallet berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet:
 *                       type: integer
 *                       example: 1
 *                     rfid_tag:
 *                       type: string
 *                       example: "0123456789ABC-UPDATED"
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 2
 *                     location:
 *                       type: string
 *                       example: "BIN-002"
 *                     status:
 *                       type: string
 *                       example: "SHIPPED"
 *       400:
 *         description: Data tidak valid atau RFID tag sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet atau Pallet Type tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', palletController.updatePalletData);

/**
 * @swagger
 * /api/pallets/{id}:
 *   delete:
 *     summary: Hapus pallet
 *     tags: [Master Data Pallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet.
 *     responses:
 *       200:
 *         description: Pallet berhasil dihapus.
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
 *                   example: Pallet berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', palletController.deletePallet);

module.exports = router;

