import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cron from "node-cron";
import { logger } from "./core/logger.js";

import "./env.js";
import { connectMongoDB } from "./Config/mongodb.js";
import { connectDB } from "./Config/db.js";
import { initializeRedis, isRedisAvailable } from "./Config/redis.js";
import { attachRequestMeta } from "./middleware/requestMeta.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import auth from "./Routes/AuthRoute.js";
import Event from "./Routes/EventRoute.js";
import registration from "./Routes/EventRegistrationRoute.js";
import mediaBookmark from "./Routes/MediaBookmarkRoute.js";
import notification from "./Routes/NotificationRoute.js";
import prayer from "./Routes/PrayerRoute.js";
import Orders from "./Routes/OrderRoute.js";
import Product from "./Routes/ProductRoute.js";
import mediaCategory from "./Routes/MediaCategoryRoute.js";
import orderItem from "./Routes/OrderItemRoute.js";
import prayerRequest from "./Routes/PrayerRequestRoute.js";
import media from "./Routes/MediaRoute.js";
import membership from "./Routes/MembershipRoute.js";
import profile from "./Routes/ProfileRoute.js";
import donation from "./Routes/DonationRoute.js";
import info from "./Routes/InfoRoute.js";
import payment from "./Routes/PaymentRoute.js";
import group from "./Routes/GroupRoute.js";
import ministry from "./Routes/MinistryRoute.js";
import { bibleStoryRouter, bibleVerseRouter } from "./Routes/BibleRoute.js";
import prayerLike from "./Routes/PrayerLikeRoute.js";
import prayerComment from "./Routes/PrayerCommentRoute.js";
import campaign from "./Routes/CampaignRoute.js";
import { measurePerformance } from "./Utils/performance.js";
import { scheduleRenderKeepAlive } from "./Utils/keepAlive.js";

const PORT = process.env.PORT || 3000;
const REQUEST_TIMEOUT_MS = Number.parseInt(
  process.env.REQUEST_TIMEOUT_MS || "10000",
  10,
);
const SOCKET_TIMEOUT_MS = Number.parseInt(
  process.env.SOCKET_TIMEOUT_MS || "120000",
  10,
);

let mongoConnectionReady = false;
let sqlConnectionReady = false;
let redisConnectionReady = false;

// Validate NODE_ENV is set correctly
if (!process.env.NODE_ENV) {
  console.error(
    '❌ FATAL: NODE_ENV is not set. Set to "production" for production deployments.',
  );
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  logger.info("Running in PRODUCTION mode - security hardened");
} else {
  logger.warn(
    "⚠️ Running in NON-PRODUCTION mode - additional debugging enabled",
  );
}

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding for mobile apps
  }),
);

// Core middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:3000", "http://localhost:3001"]; // Default for development

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400, // 24 hours
  }),
);
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}
app.use(compression());

const healthCheckHandler = measurePerformance(async (req, res) => {
  const dbStatus =
    process.env.DB_CONNECTION === "mongodb"
      ? mongoConnectionReady
        ? "connected"
        : "disconnected"
      : sqlConnectionReady
        ? "connected"
        : "disconnected";
  const redisStatus = redisConnectionReady ? "connected" : "disconnected";

  const healthy = dbStatus === "connected";

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    services: {
      database: dbStatus,
      redis: redisStatus,
    },
  });
}, "GET /health");

// Health check endpoint (before routes)
app.get("/health", healthCheckHandler);

// ==========================================
// Stripe Webhook (MUST be before express.json())
// ==========================================
// We mount this part of the payment route early so it can parse raw bodies.
import PaymentController from "./Controllers/PaymentController.js";
import { tryCatch } from "./Utils/try-catch.js";
app.post(
  "/api/v1/payment/webhooks/stripe",
  express.raw({ type: "application/json" }),
  tryCatch(PaymentController.handleWebhook),
);

// Global Parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(attachRequestMeta);

