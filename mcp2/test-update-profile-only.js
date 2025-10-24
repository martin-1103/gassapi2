#!/usr/bin/env node

/**
 * Test Update Profile Only
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
                clientClientInfo: {
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
    console.error('🚀 Update Profile Only Test');

    try {
        // Use existing login endpoint from previous test
        const loginEndpointId = 'ep_bccaf9721d41924f47e43e771317d873';
        const environmentId = 'env_1761288753_e4e1788a';

        // Step 1: Test login to get access token
        console.error('\n🔑 Step 1: Test login');
        const loginTestResult = await runMcpCommand('test_endpoint', {
            endpoint_id: loginEndpointId,
            environment_id: environmentId
        });
        console.error('Login test result:', loginTestResult);

        // Extract access token from login response
        let accessToken = null;
        try {
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

        // Step 2: Try different update profile approaches
        console.error('\n✏️ Step 2: Test different update profile approaches');

        // Approach 1: Update only name
        console.error('\nApproach 1: Update only name field');
        const updateNameResponse = await fetch('http://localhost:8000/gassapi2/backend/?act=profile', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Pile Updated'
            })
        });

        const updateNameResult = await updateNameResponse.json();
        console.error('Update name response:', JSON.stringify(updateNameResult, null, 2));

        // Approach 2: Check PUT method
        console.error('\nApproach 2: Try PUT method');
        const putResponse = await fetch('http://localhost:8000/gassapi2/backend/?act=profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'Pile Updated Again'
            })
        });

        const putResult = await putResponse.json();
        console.error('PUT method response:', JSON.stringify(putResult, null, 2));

        // Step 3: Get final profile
        console.error('\n👤 Step 3: Get final profile');
        const finalProfileResponse = await fetch('http://localhost:8000/gassapi2/backend/?act=profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const finalProfileData = await finalProfileResponse.json();
        console.error('Final profile response:', JSON.stringify(finalProfileData, null, 2));

        console.error('\n✅ Update profile test completed!');

        // Check if update worked
        if (finalProfileData.success && finalProfileData.data.user) {
            const finalName = finalProfileData.data.user.name;
            console.error(`\n📊 Final profile name: ${finalName}`);

            if (finalName && finalName !== 'pile') {
                console.error('✅ Profile successfully updated!');
            } else {
                console.error('⚠️ Profile update may not have worked');
            }
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});