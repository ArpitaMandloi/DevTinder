const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || (error.name === "ValidationError" ? 400 : 500);
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    error = new ApiError(400, `${field} already exists.`);
  }

  // Handle JWT expired error
  if (err.name === "TokenExpiredError") {
    error = new ApiError(401, "Session expired, please log in again.");
  }

  // Handle JWT invalid error
  if (err.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid token, authorization denied.");
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    errors: error.errors,
  };

  return res.status(error.statusCode).json(response);
};

module.exports = { errorHandler };
