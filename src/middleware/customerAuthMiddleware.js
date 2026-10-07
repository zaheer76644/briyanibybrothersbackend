const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const Customer = require("../models/Customer");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/AppError");

const COOKIE_NAME = "bbb_customer_token";

function getToken(req) {
  if (req.cookies?.[COOKIE_NAME]) return req.cookies[COOKIE_NAME];
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

const protectCustomer = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) throw new AppError("Authentication required.", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtCustomerSecret);
  } catch {
    throw new AppError("Session expired. Please login again.", 401);
  }

  if (decoded.role !== "customer") {
    throw new AppError("Authentication required.", 401);
  }

  const customer = await Customer.findById(decoded.sub);
  if (!customer || !customer.isActive) {
    throw new AppError("Account unavailable. Please contact support.", 401);
  }

  req.user = customer;
  req.authRole = "customer";
  return next();
});

const optionalCustomer = asyncHandler(async (req, res, next) => {
  const token = getToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtCustomerSecret);
    if (decoded.role === "customer") {
      const customer = await Customer.findById(decoded.sub);
      if (customer?.isActive) {
        req.user = customer;
        req.authRole = "customer";
      }
    }
  } catch {
    // ignore optional auth failures
  }
  return next();
});

module.exports = { protectCustomer, optionalCustomer, COOKIE_NAME, getToken };
