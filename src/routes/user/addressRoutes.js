const express = require("express");
const {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../../controllers/addressController");
const { protectCustomer } = require("../../middleware/customerAuthMiddleware");
const { validate } = require("../../middleware/validateMiddleware");
const { addressRules, addressIdParam } = require("../../validators/addressValidator");

const router = express.Router();

router.use(protectCustomer);

router.get("/", listAddresses);
router.post("/", addressRules, validate, createAddress);
router.put("/:id", addressIdParam, addressRules, validate, updateAddress);
router.delete("/:id", addressIdParam, validate, deleteAddress);
router.patch("/:id/default", addressIdParam, validate, setDefaultAddress);

module.exports = router;
