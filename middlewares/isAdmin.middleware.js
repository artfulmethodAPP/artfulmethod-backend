const AppError = require("../utils/app-error");

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(new AppError("Access denied", 403, "FORBIDDEN"));
  }
  next();
};

module.exports = isAdmin;
