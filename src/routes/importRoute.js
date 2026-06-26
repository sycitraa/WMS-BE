const express = require('express');
const importController = require('../controllers/importController');
const upload = require('../middlewares/uploadMiddleware');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * /api/import/template/{moduleType}:
 *   get:
 *     summary: Download file template Excel untuk import master data
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pallet-type, pallet, factory, destination]
 *         description: Jenis module master data
 *     responses:
 *       200:
 *         description: File template berhasil diunduh
 *       401:
 *         description: Unauthorized
 */
router.get('/template/:moduleType', verifyToken, importController.downloadTemplate);

/**
 * @swagger
 * /api/import/{moduleType}:
 *   post:
 *     summary: Import master data dari file CSV atau Excel
 *     tags: [Import]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pallet-type, pallet, factory, destination]
 *         description: Jenis module master data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File .csv atau .xlsx (Max 5MB)
 *     responses:
 *       200:
 *         description: Import selesai (partial atau full success)
 *       400:
 *         description: Bad request (format file salah, header tidak sesuai, melebihi max limit row)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Hanya ADMIN yang diizinkan)
 */
router.post('/:moduleType', verifyToken, authorizeRoles('ADMIN'), upload.single('file'), importController.importData);

module.exports = router;
