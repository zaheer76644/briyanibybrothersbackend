const express = require("express");
const { listMyOrders, getMyOrder } = require("../../controllers/orderController");
const { protectCustomer } = require("../../middleware/customerAuthMiddleware");

const router = express.Router();

router.use(protectCustomer);
router.get("/", listMyOrders);
router.get("/:orderId", getMyOrder);

module.exports = router;
