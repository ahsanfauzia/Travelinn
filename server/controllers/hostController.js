const Property = require("../models/Property");
const Booking = require("../models/Booking");

const getHostDashboard = async (req, res) => {
  try {
    const properties = await Property.find({
      host: req.user.id,
    }).sort({ createdAt: -1 });

    const propertyIds = properties.map(
      (property) => property._id
    );

    const bookings = await Booking.find({
      property: { $in: propertyIds },
    })
      .populate("property", "title location")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const confirmedBookings = bookings.filter(
      (booking) => booking.status === "confirmed"
    );

    const totalRevenue = confirmedBookings.reduce(
      (sum, booking) => sum + booking.totalPrice,
      0
    );

    res.status(200).json({
      success: true,

      stats: {
        totalProperties: properties.length,
        totalBookings: bookings.length,
        confirmedBookings: confirmedBookings.length,
        totalRevenue,
      },

      properties,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch host dashboard",
      error: error.message,
    });
  }
};

module.exports = {
  getHostDashboard,
};