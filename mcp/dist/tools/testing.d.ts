import { McpTool } from '../types/mcp.types';
export declare class TestingTools {
    private configLoader;
    private backendClient;
    constructor();
    private getBackendClient;
    /**
     * Test single endpoint with environment variables
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
     * Format test result for display
     */
    private formatTestResult;
    /**
     * Quick test with auto-detection
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
     * Helper function for delays
     */
    private sleep;
    /**
     * Get testing tools list
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: any): Promise<any>;
}
export declare const testingTools: TestingTools;
export declare const TESTING_TOOLS: McpTool[];
//# sourceMappingURL=testing.d.ts.map