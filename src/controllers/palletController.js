const palletService = require('../services/palletService')
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getPallets = async (req, res) => {
  try {
    const pallets = await palletService.getAllPallets(req.query);
    return successResponse(res, 200, 'Data Pallet berhasil diambil', pallets);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getPalletDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pallet = await palletService.getPalletById(id);
    return successResponse(res, 200, 'Detail Pallet berhasil diambil', pallet);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addPallet = async (req, res) => {
  try {
    const pallet = await palletService.createPallet(req.body);
    return successResponse(res, 201, 'Pallet berhasil ditambahkan', pallet);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updatePalletData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pallet = await palletService.updatePallet(id, req.body);
    return successResponse(res, 200, 'Pallet berhasil diperbarui', pallet);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const deletePallet = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await palletService.deletePallet(id);
    return successResponse(res, 200, 'Pallet berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getPallets, getPalletDetail, addPallet, updatePalletData, deletePallet };