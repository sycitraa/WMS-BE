const express = require('express');
const inboundPlanController = require('../controllers/inboundPlanController');
const authorizeRoles = require('../middlewares/roleMiddleware');
const { validateBody } = require('../middlewares/validateMiddleware');
const { createInboundPlanSchema, updateInboundPlanSchema, updateInboundPlanStatusSchema } = require('../validations/inboundPlanValidation');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Inbound Plan
 *     description: Endpoint API untuk Transaksi Inbound Plan (Rencana Penerimaan Pallet)
 */


/**
 * @swagger
 * /api/inbound-plans:
 *   get:
 *     summary: Ambil semua Inbound Plan dengan pagination dan pencarian
 *     tags: [Inbound Plan]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [WAITING_APPROVAL, APPROVE, REJECT]
 *         description: Filter berdasarkan status plan.
 *       - in: query
 *         name: planning_month
 *         schema:
 *           type: string
 *           example: "2026-05"
 *         description: Filter berdasarkan bulan perencanaan (format YYYY-MM).
 *     responses:
 *       200:
 *         description: Data Inbound Plan berhasil diambil.
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
 *                   example: Data Inbound Plan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_inbound_plan:
 *                             type: integer
 *                             example: 1
 *                           document_number:
 *                             type: string
 *                             example: RCV.PLAN-052026-0001
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
 *                                 id_factory:
 *                                   type: integer
 *                                 quantity:
 *                                   type: integer
 *                                 pallet_type:
 *                                   type: object
 *                                   properties:
 *                                     pallet_name:
 *                                       type: string
 *                                 factory:
 *                                   type: object
 *                                   properties:
 *                                     factory_name:
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
router.get('/', authorizeRoles('ADMIN', 'SUPERVISOR'), inboundPlanController.getInboundPlans);

/**
 * @swagger
 * /api/inbound-plans/{id}:
 *   get:
 *     summary: Ambil detail Inbound Plan berdasarkan ID
 *     tags: [Inbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Inbound Plan.
 *     responses:
 *       200:
 *         description: Detail Inbound Plan berhasil diambil.
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
 *                   example: Detail Inbound Plan berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_inbound_plan:
 *                       type: integer
 *                       example: 1
 *                     document_number:
 *                       type: string
 *                       example: RCV.PLAN-052026-0001
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
 *                           id_factory:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           factory:
 *                             type: object
 *                             properties:
 *                               factory_name:
 *                                 type: string
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Inbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', authorizeRoles('ADMIN', 'SUPERVISOR'), inboundPlanController.getInboundPlanDetail);

/**
 * @swagger
 * /api/inbound-plans:
 *   post:
 *     summary: Buat Inbound Plan baru (document_number auto-generate)
 *     tags: [Inbound Plan]
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
 *                 example: Pengiriman pallet dari factory A
 *               details:
 *                 type: array
 *                 description: Daftar detail item (minimal 1)
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_pallet_type
 *                     - id_factory
 *                     - quantity
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     id_factory:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *     responses:
 *       201:
 *         description: Inbound Plan berhasil dibuat.
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
 *                   example: Inbound Plan berhasil dibuat
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_inbound_plan:
 *                       type: integer
 *                       example: 1
 *                     document_number:
 *                       type: string
 *                       example: RCV.PLAN-052026-0001
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
 *                           id_factory:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           factory:
 *                             type: object
 *                             properties:
 *                               factory_name:
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
router.post('/', authorizeRoles('ADMIN'), validateBody(createInboundPlanSchema), inboundPlanController.addInboundPlan);

/**
 * @swagger
 * /api/inbound-plans/{id}:
 *   put:
 *     summary: Update Inbound Plan (status otomatis reset ke WAITING_APPROVAL)
 *     tags: [Inbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Inbound Plan.
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
 *                     - id_factory
 *                     - quantity
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 2
 *                     id_factory:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 150
 *     responses:
 *       200:
 *         description: Inbound Plan berhasil diperbarui.
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
 *                   example: Inbound Plan berhasil diperbarui
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_inbound_plan:
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
 *                           id_factory:
 *                             type: integer
 *                           quantity:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                           factory:
 *                             type: object
 *                             properties:
 *                               factory_name:
 *                                 type: string
 *       400:
 *         description: Data tidak valid atau detail item tidak lengkap.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Inbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', authorizeRoles('ADMIN'), validateBody(updateInboundPlanSchema), inboundPlanController.updateInboundPlanData);

/**
 * @swagger
 * /api/inbound-plans/{id}/status:
 *   patch:
 *     summary: Approve atau Reject Inbound Plan (Supervisor only)
 *     tags: [Inbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Inbound Plan.
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
 *         description: Status Inbound Plan berhasil diperbarui.
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
 *                   example: Inbound Plan berhasil di-APPROVE
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_inbound_plan:
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
 *         description: Inbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.patch('/:id/status', authorizeRoles('SUPERVISOR'), validateBody(updateInboundPlanStatusSchema), inboundPlanController.updateInboundPlanStatus);

/**
 * @swagger
 * /api/inbound-plans/{id}:
 *   delete:
 *     summary: Hapus Inbound Plan beserta detail-nya
 *     tags: [Inbound Plan]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Inbound Plan.
 *     responses:
 *       200:
 *         description: Inbound Plan berhasil dihapus.
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
 *                   example: Inbound Plan berhasil dihapus
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Inbound Plan tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', authorizeRoles('ADMIN'), inboundPlanController.removeInboundPlan);

module.exports = router;
