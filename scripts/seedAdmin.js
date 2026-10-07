const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const { connectDB } = require("../src/config/db");
const { env } = require("../src/config/env");
const Admin = require("../src/models/Admin");

async function seedAdmin() {
  await connectDB();

  const email = (env.adminEmail || "").toLowerCase().trim();
  const password = env.adminPassword;
  const name = env.adminName || "Brothers Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
  }

  let admin = await Admin.findOne({ email });
  if (admin) {
    admin.name = name;
    admin.password = password;
    admin.role = "superadmin";
    admin.isActive = true;
    await admin.save();
    console.log(`Updated admin: ${email}`);
  } else {
    admin = await Admin.create({
      name,
      email,
      password,
      role: "superadmin",
    });
    console.log(`Created admin: ${email}`);
  }

  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
