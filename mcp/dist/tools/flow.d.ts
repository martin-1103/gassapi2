import { McpTool } from '../types/mcp.types.js';
export declare class FlowTools {
    private configLoader;
    private flowExecutor;
    private envManager;
    constructor();
    /**
     * Execute a flow with direct HTTP requests and logic processing
     */
    executeFlow(args: {
        flowId: string;
        environmentId: string;
        overrideVariables?: Record<string, string>;
        maxExecutionTime?: number;
        saveResult?: boolean;
        debugMode?: boolean;
    }): Promise<{
        content: Array<{
            type: 'text';
            text: string;
        }>;
        isError?: boolean;
    }>;
    /**
     * Validate flow execution arguments
     */
    private validateFlowExecutionArgs;
    /**
     * Format flow execution result for display
     */
    private formatFlowExecutionResult;
    /**
     * Get status emoji
     */
    private getStatusEmoji;
    /**
     * Get node status emoji
     */
    private getNodeStatusEmoji;
    /**
     * Get available flow tools
     */
    getTools(): McpTool[];
    /**
     * Handle tool calls
     */
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
export declare const flowTools: FlowTools;
export declare const FLOW_TOOLS: McpTool[];
//# sourceMappingURL=flow.d.ts.map