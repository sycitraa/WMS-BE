const express = require('express');
const workOrderController = require('../controllers/workOrderController');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Work Order
 *     description: Endpoint API untuk Transaksi Work Order (Perintah Kerja)
 */

/**
 * @swagger
 * /api/work-orders:
 *   get:
 *     summary: Ambil daftar Work Order (Admin melihat semua, Operator melihat miliknya)
 *     tags: [Work Order]
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
 *         description: Cari berdasarkan nomor WO, nama operator, atau remarks.
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [INBOUND, OUTBOUND]
 *         description: Filter berdasarkan kategori WO.
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [TO_DO, ON_PROGRESS, DONE]
 *         description: Filter berdasarkan status WO.
 *     responses:
 *       200:
 *         description: Data Work Order berhasil diambil.
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
 *                   example: Data Work Order berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_work_order:
 *                             type: integer
 *                           work_order_number:
 *                             type: string
 *                             example: WO-052026-0001
 *                           work_order_category:
 *                             type: string
 *                             example: INBOUND
 *                           status:
 *                             type: string
 *                             example: TO_DO
 *                           date:
 *                             type: string
 *                             format: date
 *                           transfer_point:
 *                             type: string
 *                             nullable: true
 *                           remarks:
 *                             type: string
 *                             nullable: true
 *                           user:
 *                             type: object
 *                             properties:
 *                               nama:
 *                                 type: string
 *                           warehouse_area:
 *                             type: object
 *                             properties:
 *                               warehouse_area_name:
 *                                 type: string
 *                     meta:
 *                       type: object
 *                       properties:
 *                         totalItems:
 *                           type: integer
 *                         itemsPerPage:
 *                           type: integer
 *                         currentPage:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/', authorizeRoles('ADMIN', 'OPERATOR'), workOrderController.getWorkOrders);

/**
 * @swagger
 * /api/work-orders/{id}:
 *   get:
 *     summary: Ambil detail Work Order berdasarkan ID
 *     tags: [Work Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Work Order.
 *     responses:
 *       200:
 *         description: Detail Work Order berhasil diambil.
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
 *                   example: Detail Work Order berhasil diambil
 *                 data:
 *                   type: object
 *                   properties:
 *                     id_work_order:
 *                       type: integer
 *                     work_order_number:
 *                       type: string
 *                     work_order_category:
 *                       type: string
 *                     status:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     transfer_point:
 *                       type: string
 *                       nullable: true
 *                     remarks:
 *                       type: string
 *                       nullable: true
 *                     user:
 *                       type: object
 *                       properties:
 *                         nama:
 *                           type: string
 *                     warehouse_area:
 *                       type: object
 *                       properties:
 *                         warehouse_area_name:
 *                           type: string
 *                     inbound_plan:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         document_number:
 *                           type: string
 *                         status:
 *                           type: string
 *                     outbound_plan:
 *                       type: object
 *                       nullable: true
 *                       properties:
 *                         document_number:
 *                           type: string
 *                         status:
 *                           type: string
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_work_order_detail:
 *                             type: integer
 *                           id_pallet_type:
 *                             type: integer
 *                           id_storage_bins:
 *                             type: integer
 *                           total_planning:
 *                             type: integer
 *                           actual_pcs:
 *                             type: integer
 *                           pallet_type:
 *                             type: object
 *                             properties:
 *                               pallet_name:
 *                                 type: string
 *                               pallet_category:
 *                                 type: string
 *                           storage_bins:
 *                             type: object
 *                             properties:
 *                               bin_number:
 *                                 type: string
 *                               stock:
 *                                 type: integer
 *                               max_quantity:
 *                                 type: integer
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak.
 *       404:
 *         description: Work Order tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.get('/:id', authorizeRoles('ADMIN', 'OPERATOR'), workOrderController.getWorkOrderDetail);

/**
 * @swagger
 * /api/work-orders:
 *   post:
 *     summary: Buat Work Order baru (berdasarkan Plan yang sudah APPROVE)
 *     tags: [Work Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - work_order_category
 *               - id_warehouse_area
 *               - id_user
 *               - date
 *               - details
 *             properties:
 *               work_order_category:
 *                 type: string
 *                 enum: [INBOUND, OUTBOUND]
 *                 example: INBOUND
 *               id_inbound_plan:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *                 description: Wajib diisi jika kategori INBOUND
 *               id_outbound_plan:
 *                 type: integer
 *                 nullable: true
 *                 example: null
 *                 description: Wajib diisi jika kategori OUTBOUND
 *               id_warehouse_area:
 *                 type: integer
 *                 example: 1
 *               id_user:
 *                 type: integer
 *                 example: 3
 *                 description: ID User dengan role OPERATOR
 *               transfer_point:
 *                 type: string
 *                 nullable: true
 *                 example: Dock A
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-21"
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 example: Penerimaan pallet dari factory
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_pallet_type
 *                     - id_storage_bins
 *                     - total_planning
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 1
 *                     id_storage_bins:
 *                       type: integer
 *                       example: 1
 *                     total_planning:
 *                       type: integer
 *                       example: 50
 *     responses:
 *       201:
 *         description: Work Order berhasil dibuat.
 *       400:
 *         description: Data tidak valid, Plan belum APPROVE, atau User bukan Operator.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Plan, Warehouse Area, atau User tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.post('/', authorizeRoles('ADMIN'), workOrderController.addWorkOrder);

/**
 * @swagger
 * /api/work-orders/{id}:
 *   put:
 *     summary: Update Work Order (hanya jika status TO_DO)
 *     tags: [Work Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Work Order.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - details
 *             properties:
 *               id_warehouse_area:
 *                 type: integer
 *                 example: 2
 *               id_user:
 *                 type: integer
 *                 example: 3
 *                 description: ID User dengan role OPERATOR
 *               transfer_point:
 *                 type: string
 *                 nullable: true
 *                 example: Dock B
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-05-22"
 *               remarks:
 *                 type: string
 *                 nullable: true
 *                 example: Update keterangan
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_pallet_type
 *                     - id_storage_bins
 *                     - total_planning
 *                   properties:
 *                     id_pallet_type:
 *                       type: integer
 *                       example: 2
 *                     id_storage_bins:
 *                       type: integer
 *                       example: 3
 *                     total_planning:
 *                       type: integer
 *                       example: 100
 *     responses:
 *       200:
 *         description: Work Order berhasil diperbarui.
 *       400:
 *         description: Data tidak valid atau WO tidak berstatus TO_DO.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Work Order tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.put('/:id', authorizeRoles('ADMIN'), workOrderController.updateWorkOrderData);

/**
 * @swagger
 * /api/work-orders/{id}/status:
 *   patch:
 *     summary: Update status Work Order (TO_DO → ON_PROGRESS → DONE)
 *     tags: [Work Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Work Order.
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
 *                 enum: [ON_PROGRESS, DONE]
 *                 example: ON_PROGRESS
 *                 description: Status baru WO (harus mengikuti alur berurutan)
 *     responses:
 *       200:
 *         description: Status Work Order berhasil diperbarui.
 *       400:
 *         description: Status tidak valid atau alur tidak berurutan.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak.
 *       404:
 *         description: Work Order tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.patch('/:id/status', authorizeRoles('ADMIN', 'OPERATOR'), workOrderController.updateWorkOrderStatus);

/**
 * @swagger
 * /api/work-orders/{id}:
 *   delete:
 *     summary: Hapus Work Order (soft delete, hanya jika status TO_DO)
 *     tags: [Work Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID Work Order.
 *     responses:
 *       200:
 *         description: Work Order berhasil dihapus.
 *       400:
 *         description: WO tidak berstatus TO_DO.
 *       401:
 *         description: Token tidak valid atau tidak tersedia.
 *       403:
 *         description: Akses ditolak karena role tidak sesuai.
 *       404:
 *         description: Work Order tidak ditemukan.
 *       500:
 *         description: Terjadi kesalahan server.
 */
router.delete('/:id', authorizeRoles('ADMIN'), workOrderController.removeWorkOrder);

module.exports = router;
