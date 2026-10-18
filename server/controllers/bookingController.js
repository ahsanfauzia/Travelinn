const Booking = require("../models/Booking");
const Property = require("../models/Property");

const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  const difference = end - start;

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
};

const createBooking = async (req, res) => {
  try {
    const {
      propertyId,
      checkIn,
      checkOut,
      guests,
    } = req.body;

    if (!propertyId || !checkIn || !checkOut || !guests) {
      return res.status(400).json({
        success: false,
        message:
          "Property, check-in, check-out and guests are required",
      });
    }

    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking dates",
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: "Check-out must be after check-in",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) {
      return res.status(400).json({
        success: false,
        message: "Check-in date cannot be in the past",
      });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (!property.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Property is currently unavailable",
      });
    }

    if (!Number.isInteger(Number(guests)) || Number(guests) < 1) {
      return res.status(400).json({ success: false, message: "Guests must be a positive whole number" });
    }

    if (Number(guests) > property.guests) {
      return res.status(400).json({
        success: false,
        message: `This property allows maximum ${property.guests} guests`,
      });
    }

    const conflictingBooking = await Booking.findOne({
      property: propertyId,
      status: "confirmed",

      checkIn: {
        $lt: endDate,
      },

      checkOut: {
        $gt: startDate,
      },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message:
          "Property is already booked for the selected dates",
      });
    }

    const nights = calculateNights(
      startDate,
      endDate
    );

    const pricePerNight = property.price;

    const serviceFee = Math.round(
      pricePerNight * nights * 0.1
    );

    const totalPrice =
      pricePerNight * nights + serviceFee;

    const booking = await Booking.create({
      property: propertyId,
      user: req.user.id,
      checkIn: startDate,
      checkOut: endDate,
      guests: Number(guests),
      nights,
      pricePerNight,
      serviceFee,
      totalPrice,
    });

    const populatedBooking =
      await Booking.findById(booking._id)
        .populate("property")
        .populate("user", "name email");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: process.env.NODE_ENV === "production" ? undefined : error.message,
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
    })
      .populate("property")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("property")
      .populate("user", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
      error: error.message,
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(
      req.params.id
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};