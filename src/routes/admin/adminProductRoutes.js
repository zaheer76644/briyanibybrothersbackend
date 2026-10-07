const express = require("express");
const {
  adminListProducts,
  adminGetProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  setAvailability,
  setDailyStock,
} = require("../../controllers/productController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");
const { validate } = require("../../middleware/validateMiddleware");
const { productRules, productIdParam } = require("../../validators/productValidator");

const router = express.Router();

router.use(protectAdmin);
router.get("/", adminListProducts);
router.post("/", productRules, validate, createProduct);
router.get("/:id", productIdParam, validate, adminGetProduct);
router.put("/:id", productIdParam, validate, updateProduct);
router.delete("/:id", productIdParam, validate, deleteProduct);
router.patch("/:id/availability", productIdParam, validate, setAvailability);
router.patch("/:id/stock", productIdParam, validate, setDailyStock);

module.exports = router;
