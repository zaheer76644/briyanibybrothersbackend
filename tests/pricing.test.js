const { describe, it } = require("node:test");
const assert = require("node:assert/strict");

function computeDeliveryFee(subtotal, { deliveryFee = 20, freeDeliveryAbove = 299 } = {}) {
  if (freeDeliveryAbove > 0 && subtotal >= freeDeliveryAbove) return 0;
  return deliveryFee;
}

function computeDiscount(coupon, subtotal) {
  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maximumDiscount != null) discount = Math.min(discount, coupon.maximumDiscount);
  } else {
    discount = coupon.discountValue;
  }
  return Math.min(Math.max(0, discount), subtotal);
}

describe("pricing helpers", () => {
  it("charges delivery below free threshold", () => {
    assert.equal(computeDeliveryFee(200, { deliveryFee: 20, freeDeliveryAbove: 299 }), 20);
  });

  it("waives delivery at free threshold", () => {
    assert.equal(computeDeliveryFee(299, { deliveryFee: 20, freeDeliveryAbove: 299 }), 0);
  });

  it("applies percentage coupon with max cap", () => {
    assert.equal(
      computeDiscount({ discountType: "PERCENTAGE", discountValue: 20, maximumDiscount: 40 }, 300),
      40
    );
  });

  it("applies flat coupon without exceeding subtotal", () => {
    assert.equal(computeDiscount({ discountType: "FLAT", discountValue: 50 }, 30), 30);
  });
});
