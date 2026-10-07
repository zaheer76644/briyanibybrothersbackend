const { body, param, query } = require("express-validator");

const placeOrderRules = [
  body("deliveryAddress.fullName").trim().notEmpty(),
  body("deliveryAddress.mobile").trim().notEmpty(),
  body("deliveryAddress.flatHouse").trim().notEmpty(),
  body("deliveryAddress.buildingSociety").trim().notEmpty(),
  body("deliveryAddress.area").trim().notEmpty(),
  body("deliveryAddress.pincode").trim().isLength({ min: 6, max: 6 }),
  body("items").isArray({ min: 1 }).withMessage("Cart items are required."),
  body("items.*.productId").notEmpty(),
  body("items.*.quantity").isInt({ min: 1, max: 20 }),
  body("paymentMethod").isIn(["COD", "UPI_ON_DELIVERY"]),
  body("couponCode").optional({ values: "falsy" }).isString(),
  body("idempotencyKey").optional({ values: "falsy" }).isString().isLength({ max: 100 }),
  body("customerNotes").optional({ values: "falsy" }).isString().isLength({ max: 500 }),
];

const trackRules = [
  param("orderId").trim().notEmpty(),
  query("mobile").trim().notEmpty().withMessage("Mobile is required to track an order."),
];

module.exports = { placeOrderRules, trackRules };
