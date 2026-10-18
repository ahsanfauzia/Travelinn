const express = require("express");

const {
  getHostDashboard,
} = require("../controllers/hostController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("host", "admin"),
  getHostDashboard
);

module.exports = router;