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

// CORS configuration to allow requests from anywhere
const corsOptions = {
  origin: "*", // Allow all origins
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

app.get("/api/pingi", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is active",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
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
