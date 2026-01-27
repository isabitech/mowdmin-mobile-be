// Test script for Brevo email service
import EmailService from './src/Services/emailService.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

config();

const isDryRun = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

async function testBrevoEmail() {
    try {
        console.log('🧪 Testing Brevo email service...');
        console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? 'SET' : 'NOT SET');
        console.log('BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL);

        if (isDryRun) {
            console.log('🧯 DRY RUN enabled: skipping outbound email sends');
            return;
        }
        
        // Test welcome email
        await EmailService.sendWelcomeEmail('test@example.com', 'Test User');
        console.log('✅ Welcome email test completed');
        
        // Test token email
        await EmailService.sendTokenEmail('test@example.com', '1234', 'Password Reset');
        console.log('✅ Token email test completed');
        
    } catch (error) {
        console.error('❌ Email test failed:', error.message);
        console.error('Full error:', error);
    }
}

// Run test if this file is executed directly
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    testBrevoEmail();
}