const express = require("express");
const {
  listCustomers,
  getCustomer,
  setCustomerStatus,
} = require("../../controllers/adminCustomerController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.patch("/:id/status", setCustomerStatus);

module.exports = router;
