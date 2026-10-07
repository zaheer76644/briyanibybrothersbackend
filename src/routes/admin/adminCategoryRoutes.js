const express = require("express");
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
} = require("../../controllers/categoryController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", (req, res, next) => {
  req.query.all = "true";
  return listCategories(req, res, next);
});
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.patch("/:id/status", setCategoryStatus);

module.exports = router;
