import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const mongoUri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME;

console.log('--- MongoDB Diagnostic Tool ---');
console.log(`URI: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`); // Mask password
console.log(`DB Name: ${dbName}`);

if (!mongoUri) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
}

async function testConnection() {
    console.log('\n🔄 Attempting to connect...');

    const timeout = setTimeout(() => {
        console.error('\n⚠️ Connection attempt timed out (30s). This strongly suggests a firewall or IP whitelist issue.');
        process.exit(1);
    }, 30000);

    try {
        await mongoose.connect(mongoUri, {
            dbName: dbName,
            serverSelectionTimeoutMS: 10000, // Fail fast if cluster not reachable
        });
        clearTimeout(timeout);
        console.log('✅ SUCCESS: Connection established successfully!');

        const admin = mongoose.connection.db.admin();
        const info = await admin.serverStatus();
        console.log(`📊 Server Version: ${info.version}`);

        await mongoose.disconnect();
        console.log('👋 Disconnected.');
    } catch (error) {
        clearTimeout(timeout);
        console.error('\n❌ CONNECTION FAILED');
        console.error(`Error Code: ${error.code}`);
        console.error(`Error Message: ${error.message}`);

        if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 SUGGESTIONS:');
            console.log('1. Check if your current IP is whitelisted in MongoDB Atlas (Network Access).');
            console.log('2. Ensure your firewall or ISP is not blocking port 27017.');
            console.log('3. If using "mongodb+srv", try the "Standard Connection String" (mongodb:// instead of mongodb+srv://) which you can find in the Atlas Connect dialog.');
        } else if (error.message.includes('Authentication failed')) {
            console.log('\n💡 SUGGESTION: Double-check your database username and password in .env.');
        }
    }
}

testConnection();
