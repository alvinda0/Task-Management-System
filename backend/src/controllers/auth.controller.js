const authService = require("../services/auth.service");
const response = require("../utils/response");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);

    return response.success(
      res,
      "Register berhasil",
      user,
      null,
      201
    );
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const token = await authService.login(req.body);

    return response.success(
      res,
      "Login berhasil",
      null,
      { token },
      200
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};