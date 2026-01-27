import getSequelize, { connectDB } from './src/Config/db.js';

async function updateUserTable() {
    try {
        console.log('🔄 Connecting to database...');
        await connectDB();
        const sequelize = getSequelize();
        
        console.log('🔧 Adding emailVerified and emailVerifiedAt columns to users table...');
        
        // Add columns if they don't exist
        await sequelize.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP WITH TIME ZONE;
        `);
        
        console.log('✅ Columns added successfully');
        
        // Update existing users to have emailVerified = false
        await sequelize.query(`
            UPDATE users SET "emailVerified" = false WHERE "emailVerified" IS NULL;
        `);
        
        console.log('✅ Existing users updated');
        
        console.log('🔄 Syncing model with altered table...');
        await sequelize.sync({ alter: true });
        
        console.log('✅ Database migration completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

updateUserTable();