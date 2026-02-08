import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import './env.js';
import { connectMongoDB } from './Config/mongodb.js';
import { connectDB } from './Config/db.js';
import { initializeRedis } from './Config/redis.js';
import { attachRequestMeta } from './middleware/requestMeta.js';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import auth from './Routes/AuthRoute.js';
import Event from './Routes/EventRoute.js';
import registration from './Routes/EventRegistrationRoute.js';
import mediaBookmark from './Routes/MediaBookmarkRoute.js';
import notification from './Routes/NotificationRoute.js';
import prayer from './Routes/PrayerRoute.js';
import Orders from './Routes/OrderRoute.js';
import Product from './Routes/ProductRoute.js';
import mediaCategory from './Routes/MediaCategoryRoute.js';
import orderItem from './Routes/OrderItemRoute.js';
import prayerRequest from './Routes/PrayerRequestRoute.js';
import media from './Routes/MediaRoute.js';
import membership from './Routes/MembershipRoute.js';
import profile from './Routes/ProfileRoute.js';
import donation from './Routes/DonationRoute.js';
import info from './Routes/InfoRoute.js';
import payment from './Routes/PaymentRoute.js';
import group from './Routes/GroupRoute.js';
import ministry from './Routes/MinistryRoute.js';
import { bibleStoryRouter, bibleVerseRouter } from './Routes/BibleRoute.js';
import prayerLike from './Routes/PrayerLikeRoute.js';
import prayerComment from './Routes/PrayerCommentRoute.js';

const PORT = process.env.PORT || 3000;

// Validate NODE_ENV is set correctly
if (!process.env.NODE_ENV) {
  console.error('❌ FATAL: NODE_ENV is not set. Set to "production" for production deployments.');
  process.exit(1);
}

if (process.env.NODE_ENV === 'production') {
  console.log('✅ Running in PRODUCTION mode - security hardened');
} else {
  console.warn('⚠️ Running in NON-PRODUCTION mode - additional debugging enabled');
}

const app = express();


app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for mobile apps
}));

// Core middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://localhost:3001']; // Default for development

app.use(cors({
  // origin: (origin, callback) => {
  //   // Allow requests with no origin (mobile apps, Postman, etc.)
  //   if (!origin) return callback(null, true);

  //   if (allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));
app.use(morgan('combined'));
app.use(compression());
app.use(express.json()); // Moved this line up as per instruction's implied order

// Health check endpoint (before routes)
app.get('/health', async (req, res) => {
  try {
    const sequelize = (await import('./Config/db.js')).default();
    await sequelize.authenticate();

    let redisStatus = 'not configured';
    try {
      const { redisClient, isRedisAvailable } = await import('./Config/redis.js');
      redisStatus = isRedisAvailable() ? 'connected' : 'disconnected';
    } catch (err) {
      redisStatus = 'not configured';
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      services: {
        database: 'connected',
        redis: redisStatus
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(attachRequestMeta);

// API router
const apiRouter = express.Router();
apiRouter.use('/auth', auth);
apiRouter.use('/event', Event);
apiRouter.use('/events', Event); // Alias for plural events
apiRouter.use('/event-registration', registration);
apiRouter.use('/media-bookmark', mediaBookmark);
apiRouter.use('/notifications', notification); // Pluralized
apiRouter.use('/prayer', prayer);

apiRouter.use('/prayer-like', prayerLike);
apiRouter.use('/prayer-comment', prayerComment);
apiRouter.use('/orders', Orders);
apiRouter.use('/product', Product);
apiRouter.use('/media-category', mediaCategory);
apiRouter.use('/order-item', orderItem);
apiRouter.use('/prayer-request', prayerRequest);
apiRouter.use('/media', media);
apiRouter.use('/videos', media); // Alias for videos
apiRouter.use('/bible-stories', bibleStoryRouter);
apiRouter.use('/bible-verses', bibleVerseRouter);
apiRouter.use('/ministries', ministry);
apiRouter.use('/membership', membership);
apiRouter.use('/profile', profile);
apiRouter.use('/donation', donation);
apiRouter.use('/info', info);
apiRouter.use('/payment', payment);
apiRouter.use('/groups', group);

app.use('/api/v1', apiRouter);

// Health check
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Mowdmin API is running' });
});

// 404 handler
app.use((req, _res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

process.on('uncaughtException', err => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

let server;

async function bootstrap() {
  try {
    if (process.env.DB_CONNECTION === 'mongodb') {
      console.log('🔄 Connecting to MongoDB...');
      await connectMongoDB();
    } else if (process.env.DB_CONNECTION === 'mysql') {
      console.log('🔄 Connecting to MySQL...');
      await connectDB();

      const { default: defineAssociations } = await import('./Models/associations.js');
      defineAssociations();
    } else {
      throw new Error(`Unsupported DB_CONNECTION: ${process.env.DB_CONNECTION}`);
    }

    console.log('🔄 Connecting to Redis...');
    await initializeRedis();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down gracefully...`);

      server.close(async () => {
        console.log('HTTP server closed');

        try {
          // Close database connection
          const sequelize = (await import('./Config/db.js')).default();
          await sequelize.close();
          console.log('Database connection closed');

          // Close Redis connection if available
          try {
            const { redisClient } = await import('./Config/redis.js');
            if (redisClient && redisClient.isOpen) {
              await redisClient.quit();
              console.log('Redis connection closed');
            }
          } catch (err) {
            // Redis might not be configured
          }

          console.log('✅ Graceful shutdown complete');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Startup failed:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', err => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  bootstrap();
}
