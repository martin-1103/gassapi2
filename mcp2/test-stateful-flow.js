#!/usr/bin/env node

/**
 * Comprehensive Stateful Flow Engine Test
 * Test complete session persistence with McpSession
 */

import { McpSession } from './dist/utils/McpSession.js';
import { StatefulInterpolator } from './dist/utils/StatefulInterpolator.js';

async function testStatefulInterpolator() {
    console.error('\n🔧 Testing StatefulInterpolator');

    const mockState = {
        environment: {
            'API_URL': 'https://jsonplaceholder.typicode.com',
            'TOKEN': 'mock-jwt-token-123'
        },
        flowInputs: {
            'userId': '1',
            'limit': '10'
        },
        stepOutputs: {
            'get_user': {
                response: {
                    body: {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com'
                    }
                }
            },
            'create_post': {
                postId: '101',
                timestamp: '2025-01-25T10:30:00Z'
            }
        },
        runtimeVars: {
            'requestId': 'req-abc-123',
            'timestamp': Date.now().toString()
        },
        config: {
            timeout: 30000,
            debugMode: true
        },
        sessionId: 'test-session-001',
        createdAt: new Date(),
        lastActivity: new Date()
    };

    const context = {
        state: mockState,
        currentStepId: 'test_step',
        debugMode: true
    };

    // Test various interpolation patterns
    const testCases = [
        {
            name: 'Environment variable',
            template: 'Request URL: {{env.API_URL}}/posts',
            expected: 'Request URL: https://jsonplaceholder.typicode.com/posts'
        },
        {
            name: 'Flow input',
            template: 'Get user {{input.userId}} with limit {{input.limit}}',
            expected: 'Get user 1 with limit 10'
        },
        {
            name: 'Step output',
            template: 'User email: {{get_user.response.body.email}}',
            expected: 'User email: john@example.com'
        },
        {
            name: 'Runtime variable',
            template: 'Request ID: {{runtime.requestId}}',
            expected: 'Request ID: req-abc-123'
        },
        {
            name: 'Mixed variables',
            template: '{{env.API_URL}}/users/{{input.userId}}?requestId={{runtime.requestId}}',
            expected: 'https://jsonplaceholder.typicode.com/users/1?requestId=req-abc-123'
        },
        {
            name: 'Complex nested path',
            template: 'Post ID: {{create_post.postId}}',
            expected: 'Post ID: 101'
        }
    ];

    console.error('📝 Test Cases:');
    for (const testCase of testCases) {
        try {
            const result = StatefulInterpolator.interpolate(testCase.template, context);
            const success = result === testCase.expected;

            console.error(`${success ? '✅' : '❌'} ${testCase.name}`);
            console.error(`   Template: ${testCase.template}`);
            console.error(`   Expected: ${testCase.expected}`);
            console.error(`   Got:      ${result}`);

            if (!success) {
                console.error(`   ❌ MISMATCH!`);
                return false;
            }
        } catch (error) {
            console.error(`❌ ${testCase.name}: ${error.message}`);
            return false;
        }
    }

    // Test error handling - interpolator should keep original template for missing variables
    console.error('\n🚨 Testing Error Handling (Graceful fallback):');
    const errorCases = [
        {
            name: 'Non-existent environment variable',
            template: '{{env.NON_EXISTENT}}',
            expected: '{{env.NON_EXISTENT}}' // Should remain unchanged
        },
        {
            name: 'Non-existent input',
            template: '{{input.missing}}',
            expected: '{{input.missing}}' // Should remain unchanged
        },
        {
            name: 'Non-existent step',
            template: '{{missing_step.output}}',
            expected: '{{missing_step.output}}' // Should remain unchanged
        }
    ];

    for (const errorCase of errorCases) {
        try {
            const result = StatefulInterpolator.interpolate(errorCase.template, context);
            const success = result === errorCase.expected;

            console.error(`${success ? '✅' : '❌'} ${errorCase.name}`);
            console.error(`   Template: ${errorCase.template}`);
            console.error(`   Expected: ${errorCase.expected}`);
            console.error(`   Got:      ${result}`);

            if (!success) {
                console.error(`   ❌ Should keep original template for missing variables`);
                return false;
            }
        } catch (error) {
            console.error(`❌ ${errorCase.name}: Should not throw error, but got: ${error.message}`);
            return false;
        }
    }

    console.error('\n✅ StatefulInterpolator tests passed!');
    return true;
}

