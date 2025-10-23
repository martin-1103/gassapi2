import { McpTool } from '../types/mcp.types';
export declare class TestingTools {
    private configLoader;
    private backendClient;
    constructor();
    /**
     * Validasi format UUID
     */
    private isValidUUID;
    /**
     * Validasi dan sanitasi input parameters
     */
    private validateTestEndpointArgs;
    /**
     * Transformasi aman environment variables array ke Record
     */
    private transformEnvironmentVariables;
    /**
     * Wrapper aman untuk pemanggilan API
     */
    private safeApiCall;
    private getBackendClient;
    /**
     * Test single endpoint dengan environment variables
     */
    testEndpoint(args: {
        endpointId: string;
        environmentId: string;
        overrideVariables?: Record<string, string>;
        saveResult?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Format test result untuk display
     */
    private formatTestResult;
    /**
     * Quick test dengan auto-detection
     */
    quickTest(args: {
        url?: string;
        method?: string;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Test multiple endpoints
     */
    batchTest(args: {
        endpointIds: string[];
        environmentId: string;
        parallel?: boolean;
        delay?: number;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Helper function untuk delays
     */
    private sleep;
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