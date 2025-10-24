import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { BackendClient } from '../client/BackendClient.js';
import { ExecutionEngine } from '../execution/ExecutionEngine.js';
import { EnvironmentManager } from '../environment/EnvironmentManager.js';
import { logger } from '../utils/Logger.js';
/**
 * Enhanced Testing Tools with Direct Execution
 * Handles endpoint testing with both backend and direct execution modes
 */
const test_endpoint = {
    name: 'test_endpoint',
    description: 'Execute single endpoint test with environment variables (direct HTTP execution)',
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
            },
            timeout: {
                type: 'number',
                description: 'Request timeout in milliseconds',
                default: 30000
            },
            executionMode: {
                type: 'string',
                enum: ['direct', 'backend'],
                description: 'Execution mode: direct HTTP or backend API',
                default: 'direct'
            }
        },
        required: ['endpointId', 'environmentId']
    }
};
export class TestingTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
        this.executionEngine = new ExecutionEngine();
        this.envManager = new EnvironmentManager();
    }
    /**
     * Test single endpoint with environment variables
     */
    async testEndpoint(args) {
        try {
            const mode = args.executionMode || 'direct';
            if (mode === 'direct') {
                return await this.testEndpointDirect(args);
            }
            else {
                return await this.testEndpointBackend(args);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown test error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Test Endpoint Failed\n\nError: ${errorMessage}\n\nPlease check:\n1. Endpoint ID is valid\n2. Environment is accessible\n3. Network connection is stable\n4. Configuration is correct`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Test endpoint using direct HTTP execution
     */
    async testEndpointDirect(args) {
        try {
            logger.info('Testing endpoint with direct execution', {
                endpointId: args.endpointId,
                environmentId: args.environmentId
            }, 'TestingTools');
            // Execute endpoint directly
            const result = await this.executionEngine.executeEndpoint({
                endpointId: args.endpointId,
                environmentId: args.environmentId,
                overrideVariables: args.overrideVariables,
                timeout: args.timeout
            });
            // Format result
            const formattedResult = this.formatDirectTestResult(result);
            return {
                content: [
                    {
                        type: 'text',
                        text: formattedResult
                    }
                ]
            };
        }
        catch (error) {
            logger.error('Direct endpoint test failed', {
                endpointId: args.endpointId,
                environmentId: args.environmentId,
                error: error instanceof Error ? error.message : String(error)
            }, 'TestingTools');
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Direct Test Failed\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nThis could be due to:\n1. Invalid endpoint configuration\n2. Network connectivity issues\n3. Variable interpolation problems\n4. Security restrictions`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Test endpoint using backend API (fallback)
     */
    async testEndpointBackend(args) {
        try {
            logger.info('Testing endpoint via backend API', {
                endpointId: args.endpointId,
                environmentId: args.environmentId
            }, 'TestingTools');
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const client = await this.getBackendClient();
            // This would need BackendClient.testEndpoint to be implemented
            // For now, return a placeholder
            return {
                content: [
                    {
                        type: 'text',
                        text: `⚠️ Backend execution not yet implemented\n\nEndpoint: ${args.endpointId}\nEnvironment: ${args.environmentId}\n\nUse executionMode: 'direct' for immediate testing.`
                    }
                ]
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Backend Test Failed\n\nError: ${error instanceof Error ? error.message : String(error)}`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Format direct test result
     */
    formatDirectTestResult(result) {
        const status = result.success ? '🟢' : '🔴';
        const statusText = result.success ? 'Success' : 'Failed';
        let output = `🧪 Direct Endpoint Test Result\n\n`;
        output += `${status} Status: ${result.response?.status || 'N/A'} (${statusText})\n`;
        output += `⏱️ Response Time: ${result.response?.responseTime || 0}ms\n`;
        output += `📊 Timestamp: ${result.timestamp}\n\n`;
        output += `📍 Request Details:\n`;
        output += `- Method: ${result.request?.method || 'N/A'}\n`;
        output += `- URL: ${result.request?.url || 'N/A'}\n`;
        output += `- Timeout: ${result.request?.timeout || 30000}ms\n\n`;
        // Environment variables
        if (result.variables && Object.keys(result.variables).length > 0) {
            output += `🔧 Environment Variables:\n`;
            Object.entries(result.variables).forEach(([key, value]) => {
                const displayValue = typeof value === 'string' && value.length > 50
                    ? value.substring(0, 50) + '...'
                    : String(value);
                output += `- ${key}: ${displayValue}\n`;
            });
            output += '\n';
        }
        // Response headers
        if (result.response?.headers) {
            output += `📤 Response Headers:\n`;
            Object.entries(result.response.headers).slice(0, 10).forEach(([key, value]) => {
                output += `- ${key}: ${String(value).substring(0, 100)}\n`;
            });
            output += '\n';
        }
        // Response body
        if (result.response?.body) {
            output += `📄 Response Body:\n`;
            try {
                const bodyText = typeof result.response.body === 'string'
                    ? result.response.body
                    : JSON.stringify(result.response.body, null, 2);
                if (bodyText.length < 500) {
                    output += `\`\`\`\n${bodyText}\n\`\`\`\n`;
                }
                else {
                    output += `Response body too large (${bodyText.length} characters)\n`;
                }
            }
            catch (e) {
                output += `Error formatting response body\n`;
            }
        }
        // Error details
        if (result.error) {
            output += `\n❌ Error Details:\n${result.error}\n`;
        }
        output += `\n✅ Direct test completed!`;
        return output;
    }
    /**
     * Get backend client instance
     */
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found');
        }
        this.backendClient = new BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
        return this.backendClient;
    }
    /**
     * Get testing tools list
     */
    getTools() {
        return [test_endpoint];
    }
    /**
     * Handle tool calls
     */
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'test_endpoint':
                return this.testEndpoint(args);
            default:
                throw new Error(`Testing tool not found: ${toolName}`);
        }
    }
}
// Export for MCP server registration
export const testingTools = new TestingTools();
export const TESTING_TOOLS = [test_endpoint];
//# sourceMappingURL=testing.js.map