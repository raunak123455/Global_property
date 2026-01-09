const Property = require("../models/Property");
const User = require("../models/User");

// Create a new property
const createProperty = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      location,
      images,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      features,
      yearBuilt,
      status,
      isTokenized,
      totalTokens,
    } = req.body;

    const sellerId = req.user._id;

    // Validate seller role
    if (req.user.role !== "seller" && req.user.role !== "agent") {
      return res.status(403).json({
        message: "Only sellers and agents can create properties",
      });
    }

    // Validate tokenization data
    if (isTokenized && (!totalTokens || totalTokens < 1)) {
      return res.status(400).json({
        message: "If property is tokenized, totalTokens must be provided and greater than 0",
      });
    }

    const property = await Property.create({
      title,
      description,
      price,
      location,
      images:
        images && images.length > 0
          ? images
          : ["https://via.placeholder.com/400x300"],
      bedrooms,
      bathrooms,
      area,
      propertyType,
      features: features || [],
      yearBuilt,
      status: status || "active",
      sellerId,
      isTokenized: isTokenized || false,
      totalTokens: isTokenized ? totalTokens : null,
      tokensSold: 0,
    });

    // Populate seller information
    await property.populate("sellerId", "firstName lastName email phone");

    res.status(201).json({
      message: "Property created successfully",
      property,
    });
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({
      message: "Server error creating property",
      error: error.message,
    });
  }
};

// Get seller's properties
const getSellerProperties = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { status, sortBy = "createdAt", order = "desc" } = req.query;

    // Build query
    const query = { sellerId };
    if (status) {
      query.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    const properties = await Property.find(query)
      .sort(sort)
      .populate("sellerId", "firstName lastName email phone");

    res.json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("Get seller properties error:", error);
    res.status(500).json({
      message: "Server error fetching properties",
      error: error.message,
    });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("sellerId", "firstName lastName email phone");

    res.json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({
      message: "Server error updating property",
      error: error.message,
    });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user._id;

    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    await Property.findByIdAndDelete(id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({
      message: "Server error deleting property",
      error: error.message,
    });
  }
};

// Get property statistics
const getPropertyStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const totalProperties = await Property.countDocuments({ sellerId });
    const activeProperties = await Property.countDocuments({
      sellerId,
      status: "active",
    });
    const soldProperties = await Property.countDocuments({
      sellerId,
      status: "sold",
    });
    const pendingProperties = await Property.countDocuments({
      sellerId,
      status: "pending",
    });

    // Calculate total value of active properties
    const activePropertiesData = await Property.find({
      sellerId,
      status: "active",
    });
    const totalValue = activePropertiesData.reduce(
      (sum, property) => sum + property.price,
      0
    );

    // Get total views
    const allProperties = await Property.find({ sellerId });
    const totalViews = allProperties.reduce(
      (sum, property) => sum + (property.views || 0),
      0
    );

    // Get total inquiries
    const totalInquiries = allProperties.reduce(
      (sum, property) => sum + (property.inquiries?.length || 0),
      0
    );

    res.json({
      totalProperties,
      activeProperties,
      soldProperties,
      pendingProperties,
      totalValue,
      totalViews,
      totalInquiries,
    });
  } catch (error) {
    console.error("Get property stats error:", error);
    res.status(500).json({
      message: "Server error fetching statistics",
      error: error.message,
    });
  }
};

// Get single property
const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query based on user role
    let query = { _id: id };

    // Sellers and agents can only view their own properties
    // Buyers and other roles can view any active property
    if (userRole === "seller" || userRole === "agent") {
      query.sellerId = userId;
    } else {
      // For buyers and other roles, only show active properties
      query.status = "active";
    }

    const property = await Property.findOne(query).populate(
      "sellerId",
      "firstName lastName email phone"
    );

    if (!property) {
      return res
        .status(404)
        .json({ message: "Property not found or unauthorized" });
    }

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({
      message: "Server error fetching property",
      error: error.message,
    });
  }
};

// Get all properties (for buyers/public)
const getAllProperties = async (req, res) => {
  try {
    const {
      city,
      state,
      propertyType,
      minPrice,
      maxPrice,
      minBedrooms,
      maxBedrooms,
      minArea,
      maxArea,
      sortBy = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { status: "active" };

    if (city) query["location.city"] = new RegExp(city, "i");
    if (state) query["location.state"] = new RegExp(state, "i");
    if (propertyType) query.propertyType = propertyType;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (minBedrooms || maxBedrooms) {
      query.bedrooms = {};
      if (minBedrooms) query.bedrooms.$gte = Number(minBedrooms);
      if (maxBedrooms) query.bedrooms.$lte = Number(maxBedrooms);
    }
    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    // Build sort
    const sort = {};
    sort[sortBy] = order === "desc" ? -1 : 1;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const properties = await Property.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip)
      .populate("sellerId", "firstName lastName email phone");

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error("Get all properties error:", error);
    res.status(500).json({
      message: "Server error fetching properties",
      error: error.message,
    });
  }
};

