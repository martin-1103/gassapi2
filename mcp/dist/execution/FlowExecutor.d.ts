import { FlowExecutionResult } from '../types/execution.types.js';
/**
 * Flow Executor
 * Executes flow graphs with node-based logic and HTTP requests
 */
export declare class FlowExecutor {
    private httpExecutor;
    private envManager;
    private maxExecutionTime;
    private maxDepth;
    constructor();
    /**
     * Execute a flow with the given configuration
     */
    executeFlow(flowId: string, environmentId: string, overrideVariables?: Record<string, string>, maxExecutionTime?: number): Promise<FlowExecutionResult>;
    /**
     * Execute flow nodes starting from entry points
     */
    private executeFlowNodes;
    /**
     * Recursively execute nodes following edges
     */
    private executeNodeRecursive;
    /**
     * Execute a single node
     */
    private executeNode;
    /**
     * Execute HTTP request node
     */
    private executeHttpRequestNode;
    /**
     * Execute delay node
     */
    private executeDelayNode;
    /**
     * Execute condition node
     */
    private executeConditionNode;
    /**
     * Execute variable set node
     */
    private executeVariableSetNode;
    /**
     * Find start nodes (nodes with no incoming edges)
     */
    private findStartNodes;
    /**
     * Get next nodes based on current node result and edges
     */
    private getNextNodes;
    /**
     * Check if edge should be executed based on result
     */
    private shouldExecuteEdge;
    /**
     * Validate flow configuration
     */
    private validateFlow;
    /**
     * Validate individual node
     */
    private validateNode;
    /**
     * Check for circular dependencies in edges
     */
    private hasCircularDependency;
    /**
     * Sleep utility
     */
    private sleep;
}
//# sourceMappingURL=FlowExecutor.d.ts.map