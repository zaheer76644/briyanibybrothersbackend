const { body } = require("express-validator");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ max: 80 }),
  body("mobile").trim().notEmpty().withMessage("Mobile is required."),
  body("email").optional({ values: "falsy" }).isEmail().withMessage("Invalid email."),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

const loginRules = [
  body("identifier").trim().notEmpty().withMessage("Mobile or email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

const profileRules = [
  body("name").optional().trim().notEmpty().isLength({ max: 80 }),
  body("email").optional({ values: "falsy" }).isEmail(),
];

const changePasswordRules = [
  body("currentPassword").notEmpty(),
  body("newPassword").isLength({ min: 6 }),
];

module.exports = { registerRules, loginRules, profileRules, changePasswordRules };
