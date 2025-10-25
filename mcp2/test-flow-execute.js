#!/usr/bin/env node

/**
 * Test Flow Execution with Enhanced Diagnostics
 */

import { McpSession } from './dist/utils/McpSession.js';

async function main() {
    console.error('🚀 Flow Execution Test with Enhanced Diagnostics');

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

        // Test flow execution with existing flow
        console.error('\n🔄 Testing flow execution with enhanced diagnostics');

        const executeResult = await session.call('execute_flow', {
            flow_id: 'flow_478342802b295a4de72e345d3867e35c', // Simple Test Flow
            environment_id: 'env_1761288753_e4e1788a',
            debug_mode: true
        });

        console.error('Flow execution result:');
        console.error(executeResult);

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