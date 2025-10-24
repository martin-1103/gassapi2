#!/usr/bin/env node

/**
 * Test Authentication Workflow: Login → Get Profile → Edit Profile → Get Profile
 */

import { spawn } from 'child_process';
import path from 'path';

function runMcpCommand(command, args = {}) {
    return new Promise((resolve, reject) => {
        console.error(`\n🔧 Testing: ${command} with args:`, args);

        const serverProcess = spawn('node', ['dist/index.js'], {
            cwd: path.resolve('.'),
            stdio: ['pipe', 'pipe', 'pipe'],
            shell: true
        });

        let stdout = '';
        let stderr = '';
        let resolved = false;

        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                serverProcess.kill('SIGKILL');
                reject(new Error('Test timeout after 20 seconds'));
            }
        }, 20000);

        serverProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        serverProcess.stderr.on('data', (data) => {
            stderr += data.toString();
            console.error('[SERVER LOG]', data.toString().trim());
        });

        serverProcess.on('close', (code) => {
            clearTimeout(timeout);
            if (!resolved) {
                resolved = true;

                try {
                    const lines = stdout.trim().split('\n');
                    const lastLine = lines[lines.length - 1];

                    if (lastLine) {
                        const response = JSON.parse(lastLine);

                        if (response.error) {
                            console.error('❌ MCP Error:', response.error);
                            reject(new Error(response.error.message || 'Unknown MCP error'));
                        } else if (response.result && response.result.content) {
                            console.error('✅ MCP Response received');
                            resolve(response.result.content[0]?.text || 'No content');
                        } else {
                            console.error('⚠️ Unexpected MCP response:', response);
                            resolve('Unexpected response format');
                        }
                    } else {
                        console.error('❌ No response from MCP server');
                        reject(new Error('No response from MCP server'));
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse MCP response:', parseError);
                    console.error('Raw stdout:', stdout);
                    reject(parseError);
                }
            }
        });

        serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            if (!resolved) {
                resolved = true;
                console.error('❌ Server process error:', error);
                reject(error);
            }
        });

        // Initialize first
        const initRequest = {
            jsonrpc: "2.0",
            id: 1,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "test-client",
                    version: "1.0.0"
                }
            }
        };

        try {
            serverProcess.stdin.write(JSON.stringify(initRequest) + '\n');

            // Wait for initialization and tool loading
            setTimeout(() => {
                const toolRequest = {
                    jsonrpc: "2.0",
                    id: 2,
                    method: "tools/call",
                    params: {
                        name: command,
                        arguments: args
                    }
                };

                serverProcess.stdin.write(JSON.stringify(toolRequest) + '\n');
                serverProcess.stdin.end();
            }, 3000);
        } catch (writeError) {
            clearTimeout(timeout);
            if (!resolved) {
                resolved = true;
                console.error('❌ Failed to write to MCP server:', writeError);
                reject(writeError);
            }
        }
    });
}

