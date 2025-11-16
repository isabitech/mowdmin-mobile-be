import fetch from 'node-fetch';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

const API_BASE_URL = `http://localhost:${process.env.PORT || 3000}/api/auth`;

class OTPTester {
    constructor() {
        this.testEmail = `dammy33@mailinator.com`;
        this.testPassword = 'TestPass123!';
        this.testName = 'OTP Test User';
    }

    async makeRequest(endpoint, method = 'POST', body = null) {
        try {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();
            
            console.log(`\n🔍 ${method} ${endpoint}`);
            console.log(`Status: ${response.status} ${response.statusText}`);
            console.log('Response:', JSON.stringify(data, null, 2));
            
            return { response, data };
        } catch (error) {
            console.error(`❌ Request failed: ${error.message}`);
            throw error;
        }
    }

    async testRegistrationWithOTP() {
        console.log('\n🧪 Testing User Registration with Email Verification...');
        
        const { response, data } = await this.makeRequest('/register', 'POST', {
            name: this.testName,
            email: this.testEmail,
            password: this.testPassword,
            language: 'EN'
        });

        if (response.status === 201) {
            console.log('✅ Registration successful');
            console.log('📧 Check email for verification OTP');
            return data;
        } else {
            console.log('❌ Registration failed');
            throw new Error(`Registration failed: ${data.message}`);
        }
    }

    async testEmailVerification(otp) {
        console.log('\n🧪 Testing Email Verification...');
        
        const { response, data } = await this.makeRequest('/verify-email', 'POST', {
            email: this.testEmail,
            otp: otp
        });

        if (response.status === 200) {
            console.log('✅ Email verification successful');
            return data;
        } else {
            console.log('❌ Email verification failed');
            throw new Error(`Verification failed: ${data.message}`);
        }
    }

    async testResendVerification() {
        console.log('\n🧪 Testing Resend Verification...');
        
        const { response, data } = await this.makeRequest('/resend-verification', 'POST', {
            email: this.testEmail
        });

        if (response.status === 200) {
            console.log('✅ Resend verification successful');
            return data;
        } else {
            console.log('❌ Resend verification failed');
            console.log('Response:', data);
        }
    }

    async testForgotPassword() {
        console.log('\n🧪 Testing Forgot Password...');
        
        const { response, data } = await this.makeRequest('/forgot-password', 'POST', {
            email: this.testEmail
        });

        if (response.status === 200) {
            console.log('✅ Forgot password OTP sent');
            return data;
        } else {
            console.log('❌ Forgot password failed');
            throw new Error(`Forgot password failed: ${data.message}`);
        }
    }

    async testResetPassword(otp) {
        console.log('\n🧪 Testing Password Reset...');
        
        const newPassword = 'NewTestPass123!';
        
        const { response, data } = await this.makeRequest('/reset-password', 'POST', {
            email: this.testEmail,
            otp: otp,
            newPassword: newPassword,
            confirmPassword: newPassword
        });

        if (response.status === 200) {
            console.log('✅ Password reset successful');
            return data;
        } else {
            console.log('❌ Password reset failed');
            throw new Error(`Password reset failed: ${data.message}`);
        }
    }

    async runInteractiveTest() {
        try {
            console.log('🚀 Starting Interactive OTP Testing...');
            console.log(`Test Email: ${this.testEmail}`);
            
            // Step 1: Register user
            await this.testRegistrationWithOTP();
            
            console.log('\n📧 An OTP has been sent to the test email.');
            console.log('💡 In a real scenario, check your email for the 4-digit verification code.');
            console.log('💡 For testing, you can check Redis or server logs for the generated OTP.');
            
            // Test resend functionality
            console.log('\n⏳ Waiting 2 seconds before testing resend...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            await this.testResendVerification();
            
            console.log('\n💡 To complete the test:');
            console.log('1. Check server logs for the OTP codes');
            console.log('2. Use the codes to test verification and password reset manually');
            console.log(`3. Test email verification: POST ${API_BASE_URL}/verify-email`);
            console.log('   Body: { "email": "' + this.testEmail + '", "otp": "YOUR_OTP" }');
            console.log(`4. Test forgot password: POST ${API_BASE_URL}/forgot-password`);
            console.log('   Body: { "email": "' + this.testEmail + '" }');
            console.log(`5. Test password reset: POST ${API_BASE_URL}/reset-password`);
            console.log('   Body: { "email": "' + this.testEmail + '", "otp": "YOUR_OTP", "newPassword": "NewPass123!", "confirmPassword": "NewPass123!" }');
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    async runQuickTest() {
        try {
            console.log('🚀 Starting Quick OTP Test (Registration only)...');
            
            // Test registration
            await this.testRegistrationWithOTP();
            
            console.log('\n✅ Quick test completed successfully!');
            console.log('📧 Check server logs for the generated OTP');
            console.log(`💡 Test email: ${this.testEmail}`);
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }
}

// Run tests
const tester = new OTPTester();

// Check command line arguments
const testType = process.argv[2] || 'quick';

if (testType === 'interactive') {
    console.log('🔄 Running interactive test mode...');
    tester.runInteractiveTest();
} else {
    console.log('🔄 Running quick test mode...');
    console.log('💡 Use "npm run test-otp interactive" for full interactive testing');
    tester.runQuickTest();
}