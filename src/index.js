import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { config } from 'dotenv'
import { connectDB } from './Config/db.js'
import authRoutes from './Routes/AuthRoute.js'
import { errorHandler } from './middleware/errorHandler.js'

config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(compression());
app.use(express.json());
app.use('/api/auth', authRoutes);
const PORT = process.env.PORT || 3000;
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