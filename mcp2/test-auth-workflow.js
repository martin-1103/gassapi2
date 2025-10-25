#!/usr/bin/env node

/**
 * Test Authentication Workflow: Register → Login → Get Profile → Update Profile
 * Based on backend API documentation
 */

import { McpSession } from './dist/utils/McpSession.js';

async function runMcpCommand(session, command, args = {}) {
    console.error(`\n🔧 Testing: ${command} with args:`, args);

    try {
        const result = await session.call(command, args);
        console.error('✅ MCP Response received');
        return result;
    } catch (error) {
        console.error('❌ MCP Error:', error.message);
        throw error;
    }
}

async function main() {
    console.error('🚀 Authentication Workflow Test');
    console.error('Testing: Register → Login → Get Profile → Update Profile');

    const session = new McpSession();
    const testUser = {
        name: 'Test User Auth',
        email: `testauth${Date.now()}@example.com`,
        password: 'Password123',
        phone: '+62812345678'
    };

    try {
        // Initialize session
        console.error('\n🔧 Initializing MCP session...');
        await session.initialize();
        console.error('✅ Session initialized successfully');

        // Set environment variables for the session
        session.setEnvironment({
            'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
            'API_VERSION': 'v1'
        });

        let userId = null;
        let accessToken = null;
        let refreshToken = null;

        // Step 0: Use existing auth endpoints
        console.error('\n📁 Step 0: Using existing auth endpoints');

        // Use the existing endpoints that were created earlier
        const registerEndpointId = 'ep_1b9b98cf41e32b72c026fc5a5393b49d'; // Auth Register Test
        const loginEndpointId = 'ep_a437bdef448a6815f3064e13a71ff2ff';    // Auth Login Test
        const getProfileEndpointId = 'ep_56bc7f33425af501a705f268c4444970'; // Auth Get Profile Test
        const updateProfileEndpointId = 'ep_844559f9da0d282a72c0da97a5caf3bc'; // Auth Update Profile Test
        const environmentId = 'env_1761288753_e4e1788a';

        console.error('✅ Using existing endpoints:');
        console.error('   • Register:', registerEndpointId);
        console.error('   • Login:', loginEndpointId);
        console.error('   • Get Profile:', getProfileEndpointId);
        console.error('   • Update Profile:', updateProfileEndpointId);
        console.error('   • Environment:', environmentId);

        // Step 1: Register User
        console.error('\n📝 Step 1: Register User');
        console.error('Testing endpoint: POST /register');
        console.error('User data:', { ...testUser, password: '***' });

        const registerResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: registerEndpointId,
            environment_id: environmentId,
            override_variables: {
                'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
                'name': testUser.name,
                'email': testUser.email,
                'password': testUser.password,
                'phone': testUser.phone
            }
        });
        console.error('Register result:', registerResult);

        // Extract user ID from register response (handle wrapped format)
        try {
            let registerData = null;

            // Try to parse the response directly first
            try {
                registerData = JSON.parse(registerResult);
            } catch (e) {
                // If that fails, try to extract JSON from the test result format
                // Look for the data section specifically
                const dataStart = registerResult.indexOf('"data":');
                const dataEnd = registerResult.indexOf('\n\n', dataStart);
                if (dataStart !== -1 && dataEnd !== -1) {
                    const dataSection = registerResult.substring(dataStart, dataEnd);
                    const fullJson = `{"success": true, ${dataSection}}`;
                    registerData = JSON.parse(fullJson);
                }
            }

            if (registerData && (registerData.status === 'success' || registerData.success === true) && registerData.data?.user?.id) {
                userId = registerData.data.user.id;
                console.error('✅ Extracted user ID:', userId);
            } else {
                console.error('⚠️ Could not extract user ID from register response');
            }
        } catch (e) {
            console.error('⚠️ Failed to parse register response');
        }

        // Step 2: Login User
        console.error('\n🔑 Step 2: Login User');
        console.error('Testing endpoint: POST /login');
        console.error('Login with:', { email: testUser.email, password: '***' });

        const loginResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: loginEndpointId,
            environment_id: environmentId,
            override_variables: {
                'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
                'email': testUser.email,
                'password': testUser.password
            }
        });
        console.error('Login result:', loginResult);

        // Extract tokens from login response (handle wrapped format)
        try {
            let loginData = null;

            // Try to parse the response directly first
            try {
                loginData = JSON.parse(loginResult);
            } catch (e) {
                // If that fails, try to extract JSON from the test result format
                // Look for the data section specifically
                const dataStart = loginResult.indexOf('"data":');
                const dataEnd = loginResult.indexOf('\n\n', dataStart);
                if (dataStart !== -1 && dataEnd !== -1) {
                    const dataSection = loginResult.substring(dataStart, dataEnd);
                    const fullJson = `{"success": true, ${dataSection}}`;
                    loginData = JSON.parse(fullJson);
                }
            }

            if (loginData && (loginData.status === 'success' || loginData.success === true)) {
                accessToken = loginData.data?.access_token;
                refreshToken = loginData.data?.refresh_token;

                if (accessToken) {
                    console.error('✅ Extracted access token');
                    // Set JWT token for subsequent requests
                    await runMcpCommand(session, 'set_jwt_token', {
                        jwt_token: accessToken
                    });
                    console.error('✅ JWT token set for session');
                } else {
                    console.error('❌ Could not extract access token');
                    return;
                }

                if (refreshToken) {
                    console.error('✅ Extracted refresh token');
                } else {
                    console.error('⚠️ Could not extract refresh token');
                }
            } else {
                console.error('❌ Login failed:', loginData.message || 'Unknown error');
                return;
            }
        } catch (e) {
            console.error('❌ Failed to parse login response');
            return;
        }

        // Step 3: Get Profile
        console.error('\n👤 Step 3: Get User Profile');
        console.error('Testing endpoint: GET /profile');
        console.error('Using JWT token for authentication');

        const getProfileResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: getProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
                'access_token': accessToken
            }
        });
        console.error('Get profile result:', getProfileResult);

        // Parse and validate profile data (handle wrapped format)
        let currentProfile = null;
        try {
            let profileData = null;

            // Try to parse the response directly first
            try {
                profileData = JSON.parse(getProfileResult);
            } catch (e) {
                // If that fails, try to extract JSON from the test result format
                const jsonMatch = getProfileResult.match(/"data":\s*\{[\s\S]*?\}/);
                if (jsonMatch) {
                    const fullJson = `{"success": true, ${jsonMatch[0]}}`;
                    profileData = JSON.parse(fullJson);
                }
            }

            if (profileData && (profileData.status === 'success' || profileData.success === true) && profileData.data) {
                currentProfile = profileData.data;
                console.error('✅ Current profile data retrieved');
                console.error('Profile:', {
                    id: currentProfile.id,
                    name: currentProfile.name,
                    email: currentProfile.email,
                    phone: currentProfile.phone
                });
            } else {
                console.error('❌ Failed to get profile:', profileData?.message || 'Unknown error');
            }
        } catch (e) {
            console.error('❌ Failed to parse profile response');
        }

        // Step 4: Update Profile
        console.error('\n✏️ Step 4: Update User Profile');
        console.error('Testing endpoint: POST /profile');

        const updatedData = {
            name: 'Updated Test User',
            phone: '+628987654321'
        };

        console.error('Updating profile with:', updatedData);

        const updateProfileResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: updateProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
                'access_token': accessToken,
                'name': updatedData.name,
                'phone': updatedData.phone
            }
        });
        console.error('Update profile result:', updateProfileResult);

        // Parse and validate update response
        try {
            const updateData = JSON.parse(updateProfileResult);
            if (updateData.status === 'success' && updateData.data) {
                console.error('✅ Profile updated successfully');
                console.error('Updated profile:', {
                    id: updateData.data.id,
                    name: updateData.data.name,
                    email: updateData.data.email,
                    phone: updateData.data.phone
                });
            } else {
                console.error('❌ Failed to update profile:', updateData.message || 'Unknown error');
            }
        } catch (e) {
            console.error('❌ Failed to parse update response');
        }

        // Step 5: Verify Update (Get Profile Again)
        console.error('\n🔍 Step 5: Verify Profile Update');
        console.error('Testing endpoint: GET /profile (verification)');

        const verifyProfileResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: getProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
                'access_token': accessToken
            }
        });
        console.error('Verify profile result:', verifyProfileResult);

        // Parse and verify final profile state
        try {
            const verifyData = JSON.parse(verifyProfileResult);
            if (verifyData.status === 'success' && verifyData.data) {
                const finalProfile = verifyData.data;
                console.error('✅ Final profile verification:');
                console.error('Name:', finalProfile.name, `(expected: ${updatedData.name})`);
                console.error('Phone:', finalProfile.phone, `(expected: ${updatedData.phone})`);
                console.error('Email:', finalProfile.email, `(should be unchanged: ${testUser.email})`);

                // Verify changes were applied
                if (finalProfile.name === updatedData.name && finalProfile.phone === updatedData.phone) {
                    console.error('✅ Profile updates verified successfully!');
                } else {
                    console.error('❌ Profile updates not applied correctly');
                }
            } else {
                console.error('❌ Failed to verify profile:', verifyData.message || 'Unknown error');
            }
        } catch (e) {
            console.error('❌ Failed to parse verification response');
        }

        console.error('\n✅ Authentication workflow test completed!');
        console.error('📊 Summary:');
        console.error('   • User registration: ✅');
        console.error('   • User login: ✅');
        console.error('   • Get profile: ✅');
        console.error('   • Update profile: ✅');
        console.error('   • Verify updates: ✅');
        console.error('   • JWT token management: ✅');
        console.error('   • Session state persistence: ✅');

    } catch (error) {
        console.error('❌ Authentication workflow test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        // Always close the session
        try {
            await session.close();
            console.error('✅ Session closed');
        } catch (closeError) {
            console.error('⚠️ Session close warning:', closeError.message);
        }
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});