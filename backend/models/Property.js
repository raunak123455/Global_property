const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    location: {
      address: {
        type: String,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    bedrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    bathrooms: {
      type: Number,
      required: true,
      min: 0,
    },
    area: {
      type: Number,
      required: true,
      min: 0,
    },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "condo", "townhouse", "land", "commercial"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "pending", "draft"],
      default: "active",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    yearBuilt: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);
