const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  submitKyc,
  approveKyc,
  rejectKyc,
  getKycStatus,
} = require("../controllers/kycController");

// User routes (protected)
router.post("/submit", protect, submitKyc);
router.get("/status", protect, getKycStatus);

// Admin routes (protected - in production, add admin middleware)
router.put("/approve/:userId", protect, approveKyc);
router.put("/reject/:userId", protect, rejectKyc);

module.exports = router;
