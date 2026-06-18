const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return successResponse(res, 200, 'Login berhasil', {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    });

  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const logout = async (req, res) => {
  try {
    // FE mungkin mengirim token via cookie atau body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Selalu clear cookie agar FE bisa membersihkan state mereka
    res.clearCookie('refreshToken');

    // Selalu return 200 OK agar FE tidak terhambat saat proses logout
    return successResponse(res, 200, 'Logout berhasil');

  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      return errorResponse(res, 401, 'Refresh token tidak ditemukan. Silakan login ulang.');
    }

    const result = await authService.refreshAccessToken(refreshTokenFromCookie);

    return successResponse(res, 200, 'Access token berhasil di-refresh', {
      accessToken: result.accessToken,
    });

  } catch (error) {
    res.clearCookie('refreshToken');
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id_user; // dari middleware verifyToken
    const data = await authService.getMe(userId);
    return successResponse(res, 200, 'Berhasil mengambil data user dan menu', data);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { password_lama, password_baru } = req.body;
    const result = await authService.changePassword(userId, password_lama, password_baru);
    return successResponse(res, 200, 'Password berhasil diubah', result);
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
};