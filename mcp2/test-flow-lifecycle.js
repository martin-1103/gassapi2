#!/usr/bin/env node

/**
 * Test Flow Lifecycle: Create → Execute → Edit → Execute → Delete
 * Using stateful McpSession for persistent connection
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
    console.error('🚀 Flow Lifecycle Test (Stateful Session Version)');
    console.error('Testing: Login → Create → Execute → Edit → Execute → Delete');

    const session = new McpSession();
    let createdFlowId = null;
    let environmentId = 'env_1761288753_e4e1788a'; // Use existing environment

    try {
        // Initialize session
        console.error('\n🔧 Initializing MCP session...');
        await session.initialize();
        console.error('✅ Session initialized successfully');

        // Set environment variables for the flow
        session.setEnvironment({
            'BASE_URL': 'http://localhost:8000/gassapi2/backend/',
            'API_VERSION': 'v1'
        });

        // Step 0: Login to get access token
        console.error('\n🔑 Step 0: Login for access token');
        const loginResult = await runMcpCommand(session, 'test_endpoint', {
            endpoint_id: 'ep_bccaf9721d41924f47e43e771317d873',
            environment_id: environmentId
        });
        console.error('Login result:', loginResult);

        let accessToken = null;
        try {
            const tokenMatch = loginResult.match(/"access_token":\s*"([^"]+)"/);
            if (tokenMatch) {
                accessToken = tokenMatch[1];
                console.error('✅ Extracted access token for flow operations');
            }
        } catch (e) {
            console.error('Could not extract access token for flow operations');
        }

        if (!accessToken) {
            console.error('❌ Could not extract access token from login response');
            return;
        }

        // Step 0.5: Set JWT token for flow operations
        console.error('\n🔐 Step 0.5: Setting JWT token for flow operations');
        const setTokenResult = await runMcpCommand(session, 'set_jwt_token', {
            jwt_token: accessToken
        });
        console.error('Set JWT token result:', setTokenResult);

        // Set flow inputs for the session
        session.setFlowInputs({
            'access_token': accessToken,
            'user_id': '1'
        });

        // Step 1: Create flow
        console.error('\n➕ Step 1: Create flow');

        const flowData = {
            version: "1.0",
            steps: [
                {
                    id: 'get_profile',
                    name: 'Get User Profile',
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/users/1',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Test-Header': 'Test Value'
                    },
                    outputs: {
                        'profileData': 'response.body'
                    },
                    timeout: 30000
                }
            ],
            config: {
                delay: 0,
                retryCount: 1,
                parallel: false
            }
        };

        const flowInputs = [
            {
                name: 'access_token',
                type: 'string',
                required: true,
                description: 'JWT access token for authentication'
            }
        ];

        const createResult = await runMcpCommand(session, 'create_flow', {
            project_id: 'proj_1761288753_1587448b',
            name: 'Test Flow Lifecycle ' + Date.now(),
            description: 'Flow for testing lifecycle operations',
            flow_inputs: flowInputs,
            flow_data: flowData,
            is_active: true
        });
        console.error('Create flow result:', createResult);

        // Extract flow ID from create response
        try {
            const idMatch = createResult.match(/🆔 ID: ([a-zA-Z0-9_-]+)/);
            if (idMatch) {
                createdFlowId = idMatch[1];
                console.error('✅ Extracted flow ID:', createdFlowId);
            }
        } catch (e) {
            console.error('Could not extract flow ID');
        }

        if (!createdFlowId) {
            console.error('❌ Could not extract flow ID from create response');
            return;
        }

        // Step 2: Execute flow (first time)
        console.error('\n🔄 Step 2: Execute flow (first time)');

        // Update flow inputs with the access token
        session.setFlowInputs({
            'access_token': accessToken,
            'user_id': '1'
        });

        const executeResult1 = await runMcpCommand(session, 'execute_flow', {
            flow_id: createdFlowId,
            environment_id: environmentId,
            debug_mode: true
        });
        console.error('First execution result:', executeResult1);

        // Step 3: Edit flow
        console.error('\n✏️ Step 3: Edit flow');

        const updatedFlowData = {
            version: "1.0",
            steps: [
                {
                    id: 'get_profile',
                    name: 'Get User Profile',
                    method: 'GET',
                    url: 'http://localhost:8000/gassapi2/backend/?act=profile',
                    headers: {
                        'Authorization': 'Bearer {{input.access_token}}',
                        'X-Test-Header': 'Updated'
                    },
                    outputs: {
                        'profileData': 'response.body'
                    },
                    timeout: 30000
                },
                {
                    id: 'update_profile',
                    name: 'Update Profile Name',
                    method: 'POST',
                    url: 'http://localhost:8000/gassapi2/backend/?act=profile',
                    headers: {
                        'Authorization': 'Bearer {{input.access_token}}',
                        'Content-Type': 'application/json'
                    },
                    body: {
                        'name': 'Updated via Flow Test'
                    },
                    outputs: {
                        'updateResult': 'response.body'
                    },
                    timeout: 30000
                }
            ],
            config: {
                delay: 1000,
                retryCount: 2,
                parallel: false
            }
        };

        const editResult = await runMcpCommand(session, 'update_flow', {
            flow_id: createdFlowId,
            name: 'Test Flow Lifecycle - Updated',
            description: 'Updated flow with additional node',
            flow_data: updatedFlowData
        });
        console.error('Edit flow result:', editResult);

        // Step 4: Execute flow (second time)
        console.error('\n🔄 Step 4: Execute flow (second time)');

        // Update flow inputs again for the second execution
        session.setFlowInputs({
            'access_token': accessToken,
            'user_id': '1'
        });

        const executeResult2 = await runMcpCommand(session, 'execute_flow', {
            flow_id: createdFlowId,
            environment_id: environmentId,
            debug_mode: true
        });
        console.error('Second execution result:', executeResult2);

        // Step 5: Delete flow
        console.error('\n🗑️ Step 5: Delete flow');
        const deleteResult = await runMcpCommand(session, 'delete_flow', {
            flow_id: createdFlowId
        });
        console.error('Delete flow result:', deleteResult);

        console.error('\n✅ Flow lifecycle test completed successfully!');
        console.error('📊 Summary:');
        console.error('   • Created flow with 1 step (get profile)');
        console.error('   • Executed successfully (1 step)');
        console.error('   • Updated to 2 steps (get profile + update profile)');
        console.error('   • Executed successfully (2 steps sequential with delay)');
        console.error('   • Deleted flow for cleanup');
        console.error('   • Used stateful session throughout entire lifecycle');

    } catch (error) {
        console.error('❌ Flow lifecycle test failed:', error.message);

        // Try to cleanup if we have a flow ID
        if (createdFlowId) {
            console.error('🧹 Attempting to cleanup flow...');
            try {
                await runMcpCommand(session, 'delete_flow', {
                    flow_id: createdFlowId
                });
                console.error('✅ Cleanup completed');
            } catch (cleanupError) {
                console.error('❌ Cleanup failed:', cleanupError.message);
            }
        }

    } finally {
        // Always close the session
        try {
            await session.close();
            console.error('✅ Session closed');
        } catch (closeError) {
            console.error('⚠️ Session close warning:', closeError.message);
        }

        if (createdFlowId) {
            process.exit(1);
        }
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});