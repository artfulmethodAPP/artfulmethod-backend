const multer = require("multer");
const { ZodError } = require("zod");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const { ValidationError, UniqueConstraintError } = require("sequelize");
const AppError = require("../utils/app-error");

const errorHandler = (error, req, res, next) => {
  let normalizedError = error;

  if (error instanceof AppError) {
    normalizedError = error;
  } else if (error instanceof ZodError) {
    normalizedError = new AppError(
      error.issues[0]?.message || "Validation failed",
      400,
      "VALIDATION_ERROR",
      error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    );
  } else if (error instanceof multer.MulterError) {
    normalizedError = new AppError(error.message, 400, "UPLOAD_ERROR");
  } else if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
    normalizedError = new AppError("Invalid or expired token", 401, "UNAUTHORIZED");
  } else if (error instanceof UniqueConstraintError) {
    normalizedError = new AppError(
      error.errors[0]?.message || "Duplicate value",
      409,
      "CONFLICT",
      error.errors.map((item) => ({
        path: item.path,
        message: item.message,
      })),
    );
  } else if (error instanceof ValidationError) {
    normalizedError = new AppError(
      error.errors[0]?.message || "Validation failed",
      400,
      "VALIDATION_ERROR",
      error.errors.map((item) => ({
        path: item.path,
        message: item.message,
      })),
    );
  } else {
    normalizedError = new AppError(
      error.message || "Internal server error",
      error.statusCode || 500,
      error.code || "INTERNAL_SERVER_ERROR",
    );
  }

  return res.status(normalizedError.statusCode).json({
    success: false,
    message: normalizedError.message,
    errors: normalizedError.errors || null,
  });
};

module.exports = errorHandler;
