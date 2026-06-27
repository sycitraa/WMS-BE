const express = require('express');
const scanController = require('../controllers/scanController');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Scan Pallet
 *     description: Endpoint API untuk Operator melakukan scan/input pallet secara manual
 */

/**
 * @swagger
 * /api/scans:
 *   post:
 *     summary: Scan pallet (input manual rfid_tag)
 *     description: |
 *       Operator menginput rfid_tag pallet untuk mencatat penerimaan (INBOUND) atau pengiriman (OUTBOUND).
 *       Sistem otomatis melakukan 4 operasi dalam 1 transaksi:
 *       1. Catat log scan
 *       2. Update status & lokasi pallet
 *       3. Update stok Storage Bin
 *       4. Update actual_pcs di Work Order Detail
 *     tags: [Scan Pallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_work_order
 *               - rfid_tag
 *             properties:
 *               id_work_order:
 *                 type: integer
 *                 example: 1
 *                 description: ID Work Order yang sedang dikerjakan
 *               rfid_tag:
 *                 type: string
 *                 example: RFID-001
 *                 description: Tag RFID pallet yang di-scan (input manual)
 *     responses:
 *       201:
 *         description: Pallet berhasil di-scan.
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
 *                   example: Pallet berhasil di-scan
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_scan:
 *                       type: integer
 *                     id_pallet:
 *                       type: integer
 *                     id_work_order:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     scanned_at:
 *                       type: string
 *                       format: date-time
 *                     pallet:
 *                       type: object
 *                       properties:
 *                         rfid_tag:
 *                           type: string
 *                         status:
 *                           type: string
 *                           example: AVAILABLE
 *                         location:
 *                           type: string
 *                           example: BIN-A01
 *                         pallet_type:
 *                           type: object
 *                           properties:
 *                             pallet_name:
 *                               type: string
 *                             pallet_category:
 *                               type: string
 *                     work_order:
 *                       type: object
 *                       properties:
 *                         work_order_number:
 *                           type: string
 *                         work_order_category:
 *                           type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         nama:
 *                           type: string
 *       400:
 *         description: |
 *           Validasi gagal. Kemungkinan penyebab:
 *           - WO belum ON_PROGRESS atau sudah DONE
 *           - Pallet sudah di-scan sebelumnya
 *           - Tipe pallet tidak sesuai dengan WO
 *           - Target scan sudah tercapai
 *           - Storage Bin penuh (INBOUND) atau stok habis (OUTBOUND)
 *       403:
 *         description: Operator mencoba scan WO yang bukan miliknya.
 *       404:
 *         description: Work Order atau Pallet tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', authorizeRoles('OPERATOR'), scanController.scanPallet);

/**
 * @swagger
 * /api/scans/work-order/{woId}:
 *   get:
 *     summary: Lihat riwayat scan untuk Work Order tertentu
 *     description: Menampilkan semua pallet yang sudah di-scan pada Work Order ini, diurutkan dari yang terbaru.
 *     tags: [Scan Pallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: woId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Work Order
 *     responses:
 *       200:
 *         description: Riwayat scan berhasil diambil.
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
 *                   example: Riwayat scan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     work_order_number:
 *                       type: string
 *                       example: WO-052026-0001
 *                     work_order_category:
 *                       type: string
 *                       example: INBOUND
 *                     status:
 *                       type: string
 *                       example: ON_PROGRESS
 *                     total_scans:
 *                       type: integer
 *                       example: 50
 *                     scans:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_scan:
 *                             type: integer
 *                           scanned_at:
 *                             type: string
 *                             format: date-time
 *                           pallet:
 *                             type: object
 *                             properties:
 *                               rfid_tag:
 *                                 type: string
 *                               status:
 *                                 type: string
 *                               location:
 *                                 type: string
 *                               pallet_type:
 *                                 type: object
 *                                 properties:
 *                                   pallet_name:
 *                                     type: string
 *                                   pallet_category:
 *                                     type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               nama:
 *                                 type: string
 *       403:
 *         description: Operator mencoba melihat scan WO yang bukan miliknya.
 *       404:
 *         description: Work Order tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/work-order/:woId', authorizeRoles('ADMIN', 'OPERATOR'), scanController.getScansByWorkOrder);

module.exports = router;
