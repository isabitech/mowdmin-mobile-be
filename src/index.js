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

const PORT = process.env.PORT || 3000;
const app = express();

// Core middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(attachRequestMeta);

// API router
const apiRouter = express.Router();
apiRouter.use('/auth', auth);
apiRouter.use('/event', Event);
apiRouter.use('/event-registration', registration);
apiRouter.use('/media-bookmark', mediaBookmark);
apiRouter.use('/notification', notification);
apiRouter.use('/prayer', prayer);
apiRouter.use('/orders', Orders);
apiRouter.use('/product', Product);
apiRouter.use('/media-category', mediaCategory);
apiRouter.use('/order-item', orderItem);
apiRouter.use('/prayer-request', prayerRequest);
apiRouter.use('/media', media);
apiRouter.use('/membership', membership);
apiRouter.use('/profile', profile);
apiRouter.use('/donation', donation);
apiRouter.use('/info', info);
apiRouter.use('/payment', payment);

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

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });

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
