const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const {
  placeOrder,
  getCustomerOrders,
  getCustomerOrder,
  trackOrder,
} = require("../services/orderService");
const { buildPricedItems, calculateDeliveryFee, resolveDeliveryArea } = require("../services/pricingService");
const { validateCouponForCustomer } = require("../services/couponService");
const { getSettings } = require("../services/settingsService");
const { AppError } = require("../utils/AppError");

const createOrder = asyncHandler(async (req, res) => {
  const { order, whatsapp, duplicate } = await placeOrder({
    customer: req.user,
    payload: req.body,
  });

  return ok(
    res,
    {
      orderId: order.orderId,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      estimatedDeliveryTime: order.estimatedDeliveryMinutes,
      whatsapp,
      duplicate: Boolean(duplicate),
    },
    duplicate ? "Order already placed." : "Order placed successfully.",
    duplicate ? 200 : 201
  );
});

const previewOrder = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const { pricedItems, subtotal } = await buildPricedItems(req.body.items || []);
  const area = resolveDeliveryArea(settings, req.body.pincode);
  if (!area) throw new AppError("Delivery unavailable for this pincode.", 400);
  const { coupon, discount } = await validateCouponForCustomer({
    code: req.body.couponCode,
    customerId: req.user._id,
    subtotal,
  });
  const deliveryFee = calculateDeliveryFee(subtotal, settings, area);
  const total = Math.max(0, subtotal + deliveryFee - discount);
  return ok(res, {
    items: pricedItems.map(({ productDoc, ...rest }) => rest),
    subtotal,
    deliveryFee,
    discount,
    couponCode: coupon?.code || "",
    total,
    minimumOrder: area.minimumOrder ?? settings.minimumOrder,
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const data = await getCustomerOrders(req.user._id, {
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
  });
  return ok(res, data);
});

const getMyOrder = asyncHandler(async (req, res) => {
  const order = await getCustomerOrder(req.user._id, req.params.orderId);
  return ok(res, { order });
});

const trackPublicOrder = asyncHandler(async (req, res) => {
  const data = await trackOrder({ orderId: req.params.orderId, mobile: req.query.mobile });
  return ok(res, { tracking: data });
});

module.exports = {
  createOrder,
  previewOrder,
  listMyOrders,
  getMyOrder,
  trackPublicOrder,
};
