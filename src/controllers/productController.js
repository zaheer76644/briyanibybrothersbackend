const Product = require("../models/Product");
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

function enrichProduct(doc) {
  const obj = doc.toObject({ virtuals: true });
  if (obj.trackStock) {
    obj.availableStock = Math.max(0, obj.dailyStock - obj.soldQuantity);
    obj.isSoldOut = !obj.isAvailable || obj.availableStock <= 0;
  } else {
    obj.availableStock = null;
    obj.isSoldOut = !obj.isAvailable;
  }
  return obj;
}

const listProducts = asyncHandler(async (req, res) => {
  const {
    category,
    foodType,
    featured,
    available,
    search,
    sort = "sortOrder",
    page = 1,
    limit = 50,
  } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (foodType) filter.foodType = foodType;
  if (featured === "true") filter.isFeatured = true;
  if (available === "true") filter.isAvailable = true;
  if (search) filter.$text = { $search: search };

  const sortMap = {
    sortOrder: { sortOrder: 1, name: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    name: { name: 1 },
  };

  const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
  const [rows, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortMap[sort] || sortMap.sortOrder)
      .skip(skip)
      .limit(Math.min(100, Number(limit))),
    Product.countDocuments(filter),
  ]);

  return ok(res, {
    products: rows.map(enrichProduct),
    total,
    page: Number(page),
    limit: Number(limit),
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate("category", "name slug");
  if (!product) throw new AppError("Product not found.", 404);
  return ok(res, { product: enrichProduct(product) });
});

const adminListProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().populate("category", "name slug").sort({ sortOrder: 1, name: 1 });
  return ok(res, { products: products.map(enrichProduct) });
});

const adminGetProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) throw new AppError("Product not found.", 404);
  return ok(res, { product: enrichProduct(product) });
});

const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.slug = data.slug ? slugify(data.slug) : slugify(data.name);
  const product = await Product.create(data);
  return ok(res, { product: enrichProduct(product) }, "Product created.", 201);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found.", 404);
  Object.assign(product, req.body);
  if (req.body.name && !req.body.slug) product.slug = slugify(req.body.name);
  if (req.body.slug) product.slug = slugify(req.body.slug);
  await product.save();
  return ok(res, { product: enrichProduct(product) }, "Product updated.");
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found.", 404);
  return ok(res, {}, "Product deleted.");
});

const setAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found.", 404);
  product.isAvailable = Boolean(req.body.isAvailable);
  await product.save();
  return ok(res, { product: enrichProduct(product) }, product.isAvailable ? "Marked available." : "Marked sold out.");
});

const setDailyStock = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found.", 404);
  product.trackStock = true;
  product.dailyStock = Number(req.body.dailyStock) || 0;
  if (req.body.resetSold) product.soldQuantity = 0;
  await product.save();
  return ok(res, { product: enrichProduct(product) }, "Stock updated.");
});

module.exports = {
  listProducts,
  getProductBySlug,
  adminListProducts,
  adminGetProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  setAvailability,
  setDailyStock,
};
