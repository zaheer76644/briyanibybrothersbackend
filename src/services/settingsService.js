const Settings = require("../models/Settings");

const DEFAULT_HOURS = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
].map((day) => ({ day, enabled: true, open: "12:00", close: "23:00" }));

const DEFAULT_SETTINGS = {
  businessName: "Biryani By Brothers",
  tagline: "From Our Handi to Your Heart.",
  minimumOrder: 149,
  deliveryFee: 20,
  freeDeliveryAbove: 299,
  estimatedDeliveryTime: { min: 30, max: 45 },
  orderingEnabled: true,
  acceptingOrders: true,
  manualOverride: null,
  businessHours: DEFAULT_HOURS,
  deliveryAreas: [
    {
      name: "Mira Road",
      pincodes: ["401107", "401104", "401105", "401106"],
      deliveryFee: 20,
      minimumOrder: 149,
      enabled: true,
    },
  ],
  whatsappNumber: "918652188366",
  contactNumber: "918652188366",
  instagramUrl: "https://www.instagram.com/biryanibybrothers/",
  announcement: "",
};

async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(DEFAULT_SETTINGS);
  }
  return settings;
}

function parseTimeToMinutes(hhmm) {
  const [h, m] = String(hhmm).split(":").map(Number);
  return h * 60 + m;
}

function getIndiaDayAndMinutes(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const day = String(parts.weekday).toUpperCase();
  const hour = Number(parts.hour === "24" ? 0 : parts.hour);
  const minute = Number(parts.minute);
  return { day, minutes: hour * 60 + minute };
}

function getOrderingStatus(settings) {
  if (!settings.orderingEnabled) {
    return { canOrder: false, status: "CLOSED", message: "Online ordering is currently closed." };
  }
  if (settings.manualOverride === "PAUSED" || !settings.acceptingOrders) {
    return { canOrder: false, status: "ORDERS_PAUSED", message: "Orders are temporarily paused." };
  }
  if (settings.manualOverride === "FORCE_CLOSED") {
    return { canOrder: false, status: "CLOSED", message: "We are currently closed." };
  }
  if (settings.manualOverride === "FORCE_OPEN") {
    return { canOrder: true, status: "OPEN", message: "We are open for orders." };
  }

  const { day, minutes } = getIndiaDayAndMinutes();
  const today = (settings.businessHours || []).find((h) => h.day === day);
  if (!today || !today.enabled) {
    return { canOrder: false, status: "CLOSED", message: "We are closed today." };
  }

  const open = parseTimeToMinutes(today.open);
  const close = parseTimeToMinutes(today.close);
  const inHours = close > open
    ? minutes >= open && minutes < close
    : minutes >= open || minutes < close;

  if (!inHours) {
    return { canOrder: false, status: "CLOSED", message: "Outside business hours." };
  }

  return { canOrder: true, status: "OPEN", message: "We are open for orders." };
}

function toPublicSettings(settings) {
  const ordering = getOrderingStatus(settings);
  return {
    businessName: settings.businessName,
    tagline: settings.tagline,
    minimumOrder: settings.minimumOrder,
    deliveryFee: settings.deliveryFee,
    freeDeliveryAbove: settings.freeDeliveryAbove,
    estimatedDeliveryTime: settings.estimatedDeliveryTime,
    orderingEnabled: settings.orderingEnabled,
    acceptingOrders: settings.acceptingOrders,
    businessHours: settings.businessHours,
    deliveryAreas: settings.deliveryAreas,
    whatsappNumber: settings.whatsappNumber,
    contactNumber: settings.contactNumber,
    instagramUrl: settings.instagramUrl,
    announcement: settings.announcement,
    orderingStatus: ordering.status,
    canOrder: ordering.canOrder,
    orderingMessage: ordering.message,
  };
}

module.exports = {
  getSettings,
  getOrderingStatus,
  toPublicSettings,
  DEFAULT_SETTINGS,
};
