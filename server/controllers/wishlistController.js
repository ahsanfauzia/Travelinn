const Wishlist = require("../models/Wishlist");
const Property = require("../models/Property");

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user.id,
    })
      .populate("property")
      .sort({ createdAt: -1 });

    // Remove stale wishlist rows when their property no longer exists.
    const validWishlist = wishlist.filter((item) => item.property);
    const staleIds = wishlist
      .filter((item) => !item.property)
      .map((item) => item._id);

    if (staleIds.length) {
      await Wishlist.deleteMany({ _id: { $in: staleIds } });
    }

    res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const existing = await Wishlist.findOne({
      user: req.user.id,
      property: propertyId,
    });

    if (existing) {
      const populatedExisting = await Wishlist.findById(existing._id).populate("property");
      return res.status(200).json({
        success: true,
        message: "Property is already in your wishlist",
        wishlist: populatedExisting,
      });
    }

    const wishlistItem = await Wishlist.create({
      user: req.user.id,
      property: propertyId,
    });

    const populatedItem =
      await Wishlist.findById(
        wishlistItem._id
      ).populate("property");

    res.status(201).json({
      success: true,
      message: "Property added to wishlist",
      wishlist: populatedItem,
    });
  } catch (error) {
    // A unique index protects against two fast clicks creating duplicate rows.
    if (error.code === 11000) {
      const existing = await Wishlist.findOne({ user: req.user.id, property: req.body.propertyId }).populate("property");
      return res.status(200).json({
        success: true,
        message: "Property is already in your wishlist",
        wishlist: existing,
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add property to wishlist",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlistItem =
      await Wishlist.findOneAndDelete({
        user: req.user.id,
        property: propertyId,
      });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Property not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Property removed from wishlist",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove property",
      error: error.message,
    });
  }
};

const checkWishlist = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const wishlistItem =
      await Wishlist.findOne({
        user: req.user.id,
        property: propertyId,
      });

    res.status(200).json({
      success: true,
      isWishlisted: !!wishlistItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
};