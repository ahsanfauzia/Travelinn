const express = require("express");

const {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
} = require("../controllers/propertyController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", getProperties);

router.get("/:id", getPropertyById);

router.post(
  "/",
  protect,
  allowRoles("host", "admin"),
  createProperty
);

router.put(
  "/:id",
  protect,
  allowRoles("host", "admin"),
  updateProperty
);

router.delete(
  "/:id",
  protect,
  allowRoles("host", "admin"),
  deleteProperty
);

module.exports = router;