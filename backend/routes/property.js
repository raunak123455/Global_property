const express = require("express");
const router = express.Router();
const {
  createProperty,
  getSellerProperties,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  getProperty,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// Property routes
router.post("/", createProperty);
router.get("/", getSellerProperties);
router.get("/stats", getPropertyStats);
router.get("/:id", getProperty);
router.put("/:id", updateProperty);
router.delete("/:id", deleteProperty);

module.exports = router;
