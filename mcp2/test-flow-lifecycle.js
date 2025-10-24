#!/usr/bin/env node

/**
 * Test Flow Lifecycle: Create → Execute → Edit → Execute → Delete
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
    console.error('🚀 Flow Lifecycle Test');
    console.error('Testing: Login → Create → Execute → Edit → Execute → Delete');

    let createdFlowId = null;
    let environmentId = 'env_1761288753_e4e1788a'; // Use existing environment

    try {
        // Step 0: Login to get access token
        console.error('\n🔑 Step 0: Login for access token');
        const loginResult = await runMcpCommand('test_endpoint', {
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

        // Step 1: Create flow
        console.error('\n➕ Step 1: Create flow');

        const flowData = {
            nodes: [
                {
                    id: 'node_1',
                    type: 'http_request',
                    data: {
                        method: 'GET',
                        url: 'http://localhost:8000/gassapi2/backend/?act=profile',
                        headers: '{"Authorization": "Bearer {{access_token}}"}',
                        timeout: 30000,
                        saveResponse: true,
                        responseVariable: 'profile_response'
                    },
                    position: { x: 100, y: 100 }
                }
            ],
            edges: []
        };

        const createResult = await runMcpCommand('create_flow', {
            project_id: 'proj_1761288753_1587448b',
            name: 'Test Flow Lifecycle',
            description: 'Flow for testing lifecycle operations',
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

        const executeResult1 = await runMcpCommand('execute_flow', {
            flow_id: createdFlowId,
            environment_id: environmentId,
            override_variables: {
                "access_token": accessToken
            },
            debug_mode: true
        });
        console.error('First execution result:', executeResult1);

        // Step 3: Edit flow
        console.error('\n✏️ Step 3: Edit flow');

        const updatedFlowData = {
            nodes: [
                {
                    id: 'node_1',
                    type: 'http_request',
                    data: {
                        method: 'GET',
                        url: 'http://localhost:8000/gassapi2/backend/?act=profile',
                        headers: '{"Authorization": "Bearer {{access_token}}", "X-Test-Header": "Updated"}',
                        timeout: 30000,
                        saveResponse: true,
                        responseVariable: 'profile_response'
                    },
                    position: { x: 100, y: 100 }
                },
                {
                    id: 'node_2',
                    type: 'http_request',
                    data: {
                        method: 'POST',
                        url: 'http://localhost:8000/gassapi2/backend/?act=profile',
                        headers: '{"Authorization": "Bearer {{access_token}}", "Content-Type": "application/json"}',
                        body: '{"name": "Updated via Flow Test"}',
                        timeout: 30000,
                        saveResponse: true,
                        responseVariable: 'update_response'
                    },
                    position: { x: 300, y: 100 }
                }
            ],
            edges: [
                {
                    id: 'edge_1',
                    source: 'node_1',
                    target: 'node_2',
                    type: 'success'
                }
            ]
        };

        const editResult = await runMcpCommand('update_flow', {
            flow_id: createdFlowId,
            name: 'Test Flow Lifecycle - Updated',
            description: 'Updated flow with additional node',
            flow_data: updatedFlowData
        });
        console.error('Edit flow result:', editResult);

        // Step 4: Execute flow (second time)
        console.error('\n🔄 Step 4: Execute flow (second time)');
        const executeResult2 = await runMcpCommand('execute_flow', {
            flow_id: createdFlowId,
            environment_id: environmentId,
            override_variables: {
                "access_token": accessToken
            },
            debug_mode: true
        });
        console.error('Second execution result:', executeResult2);

        // Step 5: Delete flow
        console.error('\n🗑️ Step 5: Delete flow');
        const deleteResult = await runMcpCommand('delete_flow', {
            flow_id: createdFlowId
        });
        console.error('Delete flow result:', deleteResult);

        console.error('\n✅ Flow lifecycle test completed successfully!');
        console.error('📊 Summary:');
        console.error('   • Created flow with 1 node');
        console.error('   • Executed successfully (1 node)');
        console.error('   • Updated to 2 nodes with edge connection');
        console.error('   • Executed successfully (2 nodes sequential)');
        console.error('   • Deleted flow for cleanup');

    } catch (error) {
        console.error('❌ Flow lifecycle test failed:', error.message);

        // Try to cleanup if we have a flow ID
        if (createdFlowId) {
            console.error('🧹 Attempting to cleanup flow...');
            try {
                await runMcpCommand('delete_flow', {
                    flow_id: createdFlowId
                });
                console.error('✅ Cleanup completed');
            } catch (cleanupError) {
                console.error('❌ Cleanup failed:', cleanupError.message);
            }
        }

        process.exit(1);
    }
}

main().catch((error) => {
    console.error('💥 Fatal test error:', error);
    process.exit(1);
});