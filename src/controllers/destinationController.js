const destinationService = require('../services/destinationService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getDestinations = async (req, res) => {
  try {
    const destinations = await destinationService.getAllDestinations(req.query);
    return successResponse(res, 200, 'Data Destination berhasil diambil', destinations);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getDestinationDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await destinationService.getDestinationById(id);
    return successResponse(res, 200, 'Detail Destination berhasil diambil', destination);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addDestination = async (req, res) => {
  try {
    const destination = await destinationService.createDestination(req.body);
    return successResponse(res, 201, 'Destination berhasil ditambahkan', destination);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateDestinationData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const destination = await destinationService.updateDestiantion(id, req.body);
    return successResponse(res, 200, 'Destination berhasil diperbarui', destination);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const deleteDestination = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await destinationService.deleteDestination(id);
    return successResponse(res, 200, 'Destination berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getDestinations,
  getDestinationDetail,
  addDestination,
  updateDestinationData,
  deleteDestination
}