const mongoose = require("mongoose");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");
const CouponRedemption = require("../models/CouponRedemption");
const { AppError } = require("../utils/AppError");
const { generateOrderId } = require("../utils/generateOrderId");
const { buildPricedItems, calculateDeliveryFee, resolveDeliveryArea } = require("./pricingService");
const { validateCouponForCustomer } = require("./couponService");
const { getSettings, getOrderingStatus } = require("./settingsService");
const { reserveStock } = require("./stockService");
const { buildOrderWhatsAppMessage } = require("./whatsappService");

async function createOrderDocuments({
  customer,
  deliveryAddress,
  pricedItems,
  subtotal,
  deliveryFee,
  discount,
  coupon,
  total,
  paymentMethod,
  customerNotes,
  idempotencyKey,
  settings,
  session,
}) {
  await reserveStock(pricedItems, session);
  const orderId = await generateOrderId(session);

  const orderDoc = {
    orderId,
    customer: customer._id,
    customerSnapshot: {
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || "",
    },
    deliveryAddress: {
      fullName: deliveryAddress.fullName,
      mobile: deliveryAddress.mobile,
      flatHouse: deliveryAddress.flatHouse,
      buildingSociety: deliveryAddress.buildingSociety,
      area: deliveryAddress.area,
      landmark: deliveryAddress.landmark || "",
      pincode: deliveryAddress.pincode,
      instructions: deliveryAddress.instructions || customerNotes || "",
    },
    items: pricedItems.map((item) => ({
      product: item.product,
      productName: item.productName,
      productImage: item.productImage,
      price: item.price,
      quantity: item.quantity,
      addOns: item.addOns,
      itemTotal: item.itemTotal,
    })),
    subtotal,
    deliveryFee,
    discount,
    couponCode: coupon?.code || "",
    coupon: coupon?._id,
    total,
    paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PLACED",
    customerNotes: customerNotes || "",
    estimatedDeliveryMinutes: settings.estimatedDeliveryTime,
    statusHistory: [{ status: "PLACED", timestamp: new Date() }],
    idempotencyKey: idempotencyKey ? String(idempotencyKey) : undefined,
  };

  const created = session
    ? await Order.create([orderDoc], { session })
    : [await Order.create(orderDoc)];
  const order = created[0];

  if (coupon) {
    if (session) {
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } }, { session });
      await CouponRedemption.create(
        [{ coupon: coupon._id, customer: customer._id, order: order._id, discount }],
        { session }
      );
    } else {
      await Coupon.updateOne({ _id: coupon._id }, { $inc: { usageCount: 1 } });
      await CouponRedemption.create({
        coupon: coupon._id,
        customer: customer._id,
        order: order._id,
        discount,
      });
    }
  }

  return order;
}

async function placeOrder({ customer, payload }) {
  const settings = await getSettings();
  const ordering = getOrderingStatus(settings);
  if (!ordering.canOrder) {
    throw new AppError(ordering.message, 403);
  }

  const {
    deliveryAddress,
    items,
    couponCode,
    paymentMethod,
    customerNotes,
    idempotencyKey,
  } = payload;

  if (!["COD", "UPI_ON_DELIVERY"].includes(paymentMethod)) {
    throw new AppError("Invalid payment method.", 400);
  }

  if (!deliveryAddress?.pincode) {
    throw new AppError("Delivery address is required.", 400);
  }

  const area = resolveDeliveryArea(settings, deliveryAddress.pincode);
  if (!area || !area.enabled) {
    throw new AppError("Sorry, we do not deliver to this pincode yet.", 400);
  }

  if (idempotencyKey) {
    const existing = await Order.findOne({
      customer: customer._id,
      idempotencyKey: String(idempotencyKey),
    });
    if (existing) {
      const wa = buildOrderWhatsAppMessage(existing, settings);
      return { order: existing, whatsapp: wa, duplicate: true };
    }
  }

  const { pricedItems, subtotal } = await buildPricedItems(items);
  const minimumOrder = area.minimumOrder ?? settings.minimumOrder;
  if (subtotal < minimumOrder) {
    throw new AppError(`Minimum order is ₹${minimumOrder}.`, 400);
  }

  const { coupon, discount } = await validateCouponForCustomer({
    code: couponCode,
    customerId: customer._id,
    subtotal,
  });

  const deliveryFee = calculateDeliveryFee(subtotal, settings, area);
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const args = {
    customer,
    deliveryAddress,
    pricedItems,
    subtotal,
    deliveryFee,
    discount,
    coupon,
    total,
    paymentMethod,
    customerNotes,
    idempotencyKey,
    settings,
  };

  let order;
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    if (idempotencyKey) {
      const again = await Order.findOne({
        customer: customer._id,
        idempotencyKey: String(idempotencyKey),
      }).session(session);
      if (again) {
        await session.abortTransaction();
        const wa = buildOrderWhatsAppMessage(again, settings);
        return { order: again, whatsapp: wa, duplicate: true };
      }
    }
    order = await createOrderDocuments({ ...args, session });
    await session.commitTransaction();
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {
      // ignore
    }
    // Standalone MongoDB (no replica set) cannot use transactions — fall back safely.
    const isTxnUnsupported =
      err.code === 20 ||
      /Transaction numbers are only allowed/i.test(err.message) ||
      /replica set/i.test(err.message);
    if (!isTxnUnsupported) throw err;
    order = await createOrderDocuments({ ...args, session: null });
  } finally {
    session.endSession();
  }

  const wa = buildOrderWhatsAppMessage(order, settings);
  return { order, whatsapp: wa, duplicate: false };
}

async function getCustomerOrders(customerId, { page = 1, limit = 10, status } = {}) {
  const filter = { customer: customerId };
  if (status) filter.orderStatus = status;

  const skip = (Math.max(1, page) - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(50, limit)),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page: Number(page), limit: Number(limit) };
}

async function getCustomerOrder(customerId, orderId) {
  const order = await Order.findOne({ orderId, customer: customerId });
  if (!order) throw new AppError("Order not found.", 404);
  return order;
}

async function trackOrder({ orderId, mobile }) {
  const order = await Order.findOne({ orderId });
  if (!order) throw new AppError("Order not found.", 404);
  const clean = String(mobile || "").replace(/\D/g, "").slice(-10);
  const orderMobile = String(order.deliveryAddress.mobile || "").replace(/\D/g, "").slice(-10);
  if (clean !== orderMobile) throw new AppError("Order not found.", 404);
  return {
    orderId: order.orderId,
    orderStatus: order.orderStatus,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    total: order.total,
    estimatedDeliveryMinutes: order.estimatedDeliveryMinutes,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
  };
}

module.exports = {
  placeOrder,
  getCustomerOrders,
  getCustomerOrder,
  trackOrder,
};
