const express = require('express');
const userController = require('../controllers/userController');
const { validateBody } = require('../middlewares/validateMiddleware');
const { createUserSchema, updateUserSchema } = require('../validations/userValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Master Data User
 *     description: Endpoint API untuk Master Data User
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua daftar user dengan pagination dan filter
 *     tags: [Master Data User]
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
 *         description: Pencarian berdasarkan nama atau email user.
 *       - in: query
 *         name: id_role
 *         schema:
 *           type: integer
 *         description: Filter berdasarkan ID Role (1=ADMIN, 2=SUPERVISOR, dst).
 *     responses:
 *       200:
 *         description: Data user berhasil diambil.
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
 *                   example: Data users berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_user:
 *                             type: integer
 *                             example: 1
 *                           nama:
 *                             type: string
 *                             example: Admin WMS
 *                           email:
 *                             type: string
 *                             format: email
 *                             example: admin@wms.com
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: 2026-04-27T08:00:00.000Z
 *                           role:
 *                             type: object
 *                             properties:
 *                               id_role:
 *                                 type: integer
 *                                 example: 1
 *                               nama_role:
 *                                 type: string
 *                                 example: ADMIN
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                           example: 25
 *                         itemsPerPage:
 *                           type: integer
 *                           example: 10
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/', userController.getProfiles);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Tambah user baru
 *     tags: [Master Data User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama
 *               - email
 *               - password
 *               - id_role
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Supervisor
 *               email:
 *                 type: string
 *                 format: email
 *                 example: supervisor@wms.com
 *               password:
 *                 type: string
 *                 example: password123
 *               id_role:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: User berhasil dibuat.
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
 *                   example: User berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                       example: 10
 *                     nama:
 *                       type: string
 *                       example: Supervisor
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: supervisor@wms.com
 *                     id_role:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Data tidak valid atau email sudah digunakan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', validateBody(createUserSchema), userController.createNewUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update data user
 *     tags: [Master Data User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user yang akan diperbarui.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *                 example: Supervisor Gudang
 *               email:
 *                 type: string
 *                 format: email
 *                 example: supervisor@wms.com
 *               id_role:
 *                 type: integer
 *                 example: 3
 *               password:
 *                 type: string
 *                 example: passwordBaru123
 *     responses:
 *       200:
 *         description: User berhasil diperbarui.
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
 *                   example: User berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_user:
 *                       type: integer
 *                       example: 10
 *                     nama:
 *                       type: string
 *                       example: Supervisor Gudang
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: supervisor@wms.com
 *                     id_role:
 *                       type: integer
 *                       example: 3
 *       400:
 *         description: Data tidak valid.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: User tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', validateBody(updateUserSchema), userController.updateExistingUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Hapus user
 *     tags: [Master Data User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user yang akan dihapus.
 *     responses:
 *       200:
 *         description: User berhasil dihapus.
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
 *                   example: User berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: User tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', userController.removeUser);

module.exports = router;