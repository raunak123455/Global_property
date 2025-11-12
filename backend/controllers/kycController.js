const User = require("../models/User");

// Submit KYC for verification
const submitKyc = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      dateOfBirth,
      address,
      city,
      state,
      zipCode,
      idNumber,
      phoneNumber,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !dateOfBirth || !address || !idNumber) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Update user with KYC submission timestamp
    const user = await User.findByIdAndUpdate(
      userId,
      {
        kycSubmittedAt: new Date(),
        phone: phoneNumber || user.phone,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, you would:
    // 1. Store the KYC documents (images) in cloud storage
    // 2. Save KYC data to a separate KYC collection
    // 3. Queue for admin review
    // 4. Send notification to admin for review

    res.json({
      message:
        "KYC submitted successfully. Your documents will be reviewed shortly.",
      kycSubmittedAt: user.kycSubmittedAt,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    res.status(500).json({ message: "Server error during KYC submission" });
  }
};

// Admin: Approve KYC
const approveKyc = async (req, res) => {
  try {
    const { userId } = req.params;

    // In a real application, you would check if the requesting user is an admin
    // For now, we'll skip this check

    const user = await User.findByIdAndUpdate(
      userId,
      {
        kycVerified: true,
        kycVerifiedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, send notification to user about KYC approval

    res.json({
      message: "KYC approved successfully",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        kycVerified: user.kycVerified,
        kycVerifiedAt: user.kycVerifiedAt,
      },
    });
  } catch (error) {
    console.error("KYC approval error:", error);
    res.status(500).json({ message: "Server error during KYC approval" });
  }
};

// Admin: Reject KYC
const rejectKyc = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        kycVerified: false,
        kycSubmittedAt: null,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // In a real application, send notification to user about KYC rejection with reason

    res.json({
      message: "KYC rejected",
      reason: reason || "Please resubmit with correct documents",
    });
  } catch (error) {
    console.error("KYC rejection error:", error);
    res.status(500).json({ message: "Server error during KYC rejection" });
  }
};

// Get KYC status
const getKycStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      "kycVerified kycSubmittedAt kycVerifiedAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      kycVerified: user.kycVerified,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
      status: user.kycVerified
        ? "verified"
        : user.kycSubmittedAt
        ? "pending"
        : "not_submitted",
    });
  } catch (error) {
    console.error("Get KYC status error:", error);
    res.status(500).json({ message: "Server error getting KYC status" });
  }
};

module.exports = {
  submitKyc,
  approveKyc,
  rejectKyc,
  getKycStatus,
};
