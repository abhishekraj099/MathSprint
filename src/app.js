const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

// Load environment variables
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Fallback: Load JWT_SECRET directly from .env file if dotenv didn't work
if (!process.env.JWT_SECRET) {
  try {
    const envFile = fs.readFileSync(path.resolve(__dirname, "../.env"), "utf8");
    const match = envFile.match(/JWT_SECRET=(.+?)(\n|$)/);
    if (match) {
      process.env.JWT_SECRET = match[1].trim().replace(/^"|"$/g, "");
    }
  } catch (err) {
    console.log("Could not read .env file directly");
  }
}

// Validate required environment variables
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("ERROR: JWT_SECRET is not set in .env");
  process.exit(1);
}

// Initialize Firebase
require("./config/firebase");

const app = express();

// Security & Logging Middleware
app.use(helmet());
app.use(morgan("combined")); // HTTP request logger

// Restrict CORS to specific origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000", "http://localhost:5173"];
app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "10kb" })); // Limit payload size

// Rate limiting
const generalLimiter = rateLimit({ 
  windowMs: 60_000, 
  max: 60, 
  standardHeaders: true,
  message: "Too many requests, please try again later"
});

const authLimiter = rateLimit({ 
  windowMs: 15 * 60_000, 
  max: 5,
  standardHeaders: true,
  message: "Too many auth attempts, please try again later"
});

app.use(generalLimiter);

app.use("/auth", authLimiter, require("./routes/auth"));
app.use("/api/questions", require("./routes/questions"));
app.get("/health", (_, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// 404 handler
app.use((_, res) => res.status(404).json({ success: false, error: "Endpoint not found" }));

// Centralized error handler (must be last)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`MathSprint API running on port ${PORT}`));