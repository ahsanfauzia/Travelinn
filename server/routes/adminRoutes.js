const express = require("express");

const {
  getAdminDashboard,
  getAllUsers,
  getAllProperties,
  getAllBookings,
  deleteUser,
  deleteProperty,
  updateBookingStatus,
} = require("../controllers/adminController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(
  protect,
  allowRoles("admin")
);

router.get(
  "/dashboard",
  getAdminDashboard
);

router.get(
  "/users",
  getAllUsers
);

router.get(
  "/properties",
  getAllProperties
);

router.get(
  "/bookings",
  getAllBookings
);

router.delete(
  "/users/:id",
  deleteUser
);

router.delete(
  "/properties/:id",
  deleteProperty
);

router.put(
  "/bookings/:id/status",
  updateBookingStatus
);

module.exports = router;