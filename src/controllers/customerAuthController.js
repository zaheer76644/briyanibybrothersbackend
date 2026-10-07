const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const {
  registerCustomer,
  loginCustomer,
  signCustomerToken,
  setCustomerCookie,
  clearCustomerCookie,
} = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const customer = await registerCustomer(req.body);
  const token = signCustomerToken(customer);
  setCustomerCookie(res, token);
  return ok(res, { user: customer.toSafeJSON() }, "Account created successfully.", 201);
});

const login = asyncHandler(async (req, res) => {
  const customer = await loginCustomer(req.body);
  const token = signCustomerToken(customer);
  setCustomerCookie(res, token);
  return ok(res, { user: customer.toSafeJSON() }, "Logged in successfully.");
});

const logout = asyncHandler(async (req, res) => {
  clearCustomerCookie(res);
  return ok(res, {}, "Logged out successfully.");
});

const me = asyncHandler(async (req, res) => {
  return ok(res, { user: req.user.toSafeJSON() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (name) req.user.name = name.trim();
  if (email !== undefined) req.user.email = String(email || "").trim().toLowerCase();
  await req.user.save();
  return ok(res, { user: req.user.toSafeJSON() }, "Profile updated.");
});

const changePassword = asyncHandler(async (req, res) => {
  const Customer = require("../models/Customer");
  const customer = await Customer.findById(req.user._id).select("+password");
  const match = await customer.comparePassword(req.body.currentPassword);
  if (!match) throw new AppError("Current password is incorrect.", 400);
  customer.password = req.body.newPassword;
  await customer.save();
  return ok(res, {}, "Password changed successfully.");
});

module.exports = {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
};
