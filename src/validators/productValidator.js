const { body, param } = require("express-validator");

const productRules = [
  body("name").trim().notEmpty(),
  body("slug").optional().trim(),
  body("description").optional().isString(),
  body("category").isMongoId(),
  body("price").isFloat({ min: 0 }),
  body("foodType").isIn(["veg", "non-veg", "egg"]),
  body("spiceLevel").optional().isIn(["mild", "medium", "spicy"]),
  body("isAvailable").optional().isBoolean(),
  body("isFeatured").optional().isBoolean(),
  body("trackStock").optional().isBoolean(),
  body("dailyStock").optional().isInt({ min: 0 }),
];

const productIdParam = [param("id").isMongoId()];

module.exports = { productRules, productIdParam };
