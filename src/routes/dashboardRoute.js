const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: API untuk mendapatkan data dashboard sesuai role pengguna
 */

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Mendapatkan data dashboard (berbeda per role)
 *     description: |
 *       Mengembalikan data dashboard yang disesuaikan dengan role user yang sedang login.
 *       - **ADMIN**: 5 stat cards, daily throughput, storage bin utilization, recent input (semua operator)
 *       - **SUPERVISOR**: 4 stat cards, daily throughput, module pallet stock, recent documents
 *       - **OPERATOR**: 4 stat cards, daily throughput, recent input (milik sendiri)
 *       - **BOD**: 4 stat cards, daily throughput, module pallet stock, all documents planning
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman (hanya relevan untuk BOD - all documents planning)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman (hanya relevan untuk BOD)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data dashboard
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       403:
 *         description: Role tidak dikenali
 *       500:
 *         description: Internal Server Error
 */
router.get('/', dashboardController.getDashboard);

module.exports = router;
