const express = require("express");
const {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
} = require("../controllers/customerAuthController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const {
  registerRules,
  loginRules,
  profileRules,
  changePasswordRules,
} = require("../validators/authValidator");

const router = express.Router();

router.post("/register", authLimiter, registerRules, validate, register);
router.post("/login", authLimiter, loginRules, validate, login);
router.post("/logout", logout);
router.get("/me", protectCustomer, me);
router.put("/profile", protectCustomer, profileRules, validate, updateProfile);
router.post("/change-password", protectCustomer, changePasswordRules, validate, changePassword);

module.exports = router;
