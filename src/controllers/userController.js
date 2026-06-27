const userService = require('../services/userService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getProfiles = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    return successResponse(res, 200, 'Data users berhasil diambil', users);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const createNewUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, 201, 'User berhasil dibuat', user);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateExistingUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await userService.updateUser(id, req.body);
    return successResponse(res, 200, 'User berhasil diperbarui', user);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const removeUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await userService.deleteUser(id);
    return successResponse(res, 200, 'User berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getProfiles, createNewUser, updateExistingUser, removeUser };