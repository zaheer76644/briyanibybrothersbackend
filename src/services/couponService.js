const Coupon = require("../models/Coupon");
const CouponRedemption = require("../models/CouponRedemption");
const Order = require("../models/Order");
const { AppError } = require("../utils/AppError");

function computeDiscount(coupon, subtotal) {
  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maximumDiscount != null) {
      discount = Math.min(discount, coupon.maximumDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(Math.max(0, discount), subtotal);
}

async function validateCouponForCustomer({ code, customerId, subtotal }) {
  if (!code) return { coupon: null, discount: 0 };

  const coupon = await Coupon.findOne({ code: String(code).trim().toUpperCase() });
  if (!coupon || !coupon.isActive) throw new AppError("Invalid coupon code.", 400);

  const now = new Date();
  if (coupon.startDate && now < coupon.startDate) throw new AppError("This coupon is not active yet.", 400);
  if (coupon.expiryDate && now > coupon.expiryDate) throw new AppError("This coupon has expired.", 400);
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    throw new AppError("This coupon is no longer available.", 400);
  }
  if (subtotal < (coupon.minimumOrder || 0)) {
    throw new AppError(`Minimum order of ₹${coupon.minimumOrder} required for this coupon.`, 400);
  }

  if (coupon.firstOrderOnly) {
    const prior = await Order.countDocuments({
      customer: customerId,
      orderStatus: { $ne: "CANCELLED" },
    });
    if (prior > 0) throw new AppError("This coupon is for first orders only.", 400);
  }

  if (coupon.perCustomerLimit != null) {
    const used = await CouponRedemption.countDocuments({
      coupon: coupon._id,
      customer: customerId,
    });
    if (used >= coupon.perCustomerLimit) {
      throw new AppError("You have already used this coupon.", 400);
    }
  }

  const discount = computeDiscount(coupon, subtotal);
  return { coupon, discount };
}

module.exports = { validateCouponForCustomer, computeDiscount };
