const express = require("express");
const { getDashboard, getSales } = require("../../controllers/dashboardController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", getDashboard);
router.get("/sales", getSales);

module.exports = router;
