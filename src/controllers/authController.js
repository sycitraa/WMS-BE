const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input kosong
    if (!email || !password) {
      return errorResponse(res, 400, 'Email dan password wajib diisi');
    }

    // Panggil service
    const result = await authService.login(email, password);

    // Kirim refresh token via HTTP-only cookie (lebih aman)
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 hari
    });

    // Kirim response sukses dengan access token (client harus simpan di memory/state)
    return successResponse(res, 200, 'Login berhasil', {
      accessToken: result.accessToken,
      user: result.user,
    });
    
  } catch (error) {
    // Tangkap AppError (misal 401) atau error server (500)
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const logout = async (req, res) => {
  try {
    const userId = req.user.id_user; // Dari authMiddleware
    const refreshToken = req.cookies.refreshToken; // Dari cookie

    // Validasi refresh token ada
    if (!refreshToken) {
      return errorResponse(res, 400, 'Refresh token tidak ditemukan');
    }

    // Panggil service logout
    const result = await authService.logout(userId, refreshToken);

    // Hapus refresh token dari cookie
    res.clearCookie('refreshToken');

    return successResponse(res, 200, result.message);
    
  } catch (error) {
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken; // Dari cookie

    // Validasi refresh token ada
    if (!refreshTokenFromCookie) {
      return errorResponse(res, 401, 'Refresh token tidak ditemukan. Silakan login ulang.');
    }

    // Panggil service refresh token
    const result = await authService.refreshAccessToken(refreshTokenFromCookie);

    return successResponse(res, 200, 'Access token berhasil di-refresh', {
      accessToken: result.accessToken,
    });
    
  } catch (error) {
    // Jika error, hapus cookie refresh token
    res.clearCookie('refreshToken');
    return errorResponse(res, error.statusCode || 500, error.message);
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
};