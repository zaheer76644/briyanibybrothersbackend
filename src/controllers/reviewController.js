const Review = require("../models/Review");
const Order = require("../models/Order");
const { asyncHandler } = require("../utils/asyncHandler");
const { ok } = require("../utils/apiResponse");
const { AppError } = require("../utils/AppError");

const listPublicReviews = asyncHandler(async (req, res) => {
  const filter = { isApproved: true };
  if (req.query.product) filter.product = req.query.product;
  const reviews = await Review.find(filter).sort({ createdAt: -1 }).limit(50);
  return ok(res, { reviews });
});

const createReview = asyncHandler(async (req, res) => {
  const { orderId, productId, rating, comment } = req.body;
  const order = await Order.findOne({ orderId, customer: req.user._id });
  if (!order) throw new AppError("Order not found.", 404);
  if (order.orderStatus !== "DELIVERED") {
    throw new AppError("You can only review delivered orders.", 400);
  }

  const line = order.items.find((i) => i.product.toString() === String(productId));
  if (!line) throw new AppError("Product was not part of this order.", 400);

  const existing = await Review.findOne({
    customer: req.user._id,
    order: order._id,
    product: productId,
  });
  if (existing) throw new AppError("You already reviewed this item for this order.", 409);

  const review = await Review.create({
    customer: req.user._id,
    order: order._id,
    product: productId,
    customerName: req.user.name,
    rating: Number(rating),
    comment: comment || "",
    isApproved: false,
  });

  return ok(res, { review }, "Review submitted for approval.", 201);
});

const adminListReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.approved === "true") filter.isApproved = true;
  if (req.query.approved === "false") filter.isApproved = false;
  const reviews = await Review.find(filter).sort({ createdAt: -1 }).populate("product", "name");
  return ok(res, { reviews });
});

const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw new AppError("Review not found.", 404);
  review.isApproved = true;
  await review.save();
  return ok(res, { review }, "Review approved.");
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw new AppError("Review not found.", 404);
  return ok(res, {}, "Review deleted.");
});

module.exports = {
  listPublicReviews,
  createReview,
  adminListReviews,
  approveReview,
  deleteReview,
};
