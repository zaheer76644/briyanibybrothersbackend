const Customer = require("../models/Customer");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

const listCustomers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (search) {
    const q = String(search).trim();
    filter.$or = [
      { name: new RegExp(q, "i") },
      { mobile: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
    ];
  }

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const customers = await Customer.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Math.min(100, Number(limit)));

  const enriched = await Promise.all(
    customers.map(async (c) => {
      const orders = await Order.find({
        customer: c._id,
        orderStatus: { $ne: "CANCELLED" },
      }).sort({ createdAt: -1 });
      const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
      return {
        ...c.toSafeJSON(),
        totalOrders: orders.length,
        totalSpend,
        lastOrder: orders[0]?.createdAt || null,
      };
    })
  );

  const total = await Customer.countDocuments(filter);
  return ok(res, { customers: enriched, total, page: Number(page), limit: Number(limit) });
});

const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError("Customer not found.", 404);
  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
  const activeOrders = orders.filter((o) => o.orderStatus !== "CANCELLED");
  return ok(res, {
    customer: {
      ...customer.toSafeJSON(),
      totalOrders: activeOrders.length,
      totalSpend: activeOrders.reduce((sum, o) => sum + o.total, 0),
      lastOrder: activeOrders[0]?.createdAt || null,
    },
    orders,
  });
});

const setCustomerStatus = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) throw new AppError("Customer not found.", 404);
  customer.isActive = Boolean(req.body.isActive);
  await customer.save();
  return ok(res, { customer: customer.toSafeJSON() }, "Customer status updated.");
});

module.exports = { listCustomers, getCustomer, setCustomerStatus };
