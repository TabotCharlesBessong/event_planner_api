// src/server.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import sequelize from "./config/database";
import User from "./models/user.model";
import Event from "./models/event.model";
import Booking from "./models/booking.model";



// Load env variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Body parser
app.use(morgan("dev")); // Logging


// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});


// Define port
const PORT = process.env.PORT || 5000;

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    User.sync({alter:false})
    Event.sync({alter:false})
    Booking.sync({alter:false})

    // Sync models with database (use {force: true} to drop tables in development)
    const syncOptions =
      process.env.NODE_ENV === "development" ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    console.log("Database models synchronized.");

    // Start server
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

// Start server
startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
