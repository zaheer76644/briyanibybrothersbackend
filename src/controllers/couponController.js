const Coupon = require("../models/Coupon");
const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { validateCouponForCustomer } = require("../services/couponService");
const { buildPricedItems } = require("../services/pricingService");

const validateCoupon = asyncHandler(async (req, res) => {
  let subtotal = Number(req.body.subtotal);
  if (req.body.items?.length) {
    const priced = await buildPricedItems(req.body.items);
    subtotal = priced.subtotal;
  }
  if (!Number.isFinite(subtotal)) throw new AppError("Subtotal or items required.", 400);

  const { coupon, discount } = await validateCouponForCustomer({
    code: req.body.code,
    customerId: req.user._id,
    subtotal,
  });

  return ok(res, {
    code: coupon.code,
    discount,
    discountType: coupon.discountType,
    description: coupon.description,
  }, "Coupon applied.");
});

const adminListCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return ok(res, { coupons });
});

const adminGetCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError("Coupon not found.", 404);
  return ok(res, { coupon });
});

const createCoupon = asyncHandler(async (req, res) => {
  const data = { ...req.body, code: String(req.body.code).toUpperCase().trim() };
  const coupon = await Coupon.create(data);
  return ok(res, { coupon }, "Coupon created.", 201);
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw new AppError("Coupon not found.", 404);
  Object.assign(coupon, req.body);
  if (req.body.code) coupon.code = String(req.body.code).toUpperCase().trim();
  await coupon.save();
  return ok(res, { coupon }, "Coupon updated.");
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new AppError("Coupon not found.", 404);
  return ok(res, {}, "Coupon deleted.");
});

module.exports = {
  validateCoupon,
  adminListCoupons,
  adminGetCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
