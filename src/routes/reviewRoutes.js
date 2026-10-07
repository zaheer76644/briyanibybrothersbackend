const express = require("express");
const { listPublicReviews, createReview } = require("../controllers/reviewController");
const { protectCustomer } = require("../middleware/customerAuthMiddleware");
const { reviewLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.get("/", listPublicReviews);
router.post("/", protectCustomer, reviewLimiter, createReview);

module.exports = router;
