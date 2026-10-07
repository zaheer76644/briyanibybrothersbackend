const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const Customer = require("../models/Customer");
const { AppError } = require("../utils/AppError");
const { COOKIE_NAME } = require("../middleware/customerAuthMiddleware");

function signCustomerToken(customer) {
  return jwt.sign(
    { sub: customer._id.toString(), role: "customer" },
    env.jwtCustomerSecret,
    { expiresIn: env.jwtCustomerExpires }
  );
}

function setCustomerCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

function clearCustomerCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? "none" : "lax",
    path: "/",
  });
}

function normalizeMobile(mobile) {
  const digits = String(mobile || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
}

function isValidIndianMobile(mobile) {
  return /^[6-9]\d{9}$/.test(normalizeMobile(mobile));
}

async function registerCustomer({ name, mobile, email, password }) {
  const cleanMobile = normalizeMobile(mobile);
  if (!name?.trim()) throw new AppError("Name is required.", 400);
  if (!isValidIndianMobile(cleanMobile)) throw new AppError("Enter a valid Indian mobile number.", 400);
  if (!password || password.length < 6) throw new AppError("Password must be at least 6 characters.", 400);

  const cleanEmail = email ? String(email).trim().toLowerCase() : "";
  if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new AppError("Enter a valid email address.", 400);
  }

  const existingMobile = await Customer.findOne({ mobile: cleanMobile });
  if (existingMobile) throw new AppError("An account with this mobile already exists.", 409);

  if (cleanEmail) {
    const existingEmail = await Customer.findOne({ email: cleanEmail });
    if (existingEmail) throw new AppError("An account with this email already exists.", 409);
  }

  const customer = await Customer.create({
    name: name.trim(),
    mobile: cleanMobile,
    email: cleanEmail || null,
    password,
    lastLoginAt: new Date(),
  });

  return customer;
}

async function loginCustomer({ identifier, password }) {
  const raw = String(identifier || "").trim().toLowerCase();
  if (!raw || !password) throw new AppError("Invalid credentials.", 401);

  const isEmail = raw.includes("@");
  const query = isEmail
    ? { email: raw }
    : { mobile: normalizeMobile(raw) };

  const customer = await Customer.findOne(query).select("+password");
  if (!customer || !customer.isActive) throw new AppError("Invalid credentials.", 401);

  const match = await customer.comparePassword(password);
  if (!match) throw new AppError("Invalid credentials.", 401);

  customer.lastLoginAt = new Date();
  await customer.save({ validateBeforeSave: false });
  return customer;
}

module.exports = {
  signCustomerToken,
  setCustomerCookie,
  clearCustomerCookie,
  registerCustomer,
  loginCustomer,
  normalizeMobile,
  isValidIndianMobile,
};
