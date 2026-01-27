import { config } from 'dotenv';
import path from 'path';

// Load environment variables from the correct path
const envPath = path.resolve(process.cwd(), '.env');
const result = config({ path: envPath });

console.log('🔧 Environment configuration loaded from:', envPath);
console.log('🔧 Environment variables loaded successfully:', !result.error);

if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('🔧 Available environment variables:', {
    DB_HOST: process.env.DB_HOST ? 'SET' : 'NOT SET',
    DB_PORT: process.env.DB_PORT ? 'SET' : 'NOT SET',
    DB_DATABASE: process.env.DB_DATABASE ? 'SET' : 'NOT SET',
    DB_USERNAME: process.env.DB_USERNAME ? 'SET' : 'NOT SET',
    DB_PASSWORD: process.env.DB_PASSWORD ? 'SET' : 'NOT SET',
  });
}