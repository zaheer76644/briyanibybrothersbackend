const express = require("express");
const addressRoutes = require("./addressRoutes");
const userOrderRoutes = require("./userOrderRoutes");

const router = express.Router();

router.use("/addresses", addressRoutes);
router.use("/orders", userOrderRoutes);

module.exports = router;
