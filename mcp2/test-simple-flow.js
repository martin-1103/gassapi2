#!/usr/bin/env node

/**
 * Simple Flow Test - Debug flow creation issues
 */

import { McpSession } from './dist/utils/McpSession.js';

async function main() {
    console.error('🚀 Simple Flow Test');

    const session = new McpSession();

    try {
        // Initialize session
        console.error('\n🔧 Initializing MCP session...');
        await session.initialize();
        console.error('✅ Session initialized successfully');

        // Login first
        console.error('\n🔑 Login to get access token');
        const loginResult = await session.call('test_endpoint', {
            endpoint_id: 'ep_bccaf9721d41924f47e43e771317d873',
            environment_id: 'env_1761288753_e4e1788a'
        });

        // Extract token
        let accessToken = null;
        try {
            const tokenMatch = loginResult.match(/"access_token":\s*"([^"]+)"/);
            if (tokenMatch) {
                accessToken = tokenMatch[1];
                console.error('✅ Extracted access token');
            }
        } catch (e) {
            console.error('❌ Could not extract access token');
            return;
        }

        // Set JWT token
        console.error('\n🔐 Setting JWT token');
        await session.call('set_jwt_token', {
            jwt_token: accessToken
        });
        console.error('✅ JWT token set');

        // Test simple flow creation
        console.error('\n➕ Testing simple flow creation');

        const simpleFlowData = {
            version: "1.0",
            steps: [
                {
                    id: 'test_step',
                    name: 'Test Step',
                    method: 'GET',
                    url: 'https://jsonplaceholder.typicode.com/posts/1',
                    headers: {},
                    outputs: {
                        'test_output': 'response.body'
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

        const simpleFlowInputs = [
            {
                name: 'test_input',
                type: 'string',
                required: false,
                description: 'Test input'
            }
        ];

        const createResult = await session.call('create_flow', {
            project_id: 'proj_1761288753_1587448b',
            name: 'Simple Test Flow',
            description: 'Simple flow for debugging',
            flow_inputs: simpleFlowInputs,
            flow_data: simpleFlowData,
            is_active: true
        });

        console.error('Create flow result:', createResult);

        // Test listing flows to see if flow was created
        console.error('\n📋 Listing flows');
        const listResult = await session.call('list_flows', {
            project_id: 'proj_1761288753_1587448b'
        });
        console.error('List flows result:', listResult);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await session.close();
        console.error('✅ Session closed');
    }
}

main().catch((error) => {
    console.error('💥 Fatal error:', error);
});