// API router
const apiRouter = express.Router();
apiRouter.use("/auth", auth);
apiRouter.use("/event", Event);
apiRouter.use("/events", Event); // Alias for plural events
apiRouter.use("/event-registration", registration);
apiRouter.use("/media-bookmark", mediaBookmark);
apiRouter.use("/notifications", notification); // Pluralized
apiRouter.use("/prayer", prayer);

apiRouter.use("/prayer-like", prayerLike);
apiRouter.use("/prayer-comment", prayerComment);
apiRouter.use("/orders", Orders);
apiRouter.use("/product", Product);
apiRouter.use("/media-category", mediaCategory);
apiRouter.use("/order-item", orderItem);
apiRouter.use("/prayer-request", prayerRequest);
apiRouter.use("/media", media);
apiRouter.use("/videos", media); // Alias for videos
apiRouter.use("/bible-stories", bibleStoryRouter);
apiRouter.use("/bible-verses", bibleVerseRouter);
apiRouter.use("/ministries", ministry);
apiRouter.use("/membership", membership);
apiRouter.use("/profile", profile);
apiRouter.use("/donation", donation);
apiRouter.use("/info", info);
apiRouter.use("/payment", payment); // Standard JSON payment endpoints
apiRouter.use("/groups", group);
apiRouter.use("/campaigns", campaign);

app.use("/api/v1", apiRouter);

const rootHandler = measurePerformance(async (_req, res) => {
  res.status(200).json({ message: "Mowdmin API is running" });
}, "GET /");

// Health check
app.get("/", rootHandler);

// 404 handler
app.use((req, _res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! Shutting down...", {
    name: err.name,
    message: err.message,
  });
  process.exit(1);
});

let server;

async function bootstrap() {
  try {
    if (process.env.DB_CONNECTION === "mongodb") {
      logger.info("Connecting to MongoDB...");
      await connectMongoDB();
      mongoConnectionReady = true;
    } else if (process.env.DB_CONNECTION === "mysql") {
      logger.info("Connecting to MySQL...");
      await connectDB();
      sqlConnectionReady = true;

      const { default: defineAssociations } = await import(
        "./Models/associations.js"
      );
      defineAssociations();
    } else {
      throw new Error(
        `Unsupported DB_CONNECTION: ${process.env.DB_CONNECTION}`,
      );
    }

    logger.info("Connecting to Redis...");
    await initializeRedis();
    redisConnectionReady = isRedisAvailable();

    // Start background jobs
    logger.info("Starting background cron jobs...");
    // Run at minute 0 past every hour
    cron.schedule("0 * * * *", async () => {
      try {
        const PaymentService = (await import("./Services/PaymentService.js"))
          .default;
        await PaymentService.expirePendingPayments();
      } catch (err) {
        logger.error("[Cron] Error running expirePendingPayments", {
          message: err.message,
        });
      }
    });

    scheduleRenderKeepAlive({ port: PORT });

    // Start server
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });

    server.setTimeout(SOCKET_TIMEOUT_MS);
    server.requestTimeout = REQUEST_TIMEOUT_MS;
    server.headersTimeout = REQUEST_TIMEOUT_MS + 5000;

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          // Close database connection
          const sequelize = (await import("./Config/db.js")).default();
          await sequelize.close();
          logger.info("Database connection closed");

          // Close Redis connection if available
          try {
            const { getRedisClient } = await import("./Config/redis.js");
            const redis = await getRedisClient();
            if (redis && redis.isOpen) {
              await redis.quit();
              logger.info("Redis connection closed");
            }
          } catch (err) {
            // Redis might not be configured
          }

          logger.info("Graceful shutdown complete");
          process.exit(0);
        } catch (error) {
          logger.error("Error during shutdown", { message: error.message });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  } catch (err) {
    logger.error("Startup failed", { message: err.message });
    process.exit(1);
  }
}

process.on("unhandledRejection", (err) => {
  logger.error("UNHANDLED REJECTION! Shutting down...", {
    name: err.name,
    message: err.message,
  });

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

export default app;

if (process.env.NODE_ENV !== "test") {
  bootstrap();
}
