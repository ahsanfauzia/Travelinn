const Property = require("../models/Property");
const Wishlist = require("../models/Wishlist");

const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      host: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create property. Check the listing details and try again.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const getProperties = async (req, res) => {
  try {
    const {
      location,
      propertyType,
      minPrice,
      maxPrice,
      guests,
    } = req.query;

    const filter = {
      isAvailable: true,
    };

    if (location) {
      filter["location.city"] = {
        $regex: location,
        $options: "i",
      };
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (guests) {
      filter.guests = {
        $gte: Number(guests),
      };
    }

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    const properties = await Property.find(filter)
      .populate("host", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate("host", "name email avatar");

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this property",
      });
    }

    // Only allow editable listing fields. Never allow the client to reassign ownership.
    const editableFields = [
      "title", "description", "propertyType", "price", "images",
      "location", "guests", "bedrooms", "beds", "bathrooms",
      "amenities", "isAvailable",
    ];
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        property[field] = req.body[field];
      }
    }

    const updatedProperty = await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update property. Check the listing details and try again.",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (property.host.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this property",
      });
    }

    await property.deleteOne();
    await Wishlist.deleteMany({ property: property._id });

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete property",
      error: error.message,
    });
  }
};

module.exports = {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
};