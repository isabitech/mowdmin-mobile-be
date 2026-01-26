import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const API_BASE = `http://localhost:${PORT}/api/v1`;
const isDryRun = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

class ProfileTestClient {
    constructor() {
        this.testUserId = null;
        this.authToken = process.env.AUTH_TOKEN || null;
    }

    async makeRequest(endpoint, method = 'GET', body = null, isFormData = false) {
        try {
            if (isDryRun) {
                console.log(`\n🧯 DRY RUN ${method} ${endpoint}`);
                if (body && !isFormData) console.log('Would send:', JSON.stringify(body, null, 2));
                if (body && isFormData) console.log('Would send: [FormData]');
                return { response: { status: 200 }, data: { status: 'dry_run' } };
            }

            const headers = isFormData
                ? (body && typeof body.getHeaders === 'function' ? body.getHeaders() : {})
                : { 'Content-Type': 'application/json' };

            if (this.authToken) {
                headers['Authorization'] = `Bearer ${this.authToken}`;
            }

            const options = { method, headers };

            if (body) {
                if (isFormData) {
                    options.body = body;
                } else {
                    options.body = JSON.stringify(body);
                }
            }

            const response = await fetch(`${API_BASE}${endpoint}`, options);
            const data = await response.json();
            
            console.log(`\\n${method} ${endpoint}`);
            console.log('Status:', response.status);
            console.log('Response:', JSON.stringify(data, null, 2));
            
            return { response, data };
        } catch (error) {
            console.error(`Error making request to ${endpoint}:`, error.message);
            throw error;
        }
    }

    async testCreateProfile(userId) {
        console.log('\\n🧪 Testing Create Profile...');
        
        const profileData = {
            displayName: 'Test User Profile',
            bio: 'This is a test bio for the profile functionality',
            location: 'Test City, Test Country',
            phone_number: '+1234567890',
            birthdate: '1990-01-15'
        };

        const { response, data } = await this.makeRequest(`/profile/${userId}`, 'PUT', profileData);

        if (response.status === 200) {
            console.log('✅ Profile created successfully');
            return data;
        } else {
            console.log('❌ Profile creation failed');
            return null;
        }
    }

    async testCreateProfileWithPhoto(userId) {
        console.log('\\n🧪 Testing Create Profile with Photo...');
        
        try {
            const formData = new FormData();
            formData.append('displayName', 'Test User with Photo');
            formData.append('bio', 'Profile with photo upload test');
            formData.append('location', 'Photo Test City');
            
            // Create a simple test image file (you can replace with actual image path)
            const testImagePath = 'test-image.jpg';
            if (fs.existsSync(testImagePath)) {
                formData.append('photo', fs.createReadStream(testImagePath));
            } else {
                console.log('⚠️ No test image found, creating profile without photo');
            }

            const { response, data } = await this.makeRequest(`/profile/${userId}`, 'PUT', formData, true);

            if (response.status === 200) {
                console.log('✅ Profile with photo created successfully');
                return data;
            } else {
                console.log('❌ Profile with photo creation failed');
                return null;
            }
        } catch (error) {
            console.error('Error in photo upload test:', error.message);
            return null;
        }
    }

    async testGetProfile(userId) {
        console.log('\\n🧪 Testing Get Profile...');
        
        const { response, data } = await this.makeRequest(`/profile/${userId}`, 'GET');

        if (response.status === 200) {
            console.log('✅ Profile retrieved successfully');
            return data;
        } else {
            console.log('❌ Profile retrieval failed');
            return null;
        }
    }

    async testUpdateProfile(userId) {
        console.log('\\n🧪 Testing Update Profile...');
        
        const updatedData = {
            displayName: 'Updated Test User',
            bio: 'This bio has been updated!',
            location: 'Updated City, New Country',
            phone_number: '+9876543210'
        };

        const { response, data } = await this.makeRequest(`/profile/${userId}`, 'PUT', updatedData);

        if (response.status === 200) {
            console.log('✅ Profile updated successfully');
            return data;
        } else {
            console.log('❌ Profile update failed');
            return null;
        }
    }

    async testDeleteProfile(userId) {
        console.log('\\n🧪 Testing Delete Profile...');
        
        const { response, data } = await this.makeRequest(`/profile/${userId}`, 'DELETE');

        if (response.status === 200) {
            console.log('✅ Profile deleted successfully');
            return data;
        } else {
            console.log('❌ Profile deletion failed');
            return null;
        }
    }

    async runProfileTests() {
        console.log('🚀 Starting Profile API Test Suite...');
        console.log('='.repeat(50));

        if (!this.authToken) {
            console.log('⚠️ AUTH_TOKEN not set. Profile routes are protected; set AUTH_TOKEN env var for real requests.');
        }

        // You'll need to provide a valid user ID for testing
        const testUserId = 'c47d6c8c-4d8b-4f9b-9c2a-1234567890ab'; // Replace with actual user ID
        
        try {
            console.log(`Testing with User ID: ${testUserId}`);

            // Test 1: Create Profile
            await this.testCreateProfile(testUserId);

            // Test 2: Get Profile
            await this.testGetProfile(testUserId);

            // Test 3: Update Profile
            await this.testUpdateProfile(testUserId);

            // Test 4: Get Updated Profile
            await this.testGetProfile(testUserId);

            // Test 5: Test profile with photo (optional)
            // await this.testCreateProfileWithPhoto(testUserId);

            // Test 6: Delete Profile
            await this.testDeleteProfile(testUserId);

            // Test 7: Try to get deleted profile (should fail)
            await this.testGetProfile(testUserId);

            console.log('\\n✅ Profile test suite completed!');
            console.log('='.repeat(50));

        } catch (error) {
            console.error('\\n❌ Profile test suite failed:', error.message);
            console.log('='.repeat(50));
        }
    }

    async testProfileValidation() {
        console.log('\\n🧪 Testing Profile Validation...');
        
        const invalidUserId = 'invalid-uuid';
        const validUserId = 'c47d6c8c-4d8b-4f9b-9c2a-1234567890ab';

        // Test invalid user ID
        await this.testGetProfile(invalidUserId);

        // Test invalid profile data
        const invalidData = {
            displayName: 'A', // Too short
            bio: 'x'.repeat(600), // Too long
            phone_number: 'invalid-phone',
            birthdate: '2030-01-01' // Future date
        };

        await this.makeRequest(`/profile/${validUserId}`, 'PUT', invalidData);
    }
}

// Usage instructions
console.log('📋 Profile API Test Instructions:');
console.log('1. Make sure your server is running (npm start)');
console.log('2. Create a test user first (via registration)');
console.log('3. Update the testUserId in the script with a real user ID');
console.log('4. Run the tests');
console.log('');

if (process.argv.includes('--run-tests')) {
    const testClient = new ProfileTestClient();
    testClient.runProfileTests();
} else if (process.argv.includes('--validation-tests')) {
    const testClient = new ProfileTestClient();
    testClient.testProfileValidation();
} else {
    console.log('💡 To run tests:');
    console.log('node test-profile.js --run-tests');
    console.log('node test-profile.js --validation-tests');
    console.log('');
    console.log('💡 For protected endpoints, set:');
    console.log('set AUTH_TOKEN=YOUR_JWT_HERE');
}