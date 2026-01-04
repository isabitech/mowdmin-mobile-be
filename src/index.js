import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from 'dotenv'
import { connectMongoDB } from './Config/mongodb.js'
import auth from './Routes/AuthRoute.js'
import { errorHandler } from './middleware/errorHandler.js'
import Event from './Routes/EventRoute.js'
import registration from './Routes/EventRegistrationRoute.js'
import mediaBookmark from './Routes/MediaBookmarkRoute.js'
import notification from './Routes/NotificationRoute.js'
import prayer from './Routes/PrayerRoute.js'
import Orders from './Routes/OrderRoute.js'
import Product from './Routes/ProductRoute.js'
import mediaCategory from './Routes/MediaCategoryRoute.js'
import orderItem from './Routes/OrderItemRoute.js'
import prayerRequest from './Routes/PrayerRequestRoute.js'
import media from './Routes/MediaRoute.js'
import membership from './Routes/MembershipRoute.js'
import profile from './Routes/ProfileRoute.js'
import donation from './Routes/DonationRoute.js'
import info from './Routes/InfoRoute.js'
import payment from './Routes/PaymentRoute.js'

config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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

// Handle invalid routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
});

app.use(errorHandler);

async function bootstrap() {
    try {
        if (process.env.DB_CONNECTION === 'mysql') {
            console.log('🔄 Connecting to MySQL database...');
            const { connectDB } = await import('./Config/db.js');
            await connectDB();
        } else if (process.env.DB_CONNECTION === 'mongodb') {
            console.log('🔄 Connecting to MongoDB database...');
            await connectMongoDB();
        } else {
            throw new Error(`Unsupported DB_CONNECTION: ${process.env.DB_CONNECTION}`);
        }

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
}

export default app;

if (process.env.NODE_ENV !== 'test') {
    bootstrap();
}
