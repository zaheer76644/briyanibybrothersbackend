const Category = require("../models/Category");
const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const listCategories = asyncHandler(async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
  return ok(res, { categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const slug = req.body.slug ? slugify(req.body.slug) : slugify(req.body.name);
  const category = await Category.create({ ...req.body, slug });
  return ok(res, { category }, "Category created.", 201);
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError("Category not found.", 404);
  Object.assign(category, req.body);
  if (req.body.name && !req.body.slug) category.slug = slugify(req.body.name);
  if (req.body.slug) category.slug = slugify(req.body.slug);
  await category.save();
  return ok(res, { category }, "Category updated.");
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found.", 404);
  return ok(res, {}, "Category deleted.");
});

const setCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new AppError("Category not found.", 404);
  category.isActive = Boolean(req.body.isActive);
  await category.save();
  return ok(res, { category }, "Category status updated.");
});

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  setCategoryStatus,
};
