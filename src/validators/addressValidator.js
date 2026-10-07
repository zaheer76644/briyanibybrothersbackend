const { body, param } = require("express-validator");

const addressRules = [
  body("label").optional().isIn(["HOME", "WORK", "OTHER"]),
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("mobile").trim().notEmpty().withMessage("Mobile is required."),
  body("flatHouse").trim().notEmpty().withMessage("Flat / house is required."),
  body("buildingSociety").trim().notEmpty().withMessage("Building / society is required."),
  body("area").trim().notEmpty().withMessage("Area is required."),
  body("landmark").optional().trim(),
  body("pincode").trim().isLength({ min: 6, max: 6 }).withMessage("Valid pincode required."),
  body("isDefault").optional().isBoolean(),
];

const addressIdParam = [param("id").isMongoId().withMessage("Invalid address id.")];

module.exports = { addressRules, addressIdParam };
