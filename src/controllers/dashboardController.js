const dashboardService = require('../services/dashboardService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const getDashboard = async (req, res) => {
  try {
    const { nama_role, id_user } = req.user;
    const { page = 1, limit = 10 } = req.query;

    let data;

    switch (nama_role) {
      case 'ADMIN':
        data = await dashboardService.getAdminDashboard();
        break;
      case 'SUPERVISOR':
        data = await dashboardService.getSupervisorDashboard();
        break;
      case 'OPERATOR':
        data = await dashboardService.getOperatorDashboard(id_user);
        break;
      case 'BOD':
        data = await dashboardService.getBoDDashboard({ page: parseInt(page), limit: parseInt(limit) });
        break;
      default:
        return errorResponse(res, 403, 'Role tidak dikenali');
    }

    return successResponse(res, 200, 'Berhasil mengambil data dashboard', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = { getDashboard };
