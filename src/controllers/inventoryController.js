const fs = require('fs');
const inventoryService = require('../services/inventoryService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { createTempExcelFile, getExcelFilename, cleanupTempFile } = require('../utils/excelHelper');
const STOCK_LEVEL_HEADERS = ['No', 'Pallet Name', 'Category', 'Stock Level', 'Stock', 'Updated At'];
const LOCATION_HEADERS = ['No', 'Pallet Name', 'Category', 'Stock', 'Location', 'Updated At'];

const getInventory = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const data = await inventoryService.getInventoryData({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
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
      id_warehouse_area,
    });
    return successResponse(res, 200, 'Berhasil mengambil data lokasi inventory', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const exportStockLevel = async (req, res) => {
  let tempPath = null;
  try {
    const rows = await inventoryService.getStockLevelExportData();
    const filename = getExcelFilename('Stock_Level');
    tempPath = await createTempExcelFile('Stock Level', STOCK_LEVEL_HEADERS, rows, filename);

    res.download(tempPath, `${filename}.xlsx`, (err) => {
      cleanupTempFile(tempPath);
      if (err && !res.headersSent) {
        return errorResponse(res, 500, 'Gagal mengirim file laporan');
      }
    });
  } catch (error) {
    cleanupTempFile(tempPath);
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const exportLocations = async (req, res) => {
  let tempPath = null;
  try {
    const { id_pallet_type } = req.params;
    if (!id_pallet_type) {
      return errorResponse(res, 400, 'Parameter id_pallet_type wajib diisi');
    }

    const result = await inventoryService.getLocationsExportData(parseInt(id_pallet_type));
    if (!result) {
      return errorResponse(res, 404, 'Pallet type tidak ditemukan');
    }

    const filename = getExcelFilename(`Locations_${result.palletName}`);
    tempPath = await createTempExcelFile(
      `Locations - ${result.palletName}`,
      LOCATION_HEADERS,
      result.rows,
      filename,
    );

    res.download(tempPath, `${filename}.xlsx`, (err) => {
      cleanupTempFile(tempPath);
      if (err && !res.headersSent) {
        return errorResponse(res, 500, 'Gagal mengirim file laporan');
      }
    });
  } catch (error) {
    cleanupTempFile(tempPath);
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getInventory,
  getInventoryLocations,
  exportStockLevel,
  exportLocations,
};