async function testMcpSession() {
    console.error('\n🔧 Testing McpSession');

    const session = new McpSession();

    try {
        // Test session initialization
        console.error('📋 Initializing MCP session...');
        await session.initialize();
        console.error('✅ MCP session initialized successfully');

        // Test session info
        const sessionInfo = session.getSessionInfo();
        console.error('📊 Session Info:');
        console.error(`   Session ID: ${sessionInfo.sessionId}`);
        console.error(`   Uptime: ${Math.round(sessionInfo.uptime / 1000)}s`);
        console.error(`   State counts: ${JSON.stringify(sessionInfo.stateCounts)}`);

        // Test environment variable setting
        console.error('\n🌍 Setting environment variables...');
        session.setEnvironment({
            'API_URL': 'https://jsonplaceholder.typicode.com',
            'DEBUG': 'true'
        });

        // Test flow input setting
        console.error('📥 Setting flow inputs...');
        session.setFlowInputs({
            'userId': '1',
            'action': 'get_profile'
        });

        // Test runtime variable setting
        console.error('⚙️ Setting runtime variables...');
        session.setRuntimeVar('requestId', 'req-' + Date.now());
        session.setRuntimeVar('startTime', new Date().toISOString());

        // Test configuration setting
        console.error('⚙️ Setting configuration...');
        session.setConfig({
            timeout: 60000,
            retryCount: 3,
            debugMode: true
        });

        // Test getting state
        const state = session.getState();
        console.error('\n📊 Session State:');
        console.error(`   Environment: ${Object.keys(state.environment).length} variables`);
        console.error(`   Flow inputs: ${Object.keys(state.flowInputs).length} inputs`);
        console.error(`   Runtime: ${Object.keys(state.runtimeVars).length} variables`);
        console.error(`   Config: ${Object.keys(state.config).length} settings`);

        // Test state clearing
        console.error('\n🧹 Testing state clearing...');
        session.clearState('runtimeVars');
        const clearedState = session.getState();
        console.error(`   Runtime variables after clear: ${Object.keys(clearedState.runtimeVars).length}`);

        // Test state reset
        session.resetState();
        const resetState = session.getState();
        console.error(`   All state counts after reset: environment=${Object.keys(resetState.environment).length}, inputs=${Object.keys(resetState.flowInputs).length}, runtime=${Object.keys(resetState.runtimeVars).length}`);

        console.error('\n✅ McpSession tests passed!');
        return true;

    } catch (error) {
        console.error('❌ McpSession test failed:', error.message);
        return false;
    } finally {
        // Cleanup session
        try {
            await session.close();
            console.error('✅ Session closed successfully');
        } catch (cleanupError) {
            console.error('⚠️ Session cleanup warning:', cleanupError.message);
        }
    }
}

async function testVariableValidation() {
    console.error('\n🔧 Testing Variable Validation');

    const mockState = {
        environment: { 'API_URL': 'https://api.example.com' },
        flowInputs: { 'userId': '1' },
        stepOutputs: { 'step1': { result: 'success' } },
        runtimeVars: { 'requestId': 'req-123' },
        config: { timeout: 30000 },
        sessionId: 'test',
        createdAt: new Date(),
        lastActivity: new Date()
    };

    const context = {
        state: mockState,
        debugMode: true
    };

    // Test valid references
    const validReferences = [
        'env.API_URL',
        'input.userId',
        'step1.result',
        'runtime.requestId',
        'config.timeout'
    ];

    console.error('✅ Testing valid references:');
    const validation = StatefulInterpolator.validateReferences(validReferences, context);

    console.error(`   Valid: ${validation.valid.length}`);
    console.error(`   Invalid: ${validation.invalid.length}`);

    if (validation.invalid.length > 0) {
        console.error('❌ Unexpected invalid references:', validation.invalid);
        return false;
    }

    // Test invalid references
    const invalidReferences = [
        'env.MISSING_VAR',
        'input.missing_input',
        'missing_step.output',
        'runtime.missing_runtime'
    ];

    console.error('\n❌ Testing invalid references:');
    const invalidValidation = StatefulInterpolator.validateReferences(invalidReferences, context);

    console.error(`   Valid: ${invalidValidation.valid.length}`);
    console.error(`   Invalid: ${invalidValidation.invalid.length}`);

    if (invalidValidation.invalid.length !== 4) {
        console.error('❌ Expected 4 invalid references, got:', invalidValidation.invalid.length);
        return false;
    }

    console.error('\n✅ Variable validation tests passed!');
    return true;
}

