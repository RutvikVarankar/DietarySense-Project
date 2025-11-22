const ErrorResponse = require("../utils/ErrorResponse");

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for development
  if (process.env.NODE_ENV === "development") {
    console.error("Error Stack:", err.stack);
    console.error("Error Details:", {
      name: err.name,
      message: err.message,
      code: err.code,
      keyValue: err.keyValue,
    });
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field} '${value}' already exists`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    const message = messages.join(", ");
    error = new ErrorResponse(message, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = new ErrorResponse(message, 401);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = new ErrorResponse(message, 401);
  }

  // Multer errors (file upload)
  if (err.name === "MulterError") {
    let message = "File upload error";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File too large. Maximum size is 5MB";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Too many files";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected field";
    }

    error = new ErrorResponse(message, 400);
  }

  // Cloudinary errors
  if (err.message && err.message.includes("Cloudinary")) {
    const message = "Image upload service error";
    error = new ErrorResponse(message, 500);
  }

  // Send error response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Server Error",
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
    response.error = err;
  }

  // Include validation errors if any
  if (err.errors) {
    response.errors = err.errors;
  }

  res.status(statusCode).json(response);
};

// Async error handler wrapper (to avoid try-catch in controllers)
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 404 Not Found middleware
const notFound = (req, res, next) => {
  const error = new ErrorResponse(`Route not found - ${req.originalUrl}`, 404);
  next(error);
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  // Remove potentially sensitive headers
  res.removeHeader("X-Powered-By");

  // Add security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

// Request logging middleware (for development)
const requestLogger = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${req.method} ${req.originalUrl}`, {
      body: req.body,
      query: req.query,
      params: req.params,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }
  next();
};

// Rate limiting error handler
const rateLimitHandler = (req, res) => {
  res.status(429).json({
    success: false,
    message: "Too many requests, please try again later.",
  });
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound,
  securityHeaders,
  requestLogger,
  rateLimitHandler,
};
