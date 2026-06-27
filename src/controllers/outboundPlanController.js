const outboundPlanService = require('../services/outboundPlanService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// GET /api/outbound-plans
const getOutboundPlans = async (req, res) => {
  try {
    const result = await outboundPlanService.getAllOutboundPlans(req.query);
    return successResponse(res, 200, 'Data Outbound Plan berhasil diambil', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// GET /api/outbound-plans/:id
const getOutboundPlanDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const outboundPlan = await outboundPlanService.getOutboundPlanById(id);
    return successResponse(res, 200, 'Detail Outbound Plan berhasil diambil', outboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// POST /api/outbound-plans
const addOutboundPlan = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const outboundPlan = await outboundPlanService.createOutboundPlan(userId, req.body);
    return successResponse(res, 201, 'Outbound Plan berhasil dibuat', outboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// PUT /api/outbound-plans/:id
const updateOutboundPlanData = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const outboundPlan = await outboundPlanService.updateOutboundPlan(id, req.body);
    return successResponse(res, 200, 'Outbound Plan berhasil diperbarui', outboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// PATCH /api/outbound-plans/:id/status
const updateOutboundPlanStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const outboundPlan = await outboundPlanService.updateOutboundPlanStatus(id, req.body);
    return successResponse(res, 200, `Outbound Plan berhasil di-${req.body.status}`, outboundPlan);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

// DELETE /api/outbound-plans/:id
const removeOutboundPlan = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await outboundPlanService.deleteOutboundPlan(id);
    return successResponse(res, 200, 'Outbound Plan berhasil dihapus');
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  getOutboundPlans,
  getOutboundPlanDetail,
  addOutboundPlan,
  updateOutboundPlanData,
  updateOutboundPlanStatus,
  removeOutboundPlan
};
