const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const colors = require("colors");
require("dotenv").config();

// Import database connection
const connectDB = require("./config/db");

// Import middleware
const {
  errorHandler,
  notFound,
  securityHeaders,
  requestLogger,
  rateLimitHandler,
} = require("./middleware/errorMiddleware");

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  handler: rateLimitHandler,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
});
app.use("/api", limiter);

// Body parser middleware
app.use(
  express.json({
    limit: process.env.MAX_FILE_UPLOAD_SIZE || "5mb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_FILE_UPLOAD_SIZE || "5mb",
  })
);
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use(requestLogger);
}

// Static files
app.use("/uploads", express.static("uploads"));

// Health check route
app.get("/api/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  const uptime = process.uptime();

  res.status(200).json({
    success: true,
    message: "DietarySense API is running successfully!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
    database: dbStatus,
    uptime: `${Math.floor(uptime / 60)}m ${Math.floor(uptime % 60)}s`,
    memory: process.memoryUsage(),
  });
});

// API Documentation route
app.get("/api/docs", (req, res) => {
  res.json({
    message: "DietarySense API Documentation",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register a new user",
        "POST /api/auth/login": "Login user",
        "GET /api/auth/logout": "Logout user",
        "GET /api/auth/me": "Get current user",
        "POST /api/auth/onboarding": "Complete user onboarding",
      },
      users: {
        "GET /api/users/profile": "Get user profile (Protected)",
        "PUT /api/users/profile": "Update user profile (Protected)",
        "POST /api/users/calculate-calories": "Calculate calories (Protected)",
        "GET /api/users/meal-history": "Get meal history (Protected)",
        "POST /api/users/meal-history": "Add meal to history (Protected)",
      },
      recipes: {
        "GET /api/recipes": "Get all recipes (Public)",
        "GET /api/recipes/:id": "Get single recipe (Public)",
        "POST /api/recipes": "Create recipe (Protected)",
        "PUT /api/recipes/:id": "Update recipe (Protected)",
        "DELETE /api/recipes/:id": "Delete recipe (Protected)",
        "POST /api/recipes/:id/image": "Upload recipe image (Protected)",
      },
      mealplans: {
        "POST /api/mealplans/generate": "Generate meal plan (Protected)",
        "GET /api/mealplans": "Get user meal plans (Protected)",
        "GET /api/mealplans/:id": "Get single meal plan (Protected)",
        "PUT /api/mealplans/:id": "Update meal plan (Protected)",
        "DELETE /api/mealplans/:id": "Delete meal plan (Protected)",
        "GET /api/mealplans/:id/grocery-list": "Get grocery list (Protected)",
      },
      admin: {
        "GET /api/admin/dashboard": "Get dashboard stats (Admin)",
        "GET /api/admin/users": "Get all users (Admin)",
        "DELETE /api/admin/users/:id": "Delete user (Admin)",
        "GET /api/admin/recipes": "Get all recipes (Admin)",
        "PUT /api/admin/recipes/:id/approve": "Approve recipe (Admin)",
        "PUT /api/admin/recipes/:id/reject": "Reject recipe (Admin)",
        "GET /api/admin/meal-plans": "Get all meal plans (Admin)",
      },
    },
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/mealplans", mealPlanRoutes);
app.use("/api/admin", adminRoutes);

// Handle undefined routes
app.all("*", notFound);

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60).cyan);
  console.log("🍎  DIETARYSENSE BACKEND SERVER".bold.yellow);
  console.log("=".repeat(60).cyan);
  console.log(
    `🚀  Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.green
  );
  console.log(`📚  API Health: http://localhost:${PORT}/api/health`.blue);
  console.log(`📖  API Docs: http://localhost:${PORT}/api/docs`.blue);
  console.log(
    `🌐  Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`
      .magenta
  );
  console.log(
    `🗄️  Database: ${
      mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected ❌"
    }`.blue
  );
  console.log(`🔐  JWT Expire: ${process.env.JWT_EXPIRE || "30d"}`.green);
  console.log("=".repeat(60).cyan);
  console.log("💡  Tip: Use Postman or curl to test the API endpoints".gray);
  console.log("=".repeat(60).cyan + "\n");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log("❌  Unhandled Rejection at:".red, promise);
  console.log("💥  Reason:".red, err.message);
  console.log("🔄  Shutting down server gracefully...".yellow);

  server.close(() => {
    console.log("👋  Process terminated".red);
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("❌  Uncaught Exception thrown:".red);
  console.log("📛  Name:".red, err.name);
  console.log("💬  Message:".red, err.message);
  console.log("📋  Stack:".red, err.stack);
  console.log("🔄  Shutting down server...".yellow);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋  SIGTERM received, shutting down gracefully...".yellow);
  server.close(() => {
    console.log("✅  Process terminated successfully".green);
  });
});

module.exports = app;
