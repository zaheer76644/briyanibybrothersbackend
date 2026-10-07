const express = require("express");
const {
  listOrders,
  getOrder,
  updateStatus,
  updatePaymentStatus,
  updateNotes,
} = require("../../controllers/adminOrderController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateStatus);
router.patch("/:id/payment-status", updatePaymentStatus);
router.patch("/:id/notes", updateNotes);

module.exports = router;
