const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];
const PAYMENT_METHODS = ["COD", "UPI_ON_DELIVERY"];

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productImage: { type: String, default: "" },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerSnapshot: {
      name: String,
      mobile: String,
      email: String,
    },
    deliveryAddress: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      flatHouse: { type: String, required: true },
      buildingSociety: { type: String, required: true },
      area: { type: String, required: true },
      landmark: { type: String, default: "" },
      pincode: { type: String, required: true },
      instructions: { type: String, default: "" },
    },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "PENDING" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "PLACED" },
    customerNotes: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    estimatedDeliveryMinutes: {
      min: { type: Number, default: 30 },
      max: { type: Number, default: 45 },
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES },
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: "" },
      },
    ],
    idempotencyKey: { type: String, default: null },
    // Future: Razorpay / gateway fields without rewriting core order shape
    paymentGateway: {
      provider: { type: String, default: null },
      paymentId: { type: String, default: null },
      orderRef: { type: String, default: null },
      raw: { type: mongoose.Schema.Types.Mixed, default: null },
    },
  },
  { timestamps: true }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ customer: 1, idempotencyKey: 1 }, { unique: true, partialFilterExpression: { idempotencyKey: { $type: "string" } } });

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
module.exports.PAYMENT_STATUSES = PAYMENT_STATUSES;
module.exports.PAYMENT_METHODS = PAYMENT_METHODS;
