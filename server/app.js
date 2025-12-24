import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import status from "express-status-monitor";
import { v2 as cloudinary } from "cloudinary";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Config / constants
import {
  corsOptions,
  helmetOptions,
  limiterOptions,
} from "./src/constants/options.js";

// Routes
import { userRouter } from "./src/routes/user.routes.js";
import { fileRouter } from "./src/routes/file.routes.js";

// Errors
import { ApiError } from "./src/utils/ApiError.js";
import errorMiddleware from "./src/middlewares/errorMiddleware.js";

// Jobs
import "./src/jobs/index.js";

// --------------------
// App setup
// --------------------
export const app = express();

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// --------------------
// Cloudinary config
// --------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --------------------
// Global middlewares
// --------------------
app.use(status());

app.use(cors(corsOptions));
app.use(express.json({ limit: "12kb" }));
app.use(cookieParser());

// Security
// app.use(helmet(helmetOptions)); // enable if no CSP issues
app.use("/api", rateLimit(limiterOptions));
app.use(mongoSanitize());
app.use(xssClean());
app.use(
  hpp({
    whitelist: ["size", "name", "createdAt", "type", "format"],
  })
);

app.use(compression());

// --------------------
// Routes
// --------------------
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/files", fileRouter);

// --------------------
// Health check (REQUIRED for Render)
// --------------------
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CloudNest API is running 🚀",
  });
});

// Prevent favicon noise
app.get("/favicon.ico", (req, res) => res.sendStatus(204));

// --------------------
// 404 handler (LAST ROUTE)
// --------------------
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// --------------------
// Global error middleware
// --------------------
app.use(errorMiddleware);
