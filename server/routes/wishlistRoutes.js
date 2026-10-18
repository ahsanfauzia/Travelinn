const express = require("express");

const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
} = require("../controllers/wishlistController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/",
  protect,
  getWishlist
);

router.post(
  "/",
  protect,
  addToWishlist
);

router.get(
  "/check/:propertyId",
  protect,
  checkWishlist
);

router.delete(
  "/:propertyId",
  protect,
  removeFromWishlist
);

module.exports = router;