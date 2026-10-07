const path = require("path");

// Prefer backend/.env, then repo-root .env
require("dotenv").config({ path: path.join(__dirname, "../../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

function required(name, fallback) {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/biryani_by_brothers"),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  jwtCustomerSecret: required("JWT_CUSTOMER_SECRET", "dev-customer-secret-change-me"),
  jwtAdminSecret: required("JWT_ADMIN_SECRET", "dev-admin-secret-change-me"),
  jwtCustomerExpires: process.env.JWT_CUSTOMER_EXPIRES_IN || "7d",
  jwtAdminExpires: process.env.JWT_ADMIN_EXPIRES_IN || "1d",
  adminName: process.env.ADMIN_NAME || "Brothers Admin",
  adminEmail: process.env.ADMIN_EMAIL || "admin@biryanibybrothers.com",
  adminPassword: process.env.ADMIN_PASSWORD || "ChangeMe123!",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
  isProd: (process.env.NODE_ENV || "development") === "production",
};

module.exports = { env };
