const authService = require("../services/auth.service");

async function register(req, res) {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "Register berhasil",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const token = await authService.login(req.body);

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  register,
  login,
};