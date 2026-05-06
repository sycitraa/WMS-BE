const storageBinService = require('../services/storageBinService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getBins = async (req, res) => {
  try {
    const bins = await storageBinService.getAllBins();
    return successResponse(res, 200, 'Data Storage Bin berhasil diambil', bins);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getBinDetail = async (req, res) => {
  try {
    // PARSE INT DI SINI
    const id = parseInt(req.params.id, 10);
    const bin = await storageBinService.getBinById(id);
    return successResponse(res, 200, 'Detail Storage Bin berhasil diambil', bin);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addBin = async (req, res) => {
  try {
    const bin = await storageBinService.createBin(req.body);
    return successResponse(res, 201, 'Storage Bin berhasil ditambahkan', bin);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateBinData = async (req, res) => {
  try {
    // PARSE INT DI SINI
    const id = parseInt(req.params.id, 10);
    const bin = await storageBinService.updateBin(id, req.body);
    return successResponse(res, 200, 'Storage Bin berhasil diperbarui', bin);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const removeBin = async (req, res) => {
  try {
    // PARSE INT DI SINI
    const id = parseInt(req.params.id, 10);
    await storageBinService.deleteBin(id);
    return successResponse(res, 200, 'Storage Bin berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getBins, getBinDetail, addBin, updateBinData, removeBin };