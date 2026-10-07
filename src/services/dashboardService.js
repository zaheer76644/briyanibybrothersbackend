const Order = require("../models/Order");
const Customer = require("../models/Customer");

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getDashboardSummary() {
  const todayStart = startOfDay();

  const deliveredToday = await Order.find({
    orderStatus: "DELIVERED",
    updatedAt: { $gte: todayStart },
  });

  const ordersToday = await Order.countDocuments({ createdAt: { $gte: todayStart } });
  const revenue = deliveredToday.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = deliveredToday.length ? Math.round(revenue / deliveredToday.length) : 0;

  const statusGroups = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  const orderStatusCounts = Object.fromEntries(statusGroups.map((g) => [g._id, g.count]));

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select("orderId customerSnapshot total paymentMethod orderStatus createdAt");

  const topProducts = await Order.aggregate([
    { $match: { orderStatus: { $ne: "CANCELLED" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productName",
        quantity: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.itemTotal" },
      },
    },
    { $sort: { quantity: -1 } },
    { $limit: 5 },
  ]);

  const totalCustomers = await Customer.countDocuments();
  const newCustomersToday = await Customer.countDocuments({ createdAt: { $gte: todayStart } });
  const repeatAgg = await Order.aggregate([
    { $match: { orderStatus: { $ne: "CANCELLED" } } },
    { $group: { _id: "$customer", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
    { $count: "repeat" },
  ]);

  const preparing = await Order.countDocuments({
    orderStatus: { $in: ["CONFIRMED", "PREPARING", "READY"] },
  });

  return {
    today: {
      orders: ordersToday,
      revenue,
      averageOrderValue,
      preparing,
    },
    orderStatusCounts,
    recentOrders,
    topProducts: topProducts.map((p) => ({
      name: p._id,
      quantity: p.quantity,
      revenue: p.revenue,
    })),
    salesSummary: {
      deliveredOrdersToday: deliveredToday.length,
      revenueToday: revenue,
    },
    customerSummary: {
      totalCustomers,
      newCustomersToday,
      repeatCustomers: repeatAgg[0]?.repeat || 0,
    },
  };
}

async function getSalesReport({ from, to }) {
  const match = {
    orderStatus: "DELIVERED",
  };
  if (from || to) {
    match.updatedAt = {};
    if (from) match.updatedAt.$gte = new Date(from);
    if (to) match.updatedAt.$lte = new Date(to);
  }

  const orders = await Order.find(match);
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const averageOrderValue = orderCount ? Math.round(revenue / orderCount) : 0;

  const productMap = {};
  for (const order of orders) {
    for (const item of order.items) {
      productMap[item.productName] = (productMap[item.productName] || 0) + item.quantity;
    }
  }

  const cancelledOrders = await Order.countDocuments({
    orderStatus: "CANCELLED",
    ...(match.updatedAt ? { updatedAt: match.updatedAt } : {}),
  });

  return {
    revenue,
    orderCount,
    averageOrderValue,
    productQuantities: productMap,
    cancelledOrders,
  };
}

module.exports = { getDashboardSummary, getSalesReport };
