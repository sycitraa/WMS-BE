const factoryService = require('../services/factoryService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getFactories = async (req, res) => {
  try {
    const factories = await factoryService.getAllFactories(req.query);
    return successResponse(res, 200, 'Data Factory berhasil diambil', factories);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getFactoryDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factory = await factoryService.getFactoryById(id);
    return successResponse(res, 200, 'Detail Factory berhasil diambil', factory);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addFactory = async (req, res) => {
  try {
    const factory = await factoryService.createFactory(req.body);
    return successResponse(res, 201, 'Factory berhasil ditambahkan', factory);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateFactoryData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const factory = await factoryService.updateFactory(id, req.body);
    return successResponse(res, 200, 'Factory berhasil diperbarui', factory);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const removeFactory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await factoryService.deleteFactory(id);
    return successResponse(res, 200, 'Factory berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getFactories,
  getFactoryDetail,
  addFactory,
  updateFactoryData,
  removeFactory
};