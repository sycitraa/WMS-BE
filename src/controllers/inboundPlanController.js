const inboundPlanService = require('../services/inboundPlanService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// GET /api/inbound-plans
const getInboundPlans = async (req, res) => {
  try {
    const result = await inboundPlanService.getAllInboundPlans(req.query);
    return successResponse(res, 200, 'Data Inbound Plan berhasil diambil', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// GET /api/inbound-plans/:id
const getInboundPlanDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const inboundPlan = await inboundPlanService.getInboundPlanById(id);
    return successResponse(res, 200, 'Detail Inbound Plan berhasil diambil', inboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// POST /api/inbound-plans
const addInboundPlan = async (req, res) => {
  try {
    // req.user.id_user diambil dari JWT token yang sudah di-decode oleh verifyToken
    const userId = req.user.id_user;
    const inboundPlan = await inboundPlanService.createInboundPlan(userId, req.body);
    return successResponse(res, 201, 'Inbound Plan berhasil dibuat', inboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// PUT /api/inbound-plans/:id
const updateInboundPlanData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const inboundPlan = await inboundPlanService.updateInboundPlan(id, req.body);
    return successResponse(res, 200, 'Inbound Plan berhasil diperbarui', inboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// PATCH /api/inbound-plans/:id/status
const updateInboundPlanStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const inboundPlan = await inboundPlanService.updateInboundPlanStatus(id, req.body);
    return successResponse(res, 200, `Inbound Plan berhasil di-${req.body.status}`, inboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// DELETE /api/inbound-plans/:id
const removeInboundPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await inboundPlanService.deleteInboundPlan(id);
    return successResponse(res, 200, 'Inbound Plan berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getInboundPlans,
  getInboundPlanDetail,
  addInboundPlan,
  updateInboundPlanData,
  updateInboundPlanStatus,
  removeInboundPlan
};
