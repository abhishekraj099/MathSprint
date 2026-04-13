/**
 * Centralized Error Handler Middleware
 * Catches and formats all errors into standardized JSON responses
 */

const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
  });

  // Handle Joi validation errors
  if (err.isJoi || err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation error",
      details: err.details || [{ message: err.message }],
    });
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Handle Firebase errors
  if (err.code?.startsWith("PERMISSION_DENIED")) {
    return res.status(403).json({
      success: false,
      error: "Permission denied",
    });
  }

  // Handle custom app errors with status code
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: err.message || "An error occurred",
    });
  }

  // Default 500 error
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
};

module.exports = errorHandler;
