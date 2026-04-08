const jwt = require("jsonwebtoken");
const { User } = require("../models");
const AppError = require("../utils/app-error");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    }

    if (!user.is_verified) {
      return next(
        new AppError("Please verify your email first", 403, "FORBIDDEN"),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
