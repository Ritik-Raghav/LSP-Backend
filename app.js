// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import connectDB from "./database/database.js";

import publicRoutes from "./routes/public.route.js";
import userRoutes from "./routes/user.route.js";
import providerRoutes from "./routes/provider.route.js";
import { userAuthMiddleware, providerAuthMiddleware } from "./middlewares/auth.js";

// Load environment variables
dotenv.config();

// Connect Database
connectDB();

const app = express();

// ✅ Security middleware
app.use(helmet()); // adds secure headers


const allowedOrigins = [
  "http://localhost:8080",
  "http://13.203.199.148:3000",   // React dev server
  "https://nearbyhub.vercel.app/",  // production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow curl or mobile apps
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error(`CORS policy: The origin ${origin} is not allowed.`), false);
      }
      return callback(null, true);
    },
    credentials: true,  // allow cookies / auth headers
  })
);


// ✅ Logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined")); // production-friendly format
}

// ✅ Compression for better performance
app.use(compression());

// ✅ Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ Static file serving
app.use("/uploads", express.static("uploads"));

// ✅ API Routes
app.use("/api/public", publicRoutes);
app.use("/api/user", userAuthMiddleware, userRoutes);
app.use("/api/provider", providerAuthMiddleware, providerRoutes);

// ✅ Health check route (for uptime monitoring)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV });
});

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
