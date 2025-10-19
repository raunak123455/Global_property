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
    } = req.body;

    const sellerId = req.user.userId;

    const property = await Property.create({
      title,
      description,
      price,
      location,
      images,
      bedrooms,
      bathrooms,
      area,
      propertyType,
      features: features || [],
      yearBuilt,
      sellerId,
    });

    res.status(201).json(property);
  } catch (error) {
    console.error("Create property error:", error);
    res.status(500).json({ message: "Server error creating property" });
  }
};

// Get seller's properties
const getSellerProperties = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const properties = await Property.find({ sellerId }).sort({
      createdAt: -1,
    });
    res.json(properties);
  } catch (error) {
    console.error("Get seller properties error:", error);
    res.status(500).json({ message: "Server error fetching properties" });
  }
};

// Update property
const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId;

    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const updatedProperty = await Property.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ message: "Server error updating property" });
  }
};

// Delete property
const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId;

    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await Property.findByIdAndDelete(id);
    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ message: "Server error deleting property" });
  }
};

// Get property statistics
const getPropertyStats = async (req, res) => {
  try {
    const sellerId = req.user.userId;

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

    res.json({
      totalProperties,
      activeProperties,
      soldProperties,
      pendingProperties,
      totalValue,
    });
  } catch (error) {
    console.error("Get property stats error:", error);
    res.status(500).json({ message: "Server error fetching statistics" });
  }
};

// Get single property
const getProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.userId;

    const property = await Property.findOne({ _id: id, sellerId });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.json(property);
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ message: "Server error fetching property" });
  }
};

module.exports = {
  createProperty,
  getSellerProperties,
  updateProperty,
  deleteProperty,
  getPropertyStats,
  getProperty,
};
