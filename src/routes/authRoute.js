const express = require("express");
const authController = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: API untuk manajemen sesi pengguna (Login, Logout, Refresh Token)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login ke sistem WMS
 *     description: Autentikasi pengguna dengan email dan password untuk mendapatkan JWT Access Token dan Refresh Token (disimpan di httpOnly Cookie).
 *     tags: [Authentication]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@wms.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil. Access Token dikembalikan di response body, Refresh Token disimpan di httpOnly Cookie.
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
 *                   example: Login berhasil
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT Access Token (valid 8 jam)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       type: object
 *                       properties:
 *                         id_user:
 *                           type: integer
 *                           example: 1
 *                         nama:
 *                           type: string
 *                           example: Admin WMS
 *                         email:
 *                           type: string
 *                           example: admin@wms.com
 *                         role:
 *                           type: string
 *                           example: Admin
 *       400:
 *         description: Email atau password belum diisi.
 *       401:
 *         description: Kredensial tidak valid.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout dari sistem WMS
 *     description: Menghapus refresh token dan mengakhiri sesi user.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout berhasil.
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
 *                   example: Logout berhasil
 *       400:
 *         description: Refresh token tidak ditemukan.
 *       401:
 *         description: Token tidak valid atau sudah logout.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post("/logout", verifyToken, authController.logout);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     description: Menggunakan Refresh Token untuk mendapatkan Access Token baru (tanpa harus login ulang).
 *     tags: [Authentication]
 *     security: []
 *     responses:
 *       200:
 *         description: Access token berhasil di-refresh.
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
 *                   example: Access token berhasil di-refresh
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       description: JWT Access Token baru (valid 8 jam)
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Refresh token tidak ditemukan atau telah kedaluwarsa.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post("/refresh", authController.refreshToken);

module.exports = router;
