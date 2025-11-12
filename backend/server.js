const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/property");
const kycRoutes = require("./routes/kyc");

const app = express();

// Connect to database
connectDB();

// CORS configuration to allow requests from Expo Go
const corsOptions = {
  origin: [
    "http://localhost:8081", // Expo default port
    "http://192.168.1.6:8081", // Your specific Expo address
    "exp://192.168.1.6:8081", // Expo protocol
    "http://localhost:5000", // Backend itself for testing
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middleware
app.use(cors(corsOptions));
// Increase body size limit to handle large base64 image uploads (50MB)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/kyc", kycRoutes);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Real Estate Backend API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Accessible at: http://192.168.1.4:${PORT}`);
});
