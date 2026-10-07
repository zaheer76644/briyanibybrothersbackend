const { body } = require("express-validator");

const couponRules = [
  body("code").trim().notEmpty(),
  body("discountType").isIn(["PERCENTAGE", "FLAT"]),
  body("discountValue").isFloat({ min: 0 }),
  body("minimumOrder").optional().isFloat({ min: 0 }),
  body("isActive").optional().isBoolean(),
  body("firstOrderOnly").optional().isBoolean(),
];

const validateCouponRules = [
  body("code").trim().notEmpty(),
  body("subtotal").optional().isFloat({ min: 0 }),
];

module.exports = { couponRules, validateCouponRules };
