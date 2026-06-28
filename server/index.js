import express from "express";
import dotenv from "dotenv";
import { securityMiddleware } from "./middleware/securityMiddleware.js";
import { initializeDatabase } from "./db/setup.js";

// Route imports
import authRoutes from "./routes/auth.js";
import customerRoutes from "./routes/customers.js";
import leadRoutes from "./routes/leads.js";
import taskRoutes from "./routes/tasks.js";
import dashboardRoutes from "./routes/dashboard.js";
import reportRoutes from "./routes/reports.js";
import logRoutes from "./routes/logs.js";
import userRoutes from "./routes/users.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();

// Global Middleware
app.use(express.json());
app.use("/uploads", express.static("public/uploads"));

// Apply Security Middleware (CORS, Helmet, Rate Limiting)
securityMiddleware(app);

const PORT = process.env.PORT || 5000;

// Health Check
app.get("/", (req, res) => res.send("🚀 Clarior CRM Backend (Modular) Running"));

// Database Test Route
app.get("/test-db", async (req, res) => {
  try {
    const { sql } = await import("./db/index.js");
    const result = await sql`SELECT NOW()`;
    res.json({
      success: true,
      time: result[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Database Initialization Endpoint
app.post("/setup-db", async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ success: true, message: "✅ Database setup complete!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/customers", customerRoutes); // Retain old root paths for ease of migration
app.use("/leads", leadRoutes);
app.use("/tasks", taskRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reports", reportRoutes);
app.use("/activity-logs", logRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Clarior server running on http://localhost:${PORT}`);
  // Run DB init asynchronously on start
  initializeDatabase().catch((err) => {
    console.error("Failed to automatically initialize database:", err);
  });
});