const express = require("express");
const { validateCoupon } = require("../controllers/couponController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { couponLimiter } = require("../middleware/rateLimitMiddleware");
const { validateCouponRules } = require("../validators/couponValidator");

const router = express.Router();

router.post("/validate", protectCustomer, couponLimiter, validateCouponRules, validate, validateCoupon);

module.exports = router;
