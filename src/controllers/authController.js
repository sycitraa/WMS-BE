const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input kosong
    if (!email || !password) {
      return errorResponse(res, 400, 'Email dan password wajib diisi');
    }

    const result = await authService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    return successResponse(res, 200, 'Login berhasil', {
      accessToken: result.accessToken,
      user: result.user,
    });
    
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token tidak ditemukan');
    }

    const result = await authService.logout(userId, refreshToken);

    res.clearCookie('refreshToken');

    return successResponse(res, 200, result.message);
    
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

module.exports = {
  login,
  logout,
  refreshToken,
};