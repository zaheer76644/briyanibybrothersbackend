const express = require("express");
const {
  adminListReviews,
  approveReview,
  deleteReview,
} = require("../../controllers/reviewController");
const { protectAdmin } = require("../../middleware/adminAuthMiddleware");

const router = express.Router();

router.use(protectAdmin);
router.get("/", adminListReviews);
router.patch("/:id/approve", approveReview);
router.delete("/:id", deleteReview);

module.exports = router;
