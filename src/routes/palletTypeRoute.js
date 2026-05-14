const express = require('express');
const palletTypeController = require('../controllers/palletTypeController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Pallet Type
 *     description: Endpoint API untuk Master Data Type Pallet
 */

/**
 * @swagger
 * /api/pallet-types:
 *   get:
 *     summary: Ambil semua pallet type dengan pagination dan filtering
 *     tags: [Master Data Pallet Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman untuk pagination (default 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman (default 10)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan nama pallet type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori pallet
 *     responses:
 *       200:
 *         description: Data pallet type berhasil diambil.
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
 *                   example: Data Pallet Type berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_pallet_type:
 *                         type: integer
 *                         example: 1
 *                       pallet_category:
 *                         type: string
 *                         example: Standart
 *                       pallet_name:
 *                         type: string
 *                         example: T1B
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalItems:
 *                       type: integer
 *                       example: 25
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/', palletTypeController.getPalletTypes);

/**
 * @swagger
 * /api/pallet-types/{id}:
 *   get:
 *     summary: Ambil detail pallet type berdasarkan ID
 *     tags: [Master Data Pallet Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet type.
 *     responses:
 *       200:
 *         description: Detail pallet type berhasil diambil.
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
 *                   example: Detail Pallet Type berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     pallet_category:
 *                       type: string
 *                       example: Standart
 *                     pallet_name:
 *                       type: string
 *                       example: T1B
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet Type tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', palletTypeController.getPalletTypeDetail);

/**
 * @swagger
 * /api/pallet-types:
 *   post:
 *     summary: Tambah pallet type baru
 *     tags: [Master Data Pallet Type]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pallet_category
 *               - pallet_name
 *             properties:
 *               pallet_category:
 *                 type: string
 *                 example: Standart
 *               pallet_name:
 *                 type: string
 *                 example: T1B
 *     responses:
 *       201:
 *         description: Pallet type berhasil ditambahkan.
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
 *                   example: Pallet Type berhasil ditambahkan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     pallet_category:
 *                       type: string
 *                       example: Standart
 *                     pallet_name:
 *                       type: string
 *                       example: T1B
 *       400:
 *         description: Data tidak valid atau nama pallet sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', palletTypeController.addPalletType);

/**
 * @swagger
 * /api/pallet-types/{id}:
 *   put:
 *     summary: Update data pallet type
 *     tags: [Master Data Pallet Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet type.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pallet_category:
 *                 type: string
 *                 example: Standart
 *               pallet_name:
 *                 type: string
 *                 example: T1B
 *     responses:
 *       200:
 *         description: Pallet type berhasil diperbarui.
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
 *                   example: Pallet Type berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     pallet_category:
 *                       type: string
 *                       example: Standart
 *                     pallet_name:
 *                       type: string
 *                       example: T1B
 *       400:
 *         description: Data tidak valid atau nama pallet sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet Type tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', palletTypeController.updatePalletTypeData);

/**
 * @swagger
 * /api/pallet-types/{id}:
 *   delete:
 *     summary: Hapus pallet type
 *     tags: [Master Data Pallet Type]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID pallet type.
 *     responses:
 *       200:
 *         description: Pallet type berhasil dihapus.
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
 *                   example: Pallet Type berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Pallet Type tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', palletTypeController.removePalletType);

module.exports = router;

