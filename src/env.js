import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the project root
const envPath = path.resolve(process.cwd(), '.env');
config({ path: envPath });

// Ensure critical environment variables are loaded
const requiredVars = [
    'DB_HOST',
    'DB_DATABASE',
    'DB_USERNAME',
    'DB_PASSWORD',
    'REDIS_HOST',
    'REDIS_PASSWORD',
    'BREVO_API_KEY',
    'JWT_SECRET'
];

for (const varName of requiredVars) {
    if (!process.env[varName]) {
        console.warn(`⚠️ Environment variable ${varName} is not set`);
    }
}

console.log('✅ Environment variables loaded successfully');

export default process.env;