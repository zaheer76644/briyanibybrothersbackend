const express = require("express");
const { getAdminSettings, updateSettings } = require("../../controllers/settingsController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", getAdminSettings);
router.put("/", updateSettings);

module.exports = router;
