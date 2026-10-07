const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, enum: ["HOME", "WORK", "OTHER"], default: "HOME" },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    flatHouse: { type: String, required: true, trim: true },
    buildingSociety: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
    pincode: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: null },
    mobile: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    isMobileVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    lastLoginAt: Date,
  },
  { timestamps: true }
);

customerSchema.index(
  { email: 1 },
  { unique: true, sparse: true, partialFilterExpression: { email: { $type: "string" } } }
);
customerSchema.index({ createdAt: -1 });

customerSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

customerSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

customerSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id,
    name: this.name,
    email: this.email || "",
    mobile: this.mobile,
    isActive: this.isActive,
    addresses: this.addresses,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("Customer", customerSchema);
