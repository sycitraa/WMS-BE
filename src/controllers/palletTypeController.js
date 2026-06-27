const { Query } = require('pg');
const palletTypeService = require('../services/palletTypeService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getPalletTypes = async (req, res) => {
  try {
    const types = await palletTypeService.getAllPalletTypes(req.query);
    return successResponse(res, 200, 'Data Pallet Type berhasil diambil', types);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
}

const getPalletTypeDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const type = await palletTypeService.getPalletTypeById(id);
    return successResponse(res, 200, 'Detail Pallet Type berhasil diambil', type);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addPalletType = async (req, res) => {
  try {
    const type = await palletTypeService.createPalletType(req.body);
    return successResponse(res, 201, 'Pallet Type berhasil ditambahkan', type);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
}

const updatePalletTypeData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const type = await palletTypeService.updatePalletType(id, req.body);
    return successResponse(res, 200, 'Pallet Type berhasil diperbarui', type);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const removePalletType = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await palletTypeService.deletePalletType(id);
    return successResponse(res, 200, 'Pallet Type berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getPalletTypes, getPalletTypeDetail, addPalletType, updatePalletTypeData, removePalletType };