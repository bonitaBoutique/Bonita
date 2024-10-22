const jwt = require("jsonwebtoken");
const response = require("../../utils/response");

const authenticate = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return response(res, 401, "Acceso denegado. No se proporcionó un token.");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    response(res, 400, "Token no válido.");
  }
};

const authorize = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return response(res, 403, "No tienes permiso para realizar esta acción.");
  }
  next();
};

module.exports = {
  authenticate,
  authorize
};

