const { env } = require("../config/env");
const { fail } = require("../utils/apiResponse");

function notFound(req, res, next) {
  return fail(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || "Internal server error.";
  let errors = err.errors || [];

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed.";
    errors = Object.values(err.errors || {}).map((e) => e.message);
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    message = `${field} already exists.`;
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid identifier.";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = "Session expired. Please login again.";
  }

  if (status >= 500 && env.isProd) {
    message = "Something went wrong. Please try again.";
    errors = [];
  }

  if (!env.isProd && status >= 500) {
    console.error(err);
  }

  return fail(res, message, status, errors);
}

module.exports = { notFound, errorHandler };
