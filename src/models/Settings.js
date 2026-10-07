const mongoose = require("mongoose");

const deliveryAreaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pincodes: [{ type: String }],
    deliveryFee: { type: Number, default: 20 },
    minimumOrder: { type: Number, default: 149 },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const businessHourSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      required: true,
    },
    enabled: { type: Boolean, default: true },
    open: { type: String, default: "12:00" },
    close: { type: String, default: "23:00" },
  },
  { _id: false }
);

const settingsSchema = new mongoose.Schema(
  {
    businessName: { type: String, default: "Biryani By Brothers" },
    tagline: { type: String, default: "From Our Handi to Your Heart." },
    minimumOrder: { type: Number, default: 149 },
    deliveryFee: { type: Number, default: 20 },
    freeDeliveryAbove: { type: Number, default: 299 },
    estimatedDeliveryTime: {
      min: { type: Number, default: 30 },
      max: { type: Number, default: 45 },
    },
    orderingEnabled: { type: Boolean, default: true },
    acceptingOrders: { type: Boolean, default: true },
    // FORCE_OPEN | FORCE_CLOSED | PAUSED | null
    manualOverride: { type: String, default: null },
    businessHours: [businessHourSchema],
    deliveryAreas: [deliveryAreaSchema],
    whatsappNumber: { type: String, default: "918652188366" },
    contactNumber: { type: String, default: "918652188366" },
    instagramUrl: { type: String, default: "https://www.instagram.com/biryanibybrothers/" },
    announcement: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
