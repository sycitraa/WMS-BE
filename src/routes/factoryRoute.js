const express = require('express');
const factoryController = require('../controllers/factoryController');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { validateBody } = require('../middlewares/validateMiddleware');
const { createFactorySchema, updateFactorySchema } = require('../validations/factoryValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data Factory
 *     description: Endpoint API untuk Master Data Factory
 */

/**
 * @swagger
 * /api/factories:
 *   get:
 *     summary: Ambil semua factory dengan pagination dan filtering
 *     tags: [Master Data Factory]
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
 *         description: Pencarian berdasarkan nomor, nama, email, atau alamat factory.
 *     responses:
 *       200:
 *         description: Data factory berhasil diambil.
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
 *                   example: Data Factory berhasil diambil
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_factory:
 *                         type: integer
 *                         example: 1
 *                       factory_number:
 *                         type: string
 *                         example: FAC-001
 *                       factory_email:
 *                         type: string
 *                         format: email
 *                         example: factory1@example.com
 *                       factory_name:
 *                         type: string
 *                         example: Factory Satu
 *                       factory_address:
 *                         type: string
 *                         example: Jl. Industri No. 1, Bekasi
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
router.get('/', authorizeRoles('ADMIN', 'SUPERVISOR'), factoryController.getFactories);

/**
 * @swagger
 * /api/factories/{id}:
 *   get:
 *     summary: Ambil detail factory berdasarkan ID
 *     tags: [Master Data Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID factory.
 *     responses:
 *       200:
 *         description: Detail factory berhasil diambil.
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
 *                   example: Detail Factory berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factory:
 *                       type: integer
 *                       example: 1
 *                     factory_number:
 *                       type: string
 *                       example: FAC-001
 *                     factory_email:
 *                       type: string
 *                       format: email
 *                       example: factory1@example.com
 *                     factory_name:
 *                       type: string
 *                       example: Factory Satu
 *                     factory_address:
 *                       type: string
 *                       example: Jl. Industri No. 1, Bekasi
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Factory tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', authorizeRoles('ADMIN', 'SUPERVISOR'), factoryController.getFactoryDetail);

/**
 * @swagger
 * /api/factories:
 *   post:
 *     summary: Tambah factory baru
 *     tags: [Master Data Factory]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - factory_number
 *               - factory_email
 *               - factory_name
 *               - factory_address
 *             properties:
 *               factory_number:
 *                 type: string
 *                 example: FAC-001
 *               factory_email:
 *                 type: string
 *                 format: email
 *                 example: factory1@example.com
 *               factory_name:
 *                 type: string
 *                 example: Factory Satu
 *               factory_address:
 *                 type: string
 *                 example: Jl. Industri No. 1, Bekasi
 *     responses:
 *       201:
 *         description: Factory berhasil ditambahkan.
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
 *                   example: Factory berhasil ditambahkan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factory:
 *                       type: integer
 *                       example: 1
 *                     factory_number:
 *                       type: string
 *                       example: FAC-001
 *                     factory_email:
 *                       type: string
 *                       format: email
 *                       example: factory1@example.com
 *                     factory_name:
 *                       type: string
 *                       example: Factory Satu
 *                     factory_address:
 *                       type: string
 *                       example: Jl. Industri No. 1, Bekasi
 *       400:
 *         description: Data tidak valid atau factory number sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', authorizeRoles('ADMIN'), validateBody(createFactorySchema), factoryController.addFactory);

/**
 * @swagger
 * /api/factories/{id}:
 *   put:
 *     summary: Update factory
 *     tags: [Master Data Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID factory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               factory_number:
 *                 type: string
 *                 example: FAC-001
 *               factory_email:
 *                 type: string
 *                 format: email
 *                 example: factorybaru@example.com
 *               factory_name:
 *                 type: string
 *                 example: Factory Baru
 *               factory_address:
 *                 type: string
 *                 example: Jl. Industri No. 2, Bekasi
 *     responses:
 *       200:
 *         description: Factory berhasil diperbarui.
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
 *                   example: Factory berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_factory:
 *                       type: integer
 *                       example: 1
 *                     factory_number:
 *                       type: string
 *                       example: FAC-001
 *                     factory_email:
 *                       type: string
 *                       format: email
 *                       example: factorybaru@example.com
 *                     factory_name:
 *                       type: string
 *                       example: Factory Baru
 *                     factory_address:
 *                       type: string
 *                       example: Jl. Industri No. 2, Bekasi
 *       400:
 *         description: Data tidak valid atau factory number sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Factory tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', authorizeRoles('ADMIN'), validateBody(updateFactorySchema), factoryController.updateFactoryData);

/**
 * @swagger
 * /api/factories/{id}:
 *   delete:
 *     summary: Hapus factory
 *     tags: [Master Data Factory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID factory.
 *     responses:
 *       200:
 *         description: Factory berhasil dihapus.
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
 *                   example: Factory berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Factory tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', authorizeRoles('ADMIN'), factoryController.removeFactory);

module.exports = router;
