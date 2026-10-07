const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { getSettings, toPublicSettings } = require("../services/settingsService");

const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  return ok(res, { settings: toPublicSettings(settings) });
});

const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  return ok(res, { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const allowed = [
    "businessName",
    "tagline",
    "minimumOrder",
    "deliveryFee",
    "freeDeliveryAbove",
    "estimatedDeliveryTime",
    "orderingEnabled",
    "acceptingOrders",
    "manualOverride",
    "businessHours",
    "deliveryAreas",
    "whatsappNumber",
    "contactNumber",
    "instagramUrl",
    "announcement",
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) settings[key] = req.body[key];
  }
  await settings.save();
  return ok(res, { settings }, "Settings updated.");
});

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