async function main() {
    console.error('🚀 Authentication Workflow Test');
    console.error('Testing: Login → Get Profile → Edit Profile → Get Profile');

    try {
        // Step 1: Get collections to find a valid collection
        console.error('\n📁 Step 1: Get collections');
        const collectionsResult = await runMcpCommand('get_collections', {
            project_id: 'proj_1761288753_1587448b'
        });
        console.error('Collections:', collectionsResult);

        // Extract collection ID
        let collectionId = null;
        try {
            const collectionsMatch = collectionsResult.match(/\(col_([a-f0-9_-]+)\)/);
            if (collectionsMatch) {
                collectionId = 'col_' + collectionsMatch[1];
                console.error('✅ Using collection ID:', collectionId);
            }
        } catch (e) {
            console.error('Could not extract collection ID');
            return;
        }

        // Step 2: Create login endpoint
        console.error('\n➕ Step 2: Create login endpoint');
        const loginEndpointData = {
            collection_id: collectionId,
            name: 'Login Endpoint',
            method: 'POST',
            url: 'http://localhost:8000/gassapi2/backend/?act=login',
            headers: '{"Content-Type": "application/json"}',
            body: '{"email": "pile110385@gmail.com", "password": "123456Aa"}',
            description: 'Login with test credentials'
        };

        const loginCreateResult = await runMcpCommand('create_endpoint', loginEndpointData);
        console.error('Login endpoint created:', loginCreateResult);

        // Extract login endpoint ID
        let loginEndpointId = null;
        try {
            const loginMatch = loginCreateResult.match(/ID: (ep_[a-f0-9_-]+)/);
            if (loginMatch) {
                loginEndpointId = loginMatch[1];
                console.error('✅ Login endpoint ID:', loginEndpointId);
            }
        } catch (e) {
            console.error('Could not extract login endpoint ID');
            return;
        }

        // Step 3: Create get profile endpoint
        console.error('\n➕ Step 3: Create get profile endpoint');
        const getProfileEndpointData = {
            collection_id: collectionId,
            name: 'Get Profile Endpoint',
            method: 'GET',
            url: 'http://localhost:8000/gassapi2/backend/?act=profile',
            headers: '{"Authorization": "Bearer {{access_token}}"}',
            body: null,
            description: 'Get user profile'
        };

        const getProfileCreateResult = await runMcpCommand('create_endpoint', getProfileEndpointData);
        console.error('Get profile endpoint created:', getProfileCreateResult);

        // Extract get profile endpoint ID
        let getProfileEndpointId = null;
        try {
            const getProfileMatch = getProfileCreateResult.match(/ID: (ep_[a-f0-9_-]+)/);
            if (getProfileMatch) {
                getProfileEndpointId = getProfileMatch[1];
                console.error('✅ Get profile endpoint ID:', getProfileEndpointId);
            }
        } catch (e) {
            console.error('Could not extract get profile endpoint ID');
            return;
        }

        // Step 4: Create update profile endpoint
        console.error('\n➕ Step 4: Create update profile endpoint');
        const updateProfileEndpointData = {
            collection_id: collectionId,
            name: 'Update Profile Endpoint',
            method: 'POST',
            url: 'http://localhost:8000/gassapi2/backend/?act=profile',
            headers: '{"Content-Type": "application/json", "Authorization": "Bearer {{access_token}}"}',
            body: '{"name": "Updated Name", "email": "pile110385@gmail.com"}',
            description: 'Update user profile'
        };

        const updateProfileCreateResult = await runMcpCommand('create_endpoint', updateProfileEndpointData);
        console.error('Update profile endpoint created:', updateProfileCreateResult);

        // Extract update profile endpoint ID
        let updateProfileEndpointId = null;
        try {
            const updateProfileMatch = updateProfileCreateResult.match(/ID: (ep_[a-f0-9_-]+)/);
            if (updateProfileMatch) {
                updateProfileEndpointId = updateProfileMatch[1];
                console.error('✅ Update profile endpoint ID:', updateProfileEndpointId);
            }
        } catch (e) {
            console.error('Could not extract update profile endpoint ID');
            return;
        }

        // Step 5: Get environment ID
        console.error('\n🌍 Step 5: Get environment');
        const envResult = await runMcpCommand('list_environments', {
            project_id: 'proj_1761288753_1587448b'
        });
        console.error('Environments:', envResult);

        let environmentId = null;
        try {
            const envMatch = envResult.match(/\(env_([a-f0-9_-]+)\)/);
            if (envMatch) {
                environmentId = 'env_' + envMatch[1];
                console.error('✅ Environment ID:', environmentId);
            }
        } catch (e) {
            console.error('Could not extract environment ID');
            return;
        }

        // Step 6: Execute login test
        console.error('\n🔑 Step 6: Test login');
        const loginTestResult = await runMcpCommand('test_endpoint', {
            endpoint_id: loginEndpointId,
            environment_id: environmentId
        });
        console.error('Login test result:', loginTestResult);

        // Extract access token from login response
        let accessToken = null;
        try {
            // Look for access_token in the response
            const tokenMatch = loginTestResult.match(/"access_token":\s*"([^"]+)"/);
            if (tokenMatch) {
                accessToken = tokenMatch[1];
                console.error('✅ Extracted access token:', accessToken.substring(0, 20) + '...');
            }
        } catch (e) {
            console.error('Could not extract access token');
        }

        if (!accessToken) {
            console.error('❌ Could not extract access token from login response');
            return;
        }

        // Step 7: Test get profile (before update)
        console.error('\n👤 Step 7: Test get profile (before update)');
        const getProfileTestResult = await runMcpCommand('test_endpoint', {
            endpoint_id: getProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                "access_token": accessToken
            }
        });
        console.error('Get profile test result (before):', getProfileTestResult);

        // Step 8: Test update profile
        console.error('\n✏️ Step 8: Test update profile');
        const updateProfileTestResult = await runMcpCommand('test_endpoint', {
            endpoint_id: updateProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                "access_token": accessToken
            }
        });
        console.error('Update profile test result:', updateProfileTestResult);

        // Step 9: Test get profile (after update)
        console.error('\n👤 Step 9: Test get profile (after update)');
        const getProfileAfterTestResult = await runMcpCommand('test_endpoint', {
            endpoint_id: getProfileEndpointId,
            environment_id: environmentId,
            override_variables: {
                "access_token": accessToken
            }
        });
        console.error('Get profile test result (after):', getProfileAfterTestResult);

        console.error('\n✅ Authentication workflow test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});