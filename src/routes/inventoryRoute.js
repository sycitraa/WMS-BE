const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Inventory
 *     description: API untuk mendapatkan data agregasi inventory pallet
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Mendapatkan data inventory (agregasi per pallet type)
 *     description: Mengembalikan data jumlah pallet available, shipped, beserta tabel stok masuk/keluar per kategori pallet type.
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword pencarian berdasarkan nama pallet atau kategori
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman (pagination)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah item per halaman (pagination)
 *     responses:
 *       200:
 *         description: Berhasil mengambil data inventory
 *       401:
 *         description: Unauthorized (Token tidak valid)
 *       500:
 *         description: Internal Server Error
 */
router.get('/', inventoryController.getInventory);

module.exports = router;
