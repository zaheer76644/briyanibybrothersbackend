const rateLimit = require("express-rate-limit");

function createLimiter({ windowMs = 15 * 60 * 1000, max = 20, message = "Too many requests. Please try again later." } = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message, errors: [] },
  });
}

const authLimiter = createLimiter({ max: 20, message: "Too many auth attempts. Try again later." });
const orderLimiter = createLimiter({ max: 30, message: "Too many order attempts. Try again later." });
const reviewLimiter = createLimiter({ max: 20 });
const couponLimiter = createLimiter({ max: 40 });
const adminAuthLimiter = createLimiter({ max: 15, message: "Too many admin login attempts." });

module.exports = {
  createLimiter,
  authLimiter,
  orderLimiter,
  reviewLimiter,
  couponLimiter,
  adminAuthLimiter,
};
