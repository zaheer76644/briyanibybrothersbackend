const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const Admin = require("../models/Admin");
const { AppError } = require("../utils/AppError");
const { COOKIE_NAME } = require("../middleware/adminAuthMiddleware");

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    env.jwtAdminSecret,
    { expiresIn: env.jwtAdminExpires }
  );
}

function setAdminCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearAdminCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
  });
}

async function loginAdmin({ email, password }) {
  const admin = await Admin.findOne({ email: String(email || "").toLowerCase().trim() }).select("+password");
  if (!admin || !admin.isActive) throw new AppError("Invalid credentials.", 401);
  const match = await admin.comparePassword(password);
  if (!match) throw new AppError("Invalid credentials.", 401);
  return admin;
}

module.exports = {
  signAdminToken,
  setAdminCookie,
  clearAdminCookie,
  loginAdmin,
};
