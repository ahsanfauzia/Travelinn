const express = require("express");

const {
  getPropertyReviews,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/property/:propertyId",
  getPropertyReviews
);

router.post(
  "/property/:propertyId",
  protect,
  createReview
);

router.delete(
  "/:id",
  protect,
  deleteReview
);

module.exports = router;