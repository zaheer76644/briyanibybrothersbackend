const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { getDashboardSummary, getSalesReport } = require("../services/dashboardService");

const getDashboard = asyncHandler(async (req, res) => {
  const data = await getDashboardSummary();
  return ok(res, data);
});

const getSales = asyncHandler(async (req, res) => {
  const data = await getSalesReport({ from: req.query.from, to: req.query.to });
  return ok(res, data);
});

module.exports = { getDashboard, getSales };
