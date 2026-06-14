const inventoryService = require('../services/inventoryService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const data = await inventoryService.getInventoryData({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    return successResponse(res, 200, 'Berhasil mengambil data inventory', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getInventoryLocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', id_warehouse_area = '' } = req.query;

    const data = await inventoryService.getInventoryLocations({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      id_warehouse_area
    });

    return successResponse(res, 200, 'Berhasil mengambil data lokasi inventory', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getInventory,
  getInventoryLocations
};
