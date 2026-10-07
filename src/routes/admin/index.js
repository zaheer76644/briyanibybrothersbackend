const express = require("express");
const adminAuthRoutes = require("./adminAuthRoutes");
const adminOrderRoutes = require("./adminOrderRoutes");
const adminProductRoutes = require("./adminProductRoutes");
const adminCategoryRoutes = require("./adminCategoryRoutes");
const adminCouponRoutes = require("./adminCouponRoutes");
const adminReviewRoutes = require("./adminReviewRoutes");
const adminSettingsRoutes = require("./adminSettingsRoutes");
const adminCustomerRoutes = require("./adminCustomerRoutes");
const adminDashboardRoutes = require("./adminDashboardRoutes");

const router = express.Router();

router.use("/auth", adminAuthRoutes);
router.use("/orders", adminOrderRoutes);
router.use("/products", adminProductRoutes);
router.use("/categories", adminCategoryRoutes);
router.use("/coupons", adminCouponRoutes);
router.use("/reviews", adminReviewRoutes);
router.use("/settings", adminSettingsRoutes);
router.use("/customers", adminCustomerRoutes);
router.use("/dashboard", adminDashboardRoutes);

module.exports = router;
