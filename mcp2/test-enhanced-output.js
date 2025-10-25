#!/usr/bin/env node

/**
 * Test Enhanced Flow Execution Output
 * Test both normal and debug mode outputs
 */

import { McpSession } from './dist/utils/McpSession.js';

async function main() {
    console.error('🚀 Testing Enhanced Flow Execution Output');

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

        // Test 1: Normal Mode (clean output)
        console.error('\n=== TEST 1: NORMAL MODE (Clean Output) ===');
        const executeResult1 = await session.call('execute_flow', {
            flow_id: 'flow_478342802b295a4de72e345d3867e35c',
            environment_id: 'env_1761288753_e4e1788a',
            debug_mode: false // Normal mode
        });

        console.error('\n--- NORMAL MODE OUTPUT ---');
        console.error(executeResult1);

        // Test 2: Debug Mode (detailed output)
        console.error('\n\n=== TEST 2: DEBUG MODE (Detailed Output) ===');
        const executeResult2 = await session.call('execute_flow', {
            flow_id: 'flow_478342802b295a4de72e345d3867e35c',
            environment_id: 'env_1761288753_e4e1788a',
            debug_mode: true // Debug mode
        });

        console.error('\n--- DEBUG MODE OUTPUT ---');
        console.error(executeResult2);

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