// Add inquiry to property
const addInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, contactInfo } = req.body;
    const userId = req.user._id;

    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    property.inquiries.push({
      userId,
      message,
      contactInfo,
    });

    await property.save();

    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry: property.inquiries[property.inquiries.length - 1],
    });
  } catch (error) {
    console.error("Add inquiry error:", error);
    res.status(500).json({
      message: "Server error submitting inquiry",
      error: error.message,
    });
  }
};

// Get property inquiries (for sellers)
const getPropertyInquiries = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const properties = await Property.find({ sellerId })
      .populate("inquiries.userId", "firstName lastName email phone")
      .select("title inquiries");

    // Flatten inquiries with property info
    const allInquiries = [];
    properties.forEach((property) => {
      property.inquiries.forEach((inquiry) => {
        allInquiries.push({
          propertyId: property._id,
          propertyTitle: property.title,
          ...inquiry.toObject(),
        });
      });
    });

    // Sort by most recent
    allInquiries.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      count: allInquiries.length,
      inquiries: allInquiries,
    });
  } catch (error) {
    console.error("Get inquiries error:", error);
    res.status(500).json({
      message: "Server error fetching inquiries",
      error: error.message,
    });
  }
};

// Submit legal documents for a property
const submitLegalDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const { documents } = req.body; // Array of { documentType: string, files: string[] }
    const sellerId = req.user._id;

    console.log("Submit legal documents request:", {
      propertyId: id,
      propertyIdType: typeof id,
      sellerId: sellerId.toString(),
      sellerIdType: typeof sellerId,
      userRole: req.user.role,
      documentsCount: documents?.length,
      documents: documents?.map((d) => ({
        type: d.documentType,
        filesCount: d.files?.length,
      })),
    });

    // Validate seller role
    if (req.user.role !== "seller" && req.user.role !== "agent") {
      return res.status(403).json({
        message: "Only sellers and agents can submit legal documents",
      });
    }

    // First, check if property exists
    let property;
    try {
      property = await Property.findById(id);
    } catch (error) {
      console.error("Error finding property by ID:", error);
      return res.status(400).json({
        message: "Invalid property ID format",
        error: error.message,
      });
    }

    if (!property) {
      console.error("Property not found:", id);
      return res.status(404).json({
        message: "Property not found",
      });
    }

    // Check if property belongs to the current seller
    if (property.sellerId.toString() !== sellerId.toString()) {
      console.error("Property ownership mismatch:", {
        propertySellerId: property.sellerId.toString(),
        currentUserId: sellerId.toString(),
      });
      return res.status(403).json({
        message: "You are not authorized to submit documents for this property",
      });
    }

    // Validate documents array
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      console.error("Invalid documents array:", documents);
      return res.status(400).json({
        message: "Please provide at least one document",
      });
    }

    // Validate each document has required fields
    for (const doc of documents) {
      if (!doc.documentType) {
        console.error("Document missing documentType:", doc);
        return res.status(400).json({
          message: "Each document must have a documentType",
        });
      }
      if (!doc.files || !Array.isArray(doc.files) || doc.files.length === 0) {
        console.error(`Document ${doc.documentType} missing files:`, doc);
        return res.status(400).json({
          message: `Document ${doc.documentType} must have at least one file`,
        });
      }
    }

    // Format documents array for database
    const formattedDocuments = documents.map((doc) => ({
      documentType: doc.documentType,
      files: doc.files, // Array of base64 strings or URLs
      uploadedAt: new Date(),
    }));

    console.log("Formatted documents:", {
      count: formattedDocuments.length,
      types: formattedDocuments.map((d) => d.documentType),
      totalFiles: formattedDocuments.reduce(
        (sum, d) => sum + d.files.length,
        0
      ),
    });

    // Update property with legal documents
    property.legalDocuments = {
      submitted: true,
      submittedAt: new Date(),
      documents: formattedDocuments,
      notaryStatus: "pending",
      verifiedAt: null,
      notes: null,
    };

    // Mark the legalDocuments field as modified to ensure Mongoose saves it
    property.markModified("legalDocuments");

    await property.save();

    console.log("Legal documents saved successfully:", {
      propertyId: property._id,
      documentsCount: property.legalDocuments.documents.length,
      submitted: property.legalDocuments.submitted,
    });

    res.status(200).json({
      message: "Legal documents submitted successfully",
      legalDocuments: property.legalDocuments,
    });
  } catch (error) {
    console.error("Submit legal documents error:", error);
    res.status(500).json({
      message: "Server error submitting legal documents",
      error: error.message,
    });
  }
};

