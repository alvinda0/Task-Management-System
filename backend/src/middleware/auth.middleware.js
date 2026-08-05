const jwt = require("jsonwebtoken");
const { error } = require("../utils/response");

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return error(
        res,
        "Authorization header tidak ditemukan",
        401
      );
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return error(
        res,
        "Format token harus Bearer <token>",
        401
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return error(
        res,
        "Token sudah kedaluwarsa",
        401
      );
    }

    if (err.name === "JsonWebTokenError") {
      return error(
        res,
        "Token tidak valid",
        401
      );
    }

    return error(
      res,
      "Internal server error",
      500
    );
  }
}

module.exports = authenticate;