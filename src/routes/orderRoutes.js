const express = require("express");
const {
  createOrder,
  previewOrder,
  trackPublicOrder,
} = require("../controllers/orderController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { orderLimiter } = require("../middleware/rateLimitMiddleware");
const { placeOrderRules, trackRules } = require("../validators/orderValidator");

const router = express.Router();

router.post("/", protectCustomer, orderLimiter, placeOrderRules, validate, createOrder);
router.post("/preview", protectCustomer, previewOrder);
router.get("/track/:orderId", trackRules, validate, trackPublicOrder);

module.exports = router;