// Get legal documents for a property
const getLegalDocuments = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find property
    const property = await Property.findById(id).populate(
      "sellerId",
      "firstName lastName email phone"
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check authorization: seller/agent can view their own, notary can view all
    if (userRole === "seller" || userRole === "agent") {
      if (property.sellerId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          message: "Unauthorized to view these documents",
        });
      }
    }

    // Notaries can view all properties' documents
    // Buyers/public cannot view legal documents

    if (!property.legalDocuments || !property.legalDocuments.submitted) {
      return res.json({
        submitted: false,
        message: "No legal documents submitted for this property",
      });
    }

    res.json({
      submitted: true,
      legalDocuments: property.legalDocuments,
    });
  } catch (error) {
    console.error("Get legal documents error:", error);
    res.status(500).json({
      message: "Server error fetching legal documents",
      error: error.message,
    });
  }
};

// Update notary status for legal documents (for notaries)
const updateNotaryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { notaryStatus, notes } = req.body;
    const userId = req.user._id;

    // Validate notary role
    if (req.user.role !== "notary" && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only notaries and admins can update document status",
      });
    }

    // Validate status
    const validStatuses = ["pending", "under-review", "verified", "rejected"];
    if (!notaryStatus || !validStatuses.includes(notaryStatus)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Find property
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    if (!property.legalDocuments || !property.legalDocuments.submitted) {
      return res.status(400).json({
        message: "No legal documents submitted for this property",
      });
    }

    // Update notary status
    property.legalDocuments.notaryStatus = notaryStatus;
    if (notes) {
      property.legalDocuments.notes = notes;
    }
    if (notaryStatus === "verified" || notaryStatus === "rejected") {
      property.legalDocuments.verifiedAt = new Date();
    }

    await property.save();

    res.json({
      message: "Notary status updated successfully",
      legalDocuments: property.legalDocuments,
    });
  } catch (error) {
    console.error("Update notary status error:", error);
    res.status(500).json({
      message: "Server error updating notary status",
      error: error.message,
    });
  }
};

// Get all properties with submitted legal documents (for notaries)
const getPropertiesWithLegalDocuments = async (req, res) => {
  try {
    const userRole = req.user.role;

    // Only notaries and admins can access this
    if (userRole !== "notary" && userRole !== "admin") {
      return res.status(403).json({
        message:
          "Only notaries and admins can view properties with legal documents",
      });
    }

    // Find all properties that have submitted legal documents
    const properties = await Property.find({
      "legalDocuments.submitted": true,
    })
      .populate("sellerId", "firstName lastName email phone")
      .sort({ "legalDocuments.submittedAt": -1 });

    // Format the response to include property and seller information
    const formattedProperties = properties.map((property) => ({
      propertyId: property._id,
      propertyTitle: property.title,
      propertyAddress: `${property.location.address}, ${property.location.city}, ${property.location.state} ${property.location.zipCode}`,
      propertyPrice: property.price,
      propertyType: property.propertyType,
      propertyImages: property.images || [],
      seller: property.sellerId
        ? {
            id: property.sellerId._id,
            name: `${property.sellerId.firstName} ${property.sellerId.lastName}`,
            email: property.sellerId.email,
            phone: property.sellerId.phone,
          }
        : null,
      legalDocuments: {
        submitted: property.legalDocuments.submitted,
        submittedAt: property.legalDocuments.submittedAt,
        notaryStatus: property.legalDocuments.notaryStatus || "pending",
        documents: property.legalDocuments.documents || [],
        notes: property.legalDocuments.notes,
        verifiedAt: property.legalDocuments.verifiedAt,
      },
      createdAt: property.createdAt,
    }));

    res.json({
      count: formattedProperties.length,
      properties: formattedProperties,
    });
  } catch (error) {
    console.error("Get properties with legal documents error:", error);
    res.status(500).json({
      message: "Server error fetching properties with legal documents",
      error: error.message,
    });
  }
};

module.exports = {
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
};
