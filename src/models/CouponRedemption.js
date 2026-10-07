const mongoose = require("mongoose");

const couponRedemptionSchema = new mongoose.Schema(
  {
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    discount: { type: Number, required: true },
    redeemedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

couponRedemptionSchema.index({ customer: 1, coupon: 1 });
couponRedemptionSchema.index({ order: 1 }, { unique: true });

module.exports = mongoose.model("CouponRedemption", couponRedemptionSchema);
