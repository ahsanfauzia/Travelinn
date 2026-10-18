const Review = require("../models/Review");
const Property = require("../models/Property");

const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      property: req.params.propertyId,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const propertyId = req.params.propertyId;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Rating and comment are required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existingReview = await Review.findOne({
      property: propertyId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this property",
      });
    }

    const review = await Review.create({
      property: propertyId,
      user: req.user.id,
      rating: Number(rating),
      comment,
    });

    const reviews = await Review.find({
      property: propertyId,
    });

    const totalRating = reviews.reduce(
      (sum, item) => sum + item.rating,
      0
    );

    property.rating = Number(
      (totalRating / reviews.length).toFixed(1)
    );

    property.reviewsCount = reviews.length;

    await property.save();

    const populatedReview =
      await Review.findById(review._id).populate(
        "user",
        "name avatar"
      );

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this review",
      });
    }

    const propertyId = review.property;

    await review.deleteOne();

    const reviews = await Review.find({
      property: propertyId,
    });

    const property = await Property.findById(propertyId);

    if (property) {
      property.reviewsCount = reviews.length;

      property.rating =
        reviews.length > 0
          ? Number(
              (
                reviews.reduce(
                  (sum, item) => sum + item.rating,
                  0
                ) / reviews.length
              ).toFixed(1)
            )
          : 0;

      await property.save();
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  getPropertyReviews,
  createReview,
  deleteReview,
};