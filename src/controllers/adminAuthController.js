const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const {
  loginAdmin,
  signAdminToken,
  setAdminCookie,
  clearAdminCookie,
} = require("../services/adminAuthService");

const login = asyncHandler(async (req, res) => {
  const admin = await loginAdmin(req.body);
  const token = signAdminToken(admin);
  setAdminCookie(res, token);
  return ok(res, { admin: admin.toSafeJSON() }, "Admin logged in.");
});

const me = asyncHandler(async (req, res) => {
  return ok(res, { admin: req.admin.toSafeJSON() });
});

const logout = asyncHandler(async (req, res) => {
  clearAdminCookie(res);
  return ok(res, {}, "Admin logged out.");
});

module.exports = { login, me, logout };
