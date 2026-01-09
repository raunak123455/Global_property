const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
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
      index: true,
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
        index: true,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
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
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "sold", "pending", "draft"],
      default: "active",
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      max: new Date().getFullYear() + 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    inquiries: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        contactInfo: {
          email: String,
          phone: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "responded", "closed"],
          default: "pending",
        },
      },
    ],
    legalDocuments: {
      submitted: {
        type: Boolean,
        default: false,
      },
      submittedAt: Date,
      documents: [
        {
          documentType: {
            type: String,
            required: true,
          },
          files: [String],
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      notaryStatus: {
        type: String,
        enum: ["pending", "under-review", "verified", "rejected"],
        default: "pending",
      },
      verifiedAt: Date,
      notes: String,
    },
    // Tokenization fields
    isTokenized: {
      type: Boolean,
      default: false,
    },
    totalTokens: {
      type: Number,
      min: 1,
      default: null,
    },
    tokensSold: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for getting property age
propertySchema.virtual("propertyAge").get(function () {
  if (this.yearBuilt) {
    return new Date().getFullYear() - this.yearBuilt;
  }
  return null;
});

// Virtual for getting price per square foot
propertySchema.virtual("pricePerSqFt").get(function () {
  if (this.area && this.area > 0) {
    return Math.round(this.price / this.area);
  }
  return null;
});

// Virtual for getting price per token (if tokenized)
propertySchema.virtual("tokenPrice").get(function () {
  if (this.isTokenized && this.totalTokens && this.totalTokens > 0) {
    return Math.round((this.price / this.totalTokens) * 100) / 100; // Round to 2 decimal places
  }
  return null;
});

// Index for efficient queries
propertySchema.index({ sellerId: 1, status: 1 });
propertySchema.index({ "location.city": 1, propertyType: 1 });
propertySchema.index({ price: 1, propertyType: 1 });

// Method to increment views
propertySchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Method to ensure legalDocuments is properly initialized
propertySchema.methods.ensureLegalDocuments = function () {
  if (!this.legalDocuments || typeof this.legalDocuments !== 'object') {
    this.legalDocuments = {
      submitted: false,
      submittedAt: null,
      documents: [],
      notaryStatus: "pending",
      verifiedAt: null,
      notes: null,
    };
  } else {
    // Ensure all fields exist even if partially initialized
    if (typeof this.legalDocuments.submitted !== 'boolean') {
      this.legalDocuments.submitted = false;
    }
    if (!Array.isArray(this.legalDocuments.documents)) {
      this.legalDocuments.documents = [];
    }
    if (!this.legalDocuments.notaryStatus) {
      this.legalDocuments.notaryStatus = "pending";
    }
    // submittedAt, verifiedAt, and notes can be null/undefined
  }
  return this;
};

// Pre-save hook to ensure legalDocuments is initialized
propertySchema.pre('save', function (next) {
  this.ensureLegalDocuments();
  next();
});

// Post-find hook to ensure legalDocuments is initialized when documents are retrieved
propertySchema.post(['find', 'findOne', 'findOneAndUpdate'], function (docs) {
  if (!docs) return;
  
  // Handle both single document and array of documents
  const documents = Array.isArray(docs) ? docs : [docs];
  
  documents.forEach(doc => {
    if (doc && doc.ensureLegalDocuments) {
      doc.ensureLegalDocuments();
    }
  });
});

module.exports = mongoose.model("Property", propertySchema);
