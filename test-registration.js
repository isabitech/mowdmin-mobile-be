// Test the registration endpoint to verify Brevo email integration
// Run this with: node test-registration.js

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3000/api/auth';

async function testRegistration() {
    try {
        console.log('🧪 Testing user registration with Brevo email...');
        
        const testUser = {
            name: 'Test User Brevo',
            email: 'test.brevo@example.com',
            password: 'TestPass123@',
            language: 'EN'
        };

        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Registration successful!');
            console.log('User ID:', result.data.user.id);
            console.log('JWT Token:', result.data.token ? 'Generated' : 'Missing');
            console.log('📧 Welcome email should be sent via Brevo...');
        } else {
            console.log('❌ Registration failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

async function testForgotPassword() {
    try {
        console.log('🧪 Testing forgot password with Brevo email...');
        
        const response = await fetch(`${API_BASE}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test.brevo@example.com'
            })
        });

        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Password reset request successful!');
            console.log('📧 Reset token email should be sent via Brevo...');
        } else {
            console.log('❌ Password reset failed:', result);
        }
        
    } catch (error) {
        console.error('❌ Forgot password test failed:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Brevo email integration tests...\n');
    
    await testRegistration();
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Wait a bit before testing forgot password
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await testForgotPassword();
    
    console.log('\n✨ Tests completed! Check your email system logs for Brevo API calls.');
}

runTests();