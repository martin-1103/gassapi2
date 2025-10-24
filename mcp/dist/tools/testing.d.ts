import { McpTool } from '../types/mcp.types.js';
export declare class TestingTools {
    private configLoader;
    private backendClient;
    private executionEngine;
    private envManager;
    constructor();
    /**
     * Test single endpoint with environment variables
     */
    testEndpoint(args: {
        endpointId: string;
        environmentId: string;
        overrideVariables?: Record<string, string>;
        saveResult?: boolean;
        timeout?: number;
        executionMode?: 'direct' | 'backend';
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Test endpoint using direct HTTP execution
     */
    private testEndpointDirect;
    /**
     * Test endpoint using backend API (fallback)
     */
    private testEndpointBackend;
    /**
     * Format direct test result
     */
    private formatDirectTestResult;
    /**
     * Get backend client instance
     */
    private getBackendClient;
    /**
     * Get testing tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const testingTools: TestingTools;
export declare const TESTING_TOOLS: McpTool[];
//# sourceMappingURL=testing.d.ts.map