const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const Admin = require("../models/Admin");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/AppError");

const COOKIE_NAME = "bbb_admin_token";

function getAdminToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

const protectAdmin = asyncHandler(async (req, res, next) => {
  const token = getAdminToken(req);
  if (!token) throw new AppError("Admin authentication required.", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtAdminSecret);
  } catch {
    throw new AppError("Admin session expired. Please login again.", 401);
  }

  if (decoded.role !== "admin" && decoded.role !== "superadmin") {
    throw new AppError("Admin authentication required.", 403);
  }

  const admin = await Admin.findById(decoded.sub);
  if (!admin || !admin.isActive) {
    throw new AppError("Admin account unavailable.", 401);
  }

  req.admin = admin;
  req.authRole = "admin";
  return next();
});

module.exports = { protectAdmin, COOKIE_NAME, getAdminToken };
