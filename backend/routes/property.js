const express = require("express");
const router = express.Router();
const {
  createProperty,
  getSellerProperties,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  getProperty,
  getAllProperties,
  addInquiry,
  getPropertyInquiries,
  submitLegalDocuments,
  getLegalDocuments,
  updateNotaryStatus,
  getPropertiesWithLegalDocuments,
} = require("../controllers/propertyController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected
router.use(protect);

// Seller property routes
router.post("/", createProperty); // Create new property
router.get("/my-properties", getSellerProperties); // Get seller's properties
router.get("/stats", getPropertyStats); // Get property statistics
router.get("/inquiries", getPropertyInquiries); // Get all inquiries for seller's properties

// Public property routes (buyers)
router.get("/all", getAllProperties); // Get all active properties with filters

// Legal documents routes (must be before /:id routes)
router.get("/legal-documents/submitted", getPropertiesWithLegalDocuments); // Get all properties with submitted legal documents (notaries/admins)
router.post("/:id/legal-documents", submitLegalDocuments); // Submit legal documents for a property (sellers/agents)
router.get("/:id/legal-documents", getLegalDocuments); // Get legal documents for a property (sellers/agents/notaries)
router.put("/:id/legal-documents/notary-status", updateNotaryStatus); // Update notary status (notaries/admins)

// Property inquiry routes
router.post("/:id/inquiries", addInquiry); // Add inquiry to a property

// Single property routes
router.get("/:id", getProperty); // Get single property
router.put("/:id", updateProperty); // Update property
router.delete("/:id", deleteProperty); // Delete property

module.exports = router;
