const warehouseAreaService = require('../services/warehouseAreaService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getAreas = async (req, res) => {
  try {
    const areas = await warehouseAreaService.getAllWarehouseAreas(req.query);
    return successResponse(res, 200, 'Data Warehouse Area berhasil diambil', areas);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addArea = async (req, res) => {
  try {
    const area = await warehouseAreaService.createArea(req.body);
    return successResponse(res, 201, 'Warehouse Area berhasil ditambahkan', area);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateArea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const area = await warehouseAreaService.updateArea(id, req.body);
    return successResponse(res, 200, 'Warehouse Area berhasil diperbarui', area);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const deleteArea = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await warehouseAreaService.deleteArea(id);
    return successResponse(res, 200, 'Warehouse Area berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getAreas, addArea, updateArea, deleteArea };