const express = require("express");
const {
  adminListCoupons,
  adminGetCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../../controllers/couponController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");
const { validate } = require("../../middleware/validateMiddleware");
const { couponRules } = require("../../validators/couponValidator");

const router = express.Router();

router.use(protectAdmin);
router.get("/", adminListCoupons);
router.post("/", couponRules, validate, createCoupon);
router.get("/:id", adminGetCoupon);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
