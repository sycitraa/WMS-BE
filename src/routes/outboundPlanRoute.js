const express = require('express');
const outboundPlanController = require('../controllers/outboundPlanController');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Outbound Plan
 *     description: Endpoint API untuk Transaksi Outbound Plan (Rencana Pengiriman Pallet)
 */

// ============================================================
// GET /api/outbound-plans — Akses: ADMIN & SUPERVISOR
// ============================================================
/**
 * @swagger
 * /api/outbound-plans:
 *   get:
 *     summary: Ambil semua Outbound Plan dengan pagination dan pencarian
 *     tags: [Outbound Plan]
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
 *         description: Pencarian berdasarkan nomor dokumen, status, atau nama pembuat.
 *     responses:
 *       200:
 *         description: Data Outbound Plan berhasil diambil.
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
 *                   example: Data Outbound Plan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_outbound_plan:
 *                             type: integer
 *                             example: 1
 *                           document_number:
 *                             type: string
 *                             example: DLV.PLAN-052026-0001
 *                           planning_month:
 *                             type: string
 *                             format: date
 *                             example: "2026-05-01"
 *                           status:
 *                             type: string
 *                             example: WAITING_APPROVAL
 *                           remarks:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               nama:
 *                                 type: string
 *                                 example: Admin WMS
 *                           details:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id_detail:
 *                                   type: integer
 *                                 id_pallet_type:
 *                                   type: integer
 *                                 id_destination:
 *                                   type: integer
 *                                 quantity:
 *                                   type: integer
 *                                 pallet_type:
 *                                   type: object
 *                                   properties:
 *                                     pallet_name:
 *                                       type: string
 *                                 destination:
 *                                   type: object
 *                                   properties:
 *                                     destination_name:
 *                                       type: string
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
router.get('/', authorizeRoles('ADMIN', 'SUPERVISOR'), outboundPlanController.getOutboundPlans);

// ============================================================
// GET /api/outbound-plans/:id — Akses: ADMIN & SUPERVISOR
// ============================================================
/**
 * @swagger
 * /api/outbound-plans/{id}:
 *   get:
 *     summary: Ambil detail Outbound Plan berdasarkan ID
 *     tags: [Outbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Outbound Plan.
 *     responses:
 *       200:
 *         description: Detail Outbound Plan berhasil diambil.
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
 *                   example: Detail Outbound Plan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_outbound_plan:
 *                       type: integer
 *                       example: 1
 *                     document_number:
 *                       type: string
 *                       example: DLV.PLAN-052026-0001
 *                     planning_month:
 *                       type: string
 *                       format: date
 *                       example: "2026-05-01"
 *                     status:
 *                       type: string
 *                       example: WAITING_APPROVAL
 *                     remarks:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         nama:
 *                           type: string
 *                           example: Admin WMS
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_detail:
 *                             type: integer
 *                           id_pallet_type:
 *                             type: integer
 *                           id_destination:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           destination:
 *                             type: object
 *                             properties:
 *                               destination_name:
 *                                 type: string
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Outbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', authorizeRoles('ADMIN', 'SUPERVISOR'), outboundPlanController.getOutboundPlanDetail);

// ============================================================
// POST /api/outbound-plans — Akses: ADMIN only
// ============================================================
/**
 * @swagger
 * /api/outbound-plans:
 *   post:
 *     summary: Buat Outbound Plan baru (document_number auto-generate)
 *     tags: [Outbound Plan]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planning_month
 *               - details
 *             properties:
 *               planning_month:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-01"
 *                 description: Bulan perencanaan (format YYYY-MM-DD)
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 example: Pengiriman pallet ke destination A
 *               details:
 *                 type: array
 *                 description: Daftar detail item (minimal 1)
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_pallet_type
 *                     - id_destination
 *                     - quantity
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     id_destination:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *     responses:
 *       201:
 *         description: Outbound Plan berhasil dibuat.
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
 *                   example: Outbound Plan berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_outbound_plan:
 *                       type: integer
 *                       example: 1
 *                     document_number:
 *                       type: string
 *                       example: DLV.PLAN-052026-0001
 *                     planning_month:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       example: WAITING_APPROVAL
 *                     remarks:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         nama:
 *                           type: string
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_detail:
 *                             type: integer
 *                           id_pallet_type:
 *                             type: integer
 *                           id_destination:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           destination:
 *                             type: object
 *                             properties:
 *                               destination_name:
 *                                 type: string
 *       400:
 *         description: Data tidak valid atau detail item tidak lengkap.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', authorizeRoles('ADMIN'), outboundPlanController.addOutboundPlan);

// ============================================================
// PUT /api/outbound-plans/:id — Akses: ADMIN only
// Status otomatis reset ke WAITING_APPROVAL
// ============================================================
/**
 * @swagger
 * /api/outbound-plans/{id}:
 *   put:
 *     summary: Update Outbound Plan (status otomatis reset ke WAITING_APPROVAL)
 *     tags: [Outbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Outbound Plan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - details
 *             properties:
 *               planning_month:
 *                 type: string
 *                 format: date
 *                 example: "2026-06-01"
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 example: Update rencana pengiriman
 *               details:
 *                 type: array
 *                 description: Daftar detail item baru (menggantikan detail lama)
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_pallet_type
 *                     - id_destination
 *                     - quantity
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 2
 *                     id_destination:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 150
 *     responses:
 *       200:
 *         description: Outbound Plan berhasil diperbarui.
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
 *                   example: Outbound Plan berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_outbound_plan:
 *                       type: integer
 *                     document_number:
 *                       type: string
 *                     planning_month:
 *                       type: string
 *                       format: date
 *                     status:
 *                       type: string
 *                       example: WAITING_APPROVAL
 *                     remarks:
 *                       type: string
 *                       nullable: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         nama:
 *                           type: string
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_detail:
 *                             type: integer
 *                           id_pallet_type:
 *                             type: integer
 *                           id_destination:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           destination:
 *                             type: object
 *                             properties:
 *                               destination_name:
 *                                 type: string
 *       400:
 *         description: Data tidak valid atau detail item tidak lengkap.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Outbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', authorizeRoles('ADMIN'), outboundPlanController.updateOutboundPlanData);

// ============================================================
// PATCH /api/outbound-plans/:id/status — Akses: SUPERVISOR only
// Approve atau Reject Outbound Plan
// ============================================================
/**
 * @swagger
 * /api/outbound-plans/{id}/status:
 *   patch:
 *     summary: Approve atau Reject Outbound Plan (Supervisor only)
 *     tags: [Outbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Outbound Plan.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *                 example: APPROVE
 *                 description: Status baru (hanya APPROVE atau REJECT)
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 example: Disetujui oleh Supervisor
 *                 description: Catatan dari Supervisor (opsional)
 *     responses:
 *       200:
 *         description: Status Outbound Plan berhasil diperbarui.
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
 *                   example: Outbound Plan berhasil di-APPROVE
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_outbound_plan:
 *                       type: integer
 *                     document_number:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: APPROVE
 *                     remarks:
 *                       type: string
 *                       example: Disetujui oleh Supervisor
 *       400:
 *         description: Status tidak valid atau plan tidak berstatus WAITING_APPROVAL.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Outbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.patch('/:id/status', authorizeRoles('SUPERVISOR'), outboundPlanController.updateOutboundPlanStatus);

// ============================================================
// DELETE /api/outbound-plans/:id — Akses: ADMIN only
// ============================================================
/**
 * @swagger
 * /api/outbound-plans/{id}:
 *   delete:
 *     summary: Hapus Outbound Plan beserta detail-nya
 *     tags: [Outbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Outbound Plan.
 *     responses:
 *       200:
 *         description: Outbound Plan berhasil dihapus.
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
 *                   example: Outbound Plan berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Outbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', authorizeRoles('ADMIN'), outboundPlanController.removeOutboundPlan);

module.exports = router;
