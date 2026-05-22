const workOrderService = require('../services/workOrderService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getWorkOrders = async (req, res) => {
  try {
    // req.user berisi data dari JWT (id_user, nama_role, dll.)
    // Digunakan untuk filter: Operator hanya lihat WO miliknya
    const result = await workOrderService.getAllWorkOrders(req.query, req.user);
    return successResponse(res, 200, 'Data Work Order berhasil diambil', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getWorkOrderDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workOrder = await workOrderService.getWorkOrderById(id, req.user);
    return successResponse(res, 200, 'Detail Work Order berhasil diambil', workOrder);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const addWorkOrder = async (req, res) => {
  try {
    const workOrder = await workOrderService.createWorkOrder(req.body);
    return successResponse(res, 201, 'Work Order berhasil dibuat', workOrder);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateWorkOrderData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workOrder = await workOrderService.updateWorkOrder(id, req.body);
    return successResponse(res, 200, 'Work Order berhasil diperbarui', workOrder);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const updateWorkOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const workOrder = await workOrderService.updateWorkOrderStatus(id, req.body, req.user);
    return successResponse(res, 200, `Work Order berhasil diubah ke ${req.body.status}`, workOrder);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const removeWorkOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await workOrderService.deleteWorkOrder(id);
    return successResponse(res, 200, 'Work Order berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getWorkOrders,
  getWorkOrderDetail,
  addWorkOrder,
  updateWorkOrderData,
  updateWorkOrderStatus,
  removeWorkOrder
};
