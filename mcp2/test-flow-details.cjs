#!/usr/bin/env node

/**
 * Test Flow Details & Execution
 * Test flow details retrieval dan execution
 */

const flowId = 'flow_5eba7d4ecc2133358006206ce6be8f37';

async function testFlowDetails() {
  console.log('🔍 Testing Flow Details...');

  try {
    const response = await fetch(`http://localhost:8080/gassapi2/backend/?act=flow&id=${flowId}`, {
      headers: {
        'Authorization': 'Bearer 2032781cbb63ea282749778091b2170a5a18d0491a519bad4ab488ab463e885d'
      }
    });

    const result = await response.json();
    console.log('✅ Flow Details Result:', JSON.stringify(result, null, 2));

    if (result.success && result.data) {
      const flow = result.data;
      console.log('\n📊 Flow Data Analysis:');
      console.log('- flow_data type:', typeof flow.flow_data);

      if (typeof flow.flow_data === 'string') {
        try {
          const parsedFlowData = JSON.parse(flow.flow_data);
          console.log('✅ Flow data successfully parsed');
          console.log('- Version:', parsedFlowData.version);
          console.log('- Steps count:', parsedFlowData.steps?.length || 0);
          console.log('- Config:', parsedFlowData.config);

          if (parsedFlowData.steps && parsedFlowData.steps.length > 0) {
            console.log('\n📋 Flow Steps:');
            parsedFlowData.steps.forEach((step, index) => {
              console.log(`  ${index + 1}. ${step.name} (${step.method} ${step.url})`);
            });
            console.log('\n- First step details:', JSON.stringify(parsedFlowData.steps[0], null, 2));
          }
        } catch (e) {
          console.error('❌ Flow data parsing failed:', e.message);
        }
      } else {
        console.log('- Flow data is object:', flow.flow_data);
        console.log('- Steps count:', flow.flow_data?.steps?.length || 0);
      }
    }

    return result;
  } catch (error) {
    console.error('❌ Flow details error:', error.message);
    return null;
  }
}

async function testMcpFlowExecution() {
  console.log('\n🚀 Testing MCP Flow Execution...');

  const { spawn } = require('child_process');

  return new Promise((resolve, reject) => {
    const mcpServer = spawn('npm', ['start'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let serverStarted = false;

    mcpServer.stdout.on('data', (data) => {
      const chunk = data.toString();
      output += chunk;
      console.log('MCP:', chunk.trim());

      // Check if server is ready
      if (chunk.includes('MCP server started') || chunk.includes('listening')) {
        serverStarted = true;
        // Send test request
        setTimeout(() => {
          const mcpRequest = {
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'execute_flow',
              arguments: {
                flowId,
                variables: 'username=testuser123,email=test@example.com,password=password123',
                dryRun: true
              }
            }
          };

          console.log('📤 Sending MCP Request:', JSON.stringify(mcpRequest, null, 2));
          mcpServer.stdin.write(JSON.stringify(mcpRequest) + '\n');
        }, 1000);
      }

      // Look for response
      if (chunk.includes('"result"') || chunk.includes('"error"')) {
        try {
          const lines = output.split('\n').filter(line => line.trim().startsWith('{'));
          const lastLine = lines[lines.length - 1];
          if (lastLine) {
            const response = JSON.parse(lastLine);
            mcpServer.kill();
            resolve(response);
          }
        } catch (e) {
          // Still parsing
        }
      }
    });

    mcpServer.stderr.on('data', (data) => {
      console.error('MCP Error:', data.toString().trim());
    });

    mcpServer.on('error', (error) => {
      console.error('❌ MCP server error:', error.message);
      reject(error);
    });

    mcpServer.on('close', (code) => {
      if (code !== 0 && !output) {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    // Timeout
    setTimeout(() => {
      mcpServer.kill();
      reject(new Error('MCP test timeout'));
    }, 20000);
  });
}

async function main() {
  console.log('🧪 Flow Details & Execution Test');
  console.log('===================================');

  try {
    // Test flow details
    const detailsResult = await testFlowDetails();

    if (detailsResult && detailsResult.success) {
      // Test MCP execution
      const executionResult = await testMcpFlowExecution();
      console.log('\n✅ Flow Execution Result:', JSON.stringify(executionResult, null, 2));
    } else {
      console.log('❌ Flow details failed, skipping execution test');
    }

    console.log('\n🎉 Test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

main();