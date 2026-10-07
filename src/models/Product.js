const mongoose = require("mongoose");

const addOnSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    diet: { type: String, enum: ["veg", "non-veg", "egg", "any"], default: "any" },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: 0 },
    image: { type: String, default: "" },
    images: [{ type: String }],
    foodType: { type: String, enum: ["veg", "non-veg", "egg"], required: true },
    spiceLevel: { type: String, enum: ["mild", "medium", "spicy"], default: "medium" },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    preparationTime: { type: Number, default: 35 },
    addOns: [addOnSchema],
    tags: [{ type: String }],
    badge: { type: String, default: "" },
    allowAddOns: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    trackStock: { type: Boolean, default: false },
    dailyStock: { type: Number, default: 0 },
    soldQuantity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isAvailable: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ foodType: 1 });
productSchema.index({ name: "text", description: "text" });

productSchema.virtual("availableStock").get(function availableStock() {
  if (!this.trackStock) return null;
  return Math.max(0, this.dailyStock - this.soldQuantity);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
