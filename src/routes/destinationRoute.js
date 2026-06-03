const express = require('express');
const destinationController = require('../controllers/destinationController');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Destination
 *     description: Endpoint API untuk Master Data Destination
 */

/**
 * @swagger
 * /api/destinations:
 *   get:
 *     summary: Ambil semua destination dengan pagination dan filtering
 *     tags: [Master Data Destination]
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
 *         description: Pencarian berdasarkan nomor, nama, email, atau alamat destination.
 *     responses:
 *       200:
 *         description: Data destination berhasil diambil.
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
 *                   example: Data Destination berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_destination:
 *                         type: integer
 *                         example: 1
 *                       destination_number:
 *                         type: string
 *                         example: DST-001
 *                       destination_name:
 *                         type: string
 *                         example: PT Tujuan Satu
 *                       destination_email:
 *                         type: string
 *                         format: email
 *                         example: tujuan1@example.com
 *                       destination_address:
 *                         type: string
 *                         example: Jl. Industri No. 10, Cikarang
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
router.get('/', authorizeRoles('ADMIN', 'SUPERVISOR'), destinationController.getDestinations);

/**
 * @swagger
 * /api/destinations/{id}:
 *   get:
 *     summary: Ambil detail destination berdasarkan ID
 *     tags: [Master Data Destination]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID destination.
 *     responses:
 *       200:
 *         description: Detail destination berhasil diambil.
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
 *                   example: Detail Destination berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_destination:
 *                       type: integer
 *                       example: 1
 *                     destination_number:
 *                       type: string
 *                       example: DST-001
 *                     destination_name:
 *                       type: string
 *                       example: PT Tujuan Satu
 *                     destination_email:
 *                       type: string
 *                       format: email
 *                       example: tujuan1@example.com
 *                     destination_address:
 *                       type: string
 *                       example: Jl. Industri No. 10, Cikarang
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Destination tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', authorizeRoles('ADMIN', 'SUPERVISOR'), destinationController.getDestinationDetail);

/**
 * @swagger
 * /api/destinations:
 *   post:
 *     summary: Tambah destination baru
 *     tags: [Master Data Destination]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destination_number
 *               - destination_name
 *               - destination_email
 *               - destination_address
 *             properties:
 *               destination_number:
 *                 type: string
 *                 example: DST-001
 *               destination_name:
 *                 type: string
 *                 example: PT Tujuan Satu
 *               destination_email:
 *                 type: string
 *                 format: email
 *                 example: tujuan1@example.com
 *               destination_address:
 *                 type: string
 *                 example: Jl. Industri No. 10, Cikarang
 *     responses:
 *       201:
 *         description: Destination berhasil ditambahkan.
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
 *                   example: Destination berhasil ditambahkan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_destination:
 *                       type: integer
 *                       example: 1
 *                     destination_number:
 *                       type: string
 *                       example: DST-001
 *                     destination_name:
 *                       type: string
 *                       example: PT Tujuan Satu
 *                     destination_email:
 *                       type: string
 *                       format: email
 *                       example: tujuan1@example.com
 *                     destination_address:
 *                       type: string
 *                       example: Jl. Industri No. 10, Cikarang
 *       400:
 *         description: Data tidak valid atau destination number sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', authorizeRoles('ADMIN'), destinationController.addDestination);

/**
 * @swagger
 * /api/destinations/{id}:
 *   put:
 *     summary: Update destination
 *     tags: [Master Data Destination]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID destination.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               destination_number:
 *                 type: string
 *                 example: DST-001
 *               destination_name:
 *                 type: string
 *                 example: PT Tujuan Satu Update
 *               destination_email:
 *                 type: string
 *                 format: email
 *                 example: tujuanupdate@example.com
 *               destination_address:
 *                 type: string
 *                 example: Jl. Industri No. 11, Cikarang
 *     responses:
 *       200:
 *         description: Destination berhasil diperbarui.
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
 *                   example: Destination berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_destination:
 *                       type: integer
 *                       example: 1
 *                     destination_number:
 *                       type: string
 *                       example: DST-001
 *                     destination_name:
 *                       type: string
 *                       example: PT Tujuan Satu Update
 *                     destination_email:
 *                       type: string
 *                       format: email
 *                       example: tujuanupdate@example.com
 *                     destination_address:
 *                       type: string
 *                       example: Jl. Industri No. 11, Cikarang
 *       400:
 *         description: Data tidak valid atau destination number sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Destination tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', authorizeRoles('ADMIN'), destinationController.updateDestinationData);

/**
 * @swagger
 * /api/destinations/{id}:
 *   delete:
 *     summary: Hapus destination
 *     tags: [Master Data Destination]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID destination.
 *     responses:
 *       200:
 *         description: Destination berhasil dihapus.
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
 *                   example: Destination berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Destination tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', authorizeRoles('ADMIN'), destinationController.deleteDestination);

module.exports = router;