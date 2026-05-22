const scanService = require('../services/scanService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const scanPallet = async (req, res) => {
  try {
    const scan = await scanService.scanPallet(req.body, req.user);
    return successResponse(res, 201, 'Pallet berhasil di-scan', scan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getScansByWorkOrder = async (req, res) => {
  try {
    const woId = parseInt(req.params.woId, 10);
    const result = await scanService.getScansByWorkOrder(woId, req.user);
    return successResponse(res, 200, 'Riwayat scan berhasil diambil', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  scanPallet,
  getScansByWorkOrder
};
