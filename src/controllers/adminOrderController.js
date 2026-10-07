const Order = require("../models/Order");
const { ORDER_STATUSES, PAYMENT_STATUSES } = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");
const { releaseStock } = require("../services/stockService");
const mongoose = require("mongoose");

const STATUS_FLOW = ["PLACED", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "DELIVERED"];

const listOrders = asyncHandler(async (req, res) => {
  const { status, paymentStatus, date, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    filter.createdAt = { $gte: start, $lte: end };
  }
  if (search) {
    const q = String(search).trim();
    filter.$or = [
      { orderId: new RegExp(q, "i") },
      { "customerSnapshot.name": new RegExp(q, "i") },
      { "customerSnapshot.mobile": new RegExp(q, "i") },
      { "deliveryAddress.mobile": new RegExp(q, "i") },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(100, Number(limit))),
    Order.countDocuments(filter),
  ]);

  return ok(res, { orders, total, page: Number(page), limit: Number(limit) });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);
  return ok(res, { order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);

  const next = req.body.status;
  if (!ORDER_STATUSES.includes(next)) throw new AppError("Invalid status.", 400);

  if (next === "CANCELLED") {
    if (!req.body.confirm) throw new AppError("Cancellation requires confirmation.", 400);
    if (order.orderStatus === "DELIVERED") throw new AppError("Cannot cancel a delivered order.", 400);
    if (order.orderStatus !== "CANCELLED") {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        order.orderStatus = "CANCELLED";
        order.statusHistory.push({ status: "CANCELLED", timestamp: new Date(), note: req.body.note || "" });
        await order.save({ session });
        await releaseStock(order.items, session);
        await session.commitTransaction();
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }
    return ok(res, { order }, "Order cancelled.");
  }

  if (order.orderStatus === "CANCELLED") throw new AppError("Cancelled order cannot be updated.", 400);

  const currentIdx = STATUS_FLOW.indexOf(order.orderStatus);
  const nextIdx = STATUS_FLOW.indexOf(next);
  if (nextIdx === -1 || nextIdx < currentIdx) {
    throw new AppError("Invalid status transition.", 400);
  }

  order.orderStatus = next;
  order.statusHistory.push({ status: next, timestamp: new Date(), note: req.body.note || "" });
  if (next === "DELIVERED" && order.paymentMethod !== "ONLINE") {
    // COD / UPI on delivery typically collected on delivery
    if (order.paymentStatus === "PENDING") order.paymentStatus = "PAID";
  }
  await order.save();
  return ok(res, { order }, "Order status updated.");
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);
  if (!PAYMENT_STATUSES.includes(req.body.paymentStatus)) {
    throw new AppError("Invalid payment status.", 400);
  }
  order.paymentStatus = req.body.paymentStatus;
  await order.save();
  return ok(res, { order }, "Payment status updated.");
});

const updateNotes = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found.", 404);
  if (req.body.adminNotes !== undefined) order.adminNotes = req.body.adminNotes;
  await order.save();
  return ok(res, { order }, "Notes updated.");
});

module.exports = {
  listOrders,
  getOrder,
  updateStatus,
  updatePaymentStatus,
  updateNotes,
};
