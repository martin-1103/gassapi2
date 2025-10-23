import { McpTool } from '../types/mcp.types';
import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';

/**
 * Testing MCP Tools
 * Handles endpoint testing and execution operations
 */

const test_endpoint: McpTool = {
  name: 'test_endpoint',
  description: 'Execute single endpoint test with environment variables',
  inputSchema: {
    type: 'object',
    properties: {
      endpointId: {
        type: 'string',
        description: 'Endpoint UUID to test'
      },
      environmentId: {
        type: 'string',
        description: 'Environment UUID for test execution'
      },
      overrideVariables: {
        type: 'object',
        description: 'Override environment variables for this test',
        default: {}
      },
      saveResult: {
        type: 'boolean',
        description: 'Save test result in backend',
        default: true
      }
    },
    required: ['endpointId', 'environmentId']
  }
};

export class TestingTools {
  private configLoader: ConfigLoader;
  private backendClient: BackendClient | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
  }

  private async getBackendClient(): Promise<BackendClient> {
    if (this.backendClient) {
      return this.backendClient;
    }

    const config = await this.configLoader.detectProjectConfig();
    if (!config) {
      throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
    }

    this.backendClient = new BackendClient(
      this.configLoader.getServerURL(config),
      this.configLoader.getMcpToken(config)
    );

    return this.backendClient;
  }

  /**
   * Test single endpoint with environment variables
   */
  async testEndpoint(args: {
    endpointId: string;
    environmentId: string;
    overrideVariables?: Record<string, string>;
    saveResult?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        throw new Error('No GASSAPI configuration found');
      }

      const client = await this.getBackendClient();

      // Get endpoint details first
      const endpointDetails = await client.getEndpointDetails(args.endpointId);
      const environmentDetails = await client.getEnvironmentVariables(args.environmentId);

      // Prepare environment variables
      const envVars = { ...environmentDetails.variables };
      const variables = envVars;

      // Apply overrides
      if (args.overrideVariables) {
        Object.assign(variables, args.overrideVariables);
      }

      // Execute test
      const testResult = await client.testEndpoint(
        args.endpointId,
        args.environmentId,
        args.overrideVariables
      );

      // Format response
      const result = this.formatTestResult(testResult, endpointDetails, variables);

      return {
        content: [
          {
            type: 'text' as const,
            text: result
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown test error';

      return {
        content: [
          {
                type: 'text' as const,
                text: `❌ Endpoint Test Failed

Error: ${errorMessage}

Please check:
1. Endpoint ID is correct
2. Environment is accessible
3. Network connectivity
4. API server is running

Endpoint test failed!`
              }
            ],
        isError: true
      };
    }
  }

  /**
   * Format test result for display
   */
  private formatTestResult(testResult: any, endpointDetails: any, variables: Record<string, string>): string {
    const status = testResult.status >= 200 && testResult.status < 300 ? '🟢' : '🔴';
    const statusText = testResult.status >= 200 && testResult.status < 300 ? 'Success' : 'Failed';

    let result = `🧪 Endpoint Test Result

${status} Status: ${testResult.status} (${statusText})
⏱️  Response Time: ${testResult.response_time}ms
📊 Timestamp: ${new Date(testResult.created_at).toLocaleString()}

📍 Endpoint Details:
- Name: ${endpointDetails.name || 'N/A'}
- Method: ${endpointDetails.method || 'N/A'}
- URL: ${endpointDetails.url || 'N/A'}
- Collection: ${endpointDetails.collection?.name || 'N/A'}

🔧 Environment Variables Used (${Object.keys(variables).length}):
${Object.entries(variables).map(([key, value]) => `- ${key}: ${value}`).join('\n')}`;

    // Add response headers if available
    if (testResult.response_headers) {
      result += '\n\n📤 Response Headers:';
      Object.entries(testResult.response_headers).forEach(([key, value]) => {
        result += `\n- ${key}: ${value}`;
      });
    }

    // Add response body if available and not too large
    if (testResult.response_body) {
      const responseString = typeof testResult.response_body === 'string'
        ? testResult.response_body
        : JSON.stringify(testResult.response_body, null, 2);

      if (responseString.length < 1000) { // Limit display
        result += '\n\n📄 Response Body:';
        result += `\n\`\`\`\n${responseString}\n\`\`\``;
      } else {
        result += `\n\n📄 Response Body: ${responseString.length} characters (too large to display)`;
      }
    }

    // Add error information if failed
    if (testResult.error) {
      result += `\n\n❌ Error Details:\n${testResult.error}`;
    }

    result += '\n\n✅ Test completed! Ready for next operation.';
    return result;
  }

  /**
   * Quick test with auto-detection
   */
  async quickTest(args: { url?: string; method?: string }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `🧪 Quick Test

❌ Configuration Required
No gassapi.json found in project directory.

To run quick tests:
1. Create GASSAPI project
2. Generate MCP configuration
3. Save as gassapi.json in project root`
            }
          ],
          isError: true
        };
      }

      const client = await this.getBackendClient();
      const projectContext = await client.getProjectContext(config.project.id);

      if (!projectContext.collections || projectContext.collections.length === 0) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `🧪 Quick Test

❌ No Endpoints Available
Project: ${config.project.name}
Collections: 0

To test endpoints:
1. Create collections
2. Add endpoints to collections
3. Use test_endpoint tool with specific endpoint ID`
            }
          ],
          isError: true
        };
      }

      // Get first endpoint for quick test
      const firstCollection = projectContext.collections[0];
      if (firstCollection && firstCollection.endpoints && firstCollection.endpoints.length > 0) {
        const firstEndpoint = firstCollection.endpoints[0];
        const firstEnvironment = projectContext.environments.find((env: any) => env.is_default) || projectContext.environments[0];

        if (firstEnvironment) {
          const result = await this.testEndpoint({
            endpointId: firstEndpoint.id,
            environmentId: firstEnvironment.id,
            saveResult: true
          });

          return {
            content: [
              {
                type: 'text' as const,
                text: `🧪 Quick Test

🎯 Auto-selected Endpoint:
- Name: ${firstEndpoint.name}
- Method: ${firstEndpoint.method}
- URL: ${firstEndpoint.url}
- Environment: ${firstEnvironment.name}

${result.content[0].text}`
              }
            ]
          };
        }
      }

      return {
        content: [
          {
                type: 'text' as const,
                text: `🧪 Quick Test

❌ No Testable Endpoints
Project: ${config.project.name}
Collections: ${projectContext.collections.length}

No endpoints found for quick testing.

To enable testing:
1. Add endpoints to collections
2. Configure environment variables
3. Use specific test_endpoint tool`
              }
            ],
        isError: true
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
                type: 'text' as const,
                text: `❌ Quick Test Failed

Error: ${errorMessage}

Unable to perform quick test. Please check configuration.`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Test multiple endpoints
   */
  async batchTest(args: {
    endpointIds: string[];
    environmentId: string;
    parallel?: boolean;
    delay?: number;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        throw new Error('No GASSAPI configuration found');
      }

      const client = await this.getBackendClient();
      const results = [];
      const parallel = args.parallel !== false;
      const delay = args.delay || 100;

      if (parallel) {
        // Run tests in parallel
        const promises = args.endpointIds.map(async (endpointId, index) => {
          const result = await client.testEndpoint(endpointId, args.environmentId);
          return { endpointId, index, result };
        });

        const testResults = await Promise.all(promises);
        results.push(...testResults);
      } else {
        // Run tests sequentially
        for (let i = 0; i < args.endpointIds.length; i++) {
          const endpointId = args.endpointIds[i];
          const result = await client.testEndpoint(endpointId, args.environmentId);
          results.push({ endpointId, index: i, result });

          // Add delay between tests
          if (delay > 0 && i < args.endpointIds.length - 1) {
            await this.sleep(delay);
          }
        }
      }

      // Format results
      const successCount = results.filter(r => r.result.status >= 200 && r.result.status < 300).length;
      const failCount = results.length - successCount;
      const avgResponseTime = results.reduce((sum, r) => sum + r.result.response_time, 0) / results.length;

      let resultText = `🧪 Batch Test Results

📊 Summary:
- Total Tests: ${results.length}
- ✅ Successful: ${successCount}
- ❌ Failed: ${failCount}
- 📈 Average Response Time: ${avgResponseTime.toFixed(2)}ms
- 🔄 Execution Mode: ${parallel ? 'Parallel' : 'Sequential'}

📋 Detailed Results:`;

      results.forEach(({ endpointId, result, index }) => {
        const status = result.status >= 200 && result.status < 300 ? '🟢' : '🔴';
        resultText += `\n${index + 1}. ${endpointId}: ${status} ${result.status} (${result.response_time}ms)`;
      });

      resultText += `\n\n🎯 Batch test completed! ${successCount}/${results.length} tests passed.`;

      return {
        content: [
          {
            type: 'text' as const,
            text: resultText
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
                type: 'text' as const,
                text: `❌ Batch Test Failed

Error: ${errorMessage}

Please check:
1. All endpoint IDs are valid
2. Environment is accessible
3. Network connectivity is stable

Batch test failed!`
              }
            ],
        isError: true
      };
    }
  }

  /**
   * Helper function for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get testing tools list
   */
  getTools(): McpTool[] {
    return [test_endpoint];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
    switch (toolName) {
      case 'test_endpoint':
        return this.testEndpoint(args);
      default:
        throw new Error(`Unknown testing tool: ${toolName}`);
    }
  }
}

// Export for MCP server registration
export const testingTools = new TestingTools();
export const TESTING_TOOLS = [test_endpoint];