import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from 'dotenv'
import { connectDB } from './Config/db.js'
import authRoutes from './Routes/AuthRoute.js'
import { errorHandler } from './middleware/errorHandler.js'
import Event from './Routes/EventRoute.js'
import registration from './Routes/EventRegistrationRoute.js'

config();
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

app.get('/', (req, res) => {
    res.status(200).json({ message: 'Mowdmin API is running 🚀' });
});
// Handle invalid routes
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    error.status = 404;
    next(error);
});

app.use(errorHandler);
connectDB()
    .then(() => {
        console.log('✅ Database connection established');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    });