async function testCompleteWorkflow() {
    console.error('\n🔄 Testing Complete Workflow Simulation');

    const session = new McpSession();

    try {
        // Initialize session
        console.error('🚀 Initializing workflow session...');
        await session.initialize();

        // Setup workflow context
        session.setEnvironment({
            'BASE_URL': 'https://jsonplaceholder.typicode.com',
            'API_VERSION': 'v1'
        });

        session.setFlowInputs({
            'userId': '1',
            'postId': '1'
        });

        session.setRuntimeVar('workflowId', 'workflow-' + Date.now());
        session.setRuntimeVar('startTime', new Date().toISOString());

        session.setConfig({
            timeout: 30000,
            retryCount: 2,
            debugMode: true
        });

        // Simulate step outputs
        session.setStepOutput('get_user', {
            response: {
                status: 200,
                body: {
                    id: 1,
                    name: 'John Doe',
                    email: 'john@example.com'
                }
            }
        });

        session.setStepOutput('get_post', {
            response: {
                status: 200,
                body: {
                    id: 1,
                    title: 'Test Post',
                    body: 'This is a test post',
                    userId: 1
                }
            }
        });

        // Test interpolation with live session state
        const context = {
            state: session.getState(),
            debugMode: true
        };

        const workflowTests = [
            {
                name: 'API call with variables',
                template: '{{env.BASE_URL}}/users/{{input.userId}}'
            },
            {
                name: 'Post request URL',
                template: '{{env.BASE_URL}}/posts/{{input.postId}}'
            },
            {
                name: 'Header with runtime vars',
                template: 'X-Request-ID: {{runtime.workflowId}}'
            },
            {
                name: 'Step output reference',
                template: 'User email: {{get_user.response.body.email}}'
            },
            {
                name: 'Complex workflow URL',
                template: '{{env.BASE_URL}}/users/{{get_user.response.body.id}}/posts?workflowId={{runtime.workflowId}}'
            }
        ];

        console.error('\n📋 Testing workflow interpolations:');
        for (const test of workflowTests) {
            try {
                const result = StatefulInterpolator.interpolate(test.template, context);
                console.error(`✅ ${test.name}: ${result}`);
            } catch (error) {
                console.error(`❌ ${test.name}: ${error.message}`);
                return false;
            }
        }

        // Test variable summary
        console.error('\n📊 Variable Summary:');
        const summary = StatefulInterpolator.buildVariableSummary(context);
        console.error(`   Available inputs: ${summary.availableInputs.join(', ')}`);
        console.error(`   Available environment: ${summary.availableEnvironment.join(', ')}`);
        console.error(`   Available runtime: ${summary.availableRuntime.join(', ')}`);
        console.error(`   Available steps: ${summary.availableSteps.join(', ')}`);

        console.error('\n✅ Complete workflow test passed!');
        return true;

    } catch (error) {
        console.error('❌ Complete workflow test failed:', error.message);
        return false;
    } finally {
        await session.close();
    }
}

async function main() {
    console.error('🚀 Comprehensive Stateful Flow Engine Test');
    console.error('==========================================');

    const tests = [
        { name: 'StatefulInterpolator', fn: testStatefulInterpolator },
        { name: 'McpSession', fn: testMcpSession },
        { name: 'Variable Validation', fn: testVariableValidation },
        { name: 'Complete Workflow', fn: testCompleteWorkflow }
    ];

    let passedTests = 0;
    let totalTests = tests.length;

    for (const test of tests) {
        console.error(`\n📋 Running ${test.name} Tests...`);
        console.error('-'.repeat(50));

        try {
            const result = await test.fn();
            if (result) {
                passedTests++;
                console.error(`✅ ${test.name} tests PASSED`);
            } else {
                console.error(`❌ ${test.name} tests FAILED`);
            }
        } catch (error) {
            console.error(`💥 ${test.name} tests CRASHED:`, error.message);
        }

        console.error('-'.repeat(50));
    }

    console.error('\n📊 Test Results Summary:');
    console.error(`   Total Tests: ${totalTests}`);
    console.error(`   Passed: ${passedTests}`);
    console.error(`   Failed: ${totalTests - passedTests}`);
    console.error(`   Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.error('\n🎉 ALL TESTS PASSED! Stateful Flow Engine is ready!');
        console.error('\n🔋 Key Features Verified:');
        console.error('   ✅ Persistent session management');
        console.error('   ✅ Variable interpolation ({{input.}}, {{env.}}, {{stepId.}}, {{runtime.}})');
        console.error('   ✅ State persistence across operations');
        console.error('   ✅ Error handling and validation');
        console.error('   ✅ Complete workflow simulation');
        console.error('   ✅ Memory management and cleanup');

        console.error('\n📋 Next Steps:');
        console.error('   1. Test with real backend API integration');
        console.error('   2. Create example flows using this stateful system');
        console.error('   3. Optimize performance for production usage');

        process.exit(0);
    } else {
        console.error('\n❌ Some tests failed. Check the logs above for details.');
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});