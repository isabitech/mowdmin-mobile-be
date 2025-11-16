import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from 'dotenv'
import { connectDB } from './Config/db.js'
import { initializeRedis } from './Config/redis.js'
import { errorHandler } from './middleware/errorHandler.js'

// Load environment variables first
config({ path: '../.env' });

// Import routes after environment variables are loaded
import authRoutes from './Routes/AuthRoute.js'
import Event from './Routes/EventRoute.js'
import registration from './Routes/EventRegistrationRoute.js'
import Media from './Routes/MediaRoute.js'
import Order from './Routes/OrderRoute.js'
import OrderItem from './Routes/OrderItemRoutes.js'
import MediaCategory from './Routes/MediaCategoryRoute.js'
import MediaBookmark from './Routes/MediaBookmarkRoute.js'
import Prayer from './Routes/PrayerRoutes.js'
import PrayerRequest from './Routes/PrayerRequestRoutes.js'
import Payment  from './Routes/PaymentRoutes.js'
import Product from './Routes/ProductRoute.js'
import Notification from './Routes/NotificationRoute.js'

const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use('/api/auth', authRoutes);
app.use('/api/event', Event);
app.use('/api/event-registration', registration);
app.use("/api/media", Media);
app.use("/api/media-category", MediaCategory);
app.use("/api/media-bookmark", MediaBookmark);
app.use("/api/orders", Order);
app.use("/api/order-items", OrderItem);
app.use("/api/payments", Payment);
app.use("/api/prayer", Prayer)
app.use("/api/prayer-request", PrayerRequest);
app.use ("/api/Products", Product)
app.use("/api/notifications", Notification);

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Mowdmin API is running ' });
});
// Handle invalid routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
});

app.use(errorHandler);

// Initialize connections
const initializeServices = async () => {
    try {
        // Initialize database first
        await connectDB();
        console.log('✅ Database connection established');
        
        // Initialize Redis
        await initializeRedis();
        console.log('✅ Redis connection established');
        
        return true;
    } catch (error) {
        console.error('❌ Service initialization failed:', error);
        throw error;
    }
};

initializeServices()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    });