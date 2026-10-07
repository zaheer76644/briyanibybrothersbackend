const express = require("express");
const { login, me, logout } = require("../../controllers/adminAuthController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");
const { adminAuthLimiter } = require("../../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/login", adminAuthLimiter, login);
router.get("/me", protectAdmin, me);
router.post("/logout", logout);

module.exports = router;
