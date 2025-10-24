import { ExecutionError, ErrorCodes } from '../types/execution.types.js';
import { HttpRequestExecutor } from './HttpRequestExecutor.js';
import { EnvironmentManager } from '../environment/EnvironmentManager.js';
import { VariableInterpolator } from '../environment/VariableInterpolator.js';
import { SafeExpressionEvaluator } from '../security/SafeExpressionEvaluator.js';
import { logger } from '../utils/Logger.js';
/**
 * Flow Executor
 * Executes flow graphs with node-based logic and HTTP requests
 */
export class FlowExecutor {
    constructor() {
        this.maxExecutionTime = 600000; // 10 minutes
        this.maxDepth = 50; // Prevent infinite recursion
        this.httpExecutor = new HttpRequestExecutor();
        this.envManager = new EnvironmentManager();
    }
    /**
     * Execute a flow with the given configuration
     */
    async executeFlow(flowId, environmentId, overrideVariables = {}, maxExecutionTime) {
        const startTime = Date.now();
        const executionId = `flow_${flowId}_${Date.now()}`;
        try {
            logger.info('Starting flow execution', { flowId, environmentId, executionId }, 'FlowExecutor');
            // Load flow configuration
            const flowConfig = await this.envManager.loadFlowConfig(flowId);
            if (!flowConfig) {
                throw new ExecutionError(`Flow not found: ${flowId}`, ErrorCodes.FLOW_VALIDATION_ERROR);
            }
            // Validate flow
            const validation = this.validateFlow(flowConfig);
            if (!validation.isValid) {
                throw new ExecutionError(`Flow validation failed: ${validation.errors.join(', ')}`, ErrorCodes.FLOW_VALIDATION_ERROR);
            }
            // Load environment variables
            const baseVariables = await this.envManager.loadEnvironmentVariables(environmentId);
            const variables = this.envManager.mergeVariables(baseVariables, overrideVariables);
            // Create execution context
            const context = {
                flowId,
                environmentId,
                variables: { ...variables },
                nodeResults: new Map(),
                executionPath: [],
                startTime,
                errors: [],
                maxExecutionTime: maxExecutionTime || this.maxExecutionTime,
                debugMode: false
            };
            // Execute flow
            const nodeResults = await this.executeFlowNodes(flowConfig, context);
            // Calculate execution time
            const executionTime = Date.now() - startTime;
            // Check for timeout
            if (executionTime > (maxExecutionTime || this.maxExecutionTime)) {
                throw new ExecutionError(`Flow execution timeout after ${executionTime}ms`, ErrorCodes.FLOW_TIMEOUT);
            }
            const result = {
                flowId,
                status: context.errors.length > 0 ? 'completed_with_errors' : 'completed',
                executionTime,
                nodeResults,
                errors: context.errors,
                variables: context.variables,
                executionPath: context.executionPath,
                timestamp: new Date().toISOString()
            };
            logger.info('Flow execution completed', {
                flowId,
                status: result.status,
                executionTime,
                nodeCount: nodeResults.length,
                errorCount: context.errors.length
            }, 'FlowExecutor');
            return result;
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            logger.error('Flow execution failed', {
                flowId,
                environmentId,
                executionId,
                executionTime,
                error: error instanceof Error ? error.message : String(error)
            }, 'FlowExecutor');
            return {
                flowId,
                status: 'failed',
                executionTime,
                nodeResults: [],
                errors: [error instanceof ExecutionError ? error : new ExecutionError(`Flow execution failed: ${error instanceof Error ? error.message : String(error)}`, ErrorCodes.FLOW_VALIDATION_ERROR, undefined, error)],
                variables: {},
                executionPath: [],
                timestamp: new Date().toISOString()
            };
        }
    }
    /**
     * Execute flow nodes starting from entry points
     */
    async executeFlowNodes(flowConfig, context) {
        const results = [];
        const visitedNodes = new Set();
        const executingNodes = new Set();
        // Find start nodes (nodes with no incoming edges)
        const startNodes = this.findStartNodes(flowConfig.nodes, flowConfig.edges);
        if (startNodes.length === 0) {
            throw new ExecutionError('No start nodes found in flow', ErrorCodes.FLOW_VALIDATION_ERROR);
        }
        logger.debug('Found start nodes', { startNodes: startNodes.map(n => n.id) }, 'FlowExecutor');
        // Execute from each start node
        for (const startNode of startNodes) {
            const nodeResults = await this.executeNodeRecursive(startNode, flowConfig, context, visitedNodes, executingNodes, 0);
            results.push(...nodeResults);
        }
        return results;
    }
    /**
     * Recursively execute nodes following edges
     */
    async executeNodeRecursive(node, flowConfig, context, visitedNodes, executingNodes, depth) {
        // Prevent infinite recursion
        if (depth > this.maxDepth) {
            throw new ExecutionError(`Maximum execution depth exceeded (${this.maxDepth})`, ErrorCodes.FLOW_VALIDATION_ERROR);
        }
        // Prevent infinite loops
        if (executingNodes.has(node.id)) {
            throw new ExecutionError(`Circular dependency detected at node: ${node.id}`, ErrorCodes.FLOW_CIRCULAR_DEPENDENCY);
        }
        // Skip if already visited
        if (visitedNodes.has(node.id)) {
            return [];
        }
        executingNodes.add(node.id);
        context.executionPath.push(node.id);
        try {
            // Check execution timeout
            const currentTime = Date.now();
            if (currentTime - context.startTime > context.maxExecutionTime) {
                throw new ExecutionError(`Flow execution timeout at node: ${node.id}`, ErrorCodes.FLOW_TIMEOUT);
            }
            logger.debug('Executing node', { nodeId: node.id, type: node.type }, 'FlowExecutor');
            // Execute the node
            const result = await this.executeNode(node, context);
            context.nodeResults.set(node.id, result);
            const results = [result];
            // Find next nodes based on edges and execution result
            const nextNodes = this.getNextNodes(node.id, result, flowConfig.edges, flowConfig.nodes);
            // Execute next nodes
            for (const nextNode of nextNodes) {
                const nextResults = await this.executeNodeRecursive(nextNode, flowConfig, context, visitedNodes, executingNodes, depth + 1);
                results.push(...nextResults);
            }
            visitedNodes.add(node.id);
            return results;
        }
        finally {
            executingNodes.delete(node.id);
        }
    }
    /**
     * Execute a single node
     */
    async executeNode(node, context) {
        const startTime = Date.now();
        try {
            switch (node.type) {
                case 'http_request':
                    return await this.executeHttpRequestNode(node, context, startTime);
                case 'delay':
                    return await this.executeDelayNode(node, context, startTime);
                case 'condition':
                    return await this.executeConditionNode(node, context, startTime);
                case 'variable_set':
                    return await this.executeVariableSetNode(node, context, startTime);
                default:
                    throw new ExecutionError(`Unknown node type: ${node.type}`, ErrorCodes.FLOW_VALIDATION_ERROR);
            }
        }
        catch (error) {
            const executionTime = Date.now() - startTime;
            const errorResult = {
                nodeId: node.id,
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                executionTime,
                timestamp: new Date().toISOString()
            };
            context.errors.push(error instanceof ExecutionError ? error : new ExecutionError(`Node execution failed: ${error instanceof Error ? error.message : String(error)}`, ErrorCodes.FLOW_VALIDATION_ERROR, undefined, error));
            return errorResult;
        }
    }
    /**
     * Execute HTTP request node
     */
    async executeHttpRequestNode(node, context, startTime) {
        // Build HTTP request config
        const httpConfig = {
            method: node.data.method,
            url: VariableInterpolator.interpolate(node.data.url, context.variables),
            headers: VariableInterpolator.interpolateObject(node.data.headers || {}, context.variables),
            body: VariableInterpolator.interpolateBody(node.data.body, context.variables),
            timeout: node.data.timeout || 30000,
            followRedirects: true
        };
        // Execute HTTP request
        const response = await this.httpExecutor.execute(httpConfig);
        const executionTime = Date.now() - startTime;
        // Save response to variable if specified
        if (node.data.saveResponse && node.data.responseVariable) {
            context.variables[node.data.responseVariable] = response.body;
        }
        return {
            nodeId: node.id,
            status: 'success',
            response,
            executionTime,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute delay node
     */
    async executeDelayNode(node, context, startTime) {
        const delay = Math.min(node.data.duration, 30000); // Max 30 seconds
        await this.sleep(delay);
        const executionTime = Date.now() - startTime;
        return {
            nodeId: node.id,
            status: 'success',
            data: { delay },
            executionTime,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute condition node
     */
    async executeConditionNode(node, context, startTime) {
        const result = SafeExpressionEvaluator.evaluate(node.data.condition, context.variables);
        const executionTime = Date.now() - startTime;
        return {
            nodeId: node.id,
            status: 'success',
            data: { condition: node.data.condition, result },
            executionTime,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Execute variable set node
     */
    async executeVariableSetNode(node, context, startTime) {
        const value = VariableInterpolator.interpolate(node.data.value, context.variables);
        context.variables[node.data.variable] = value;
        const executionTime = Date.now() - startTime;
        return {
            nodeId: node.id,
            status: 'success',
            data: { variable: node.data.variable, value },
            executionTime,
            timestamp: new Date().toISOString()
        };
    }
    /**
     * Find start nodes (nodes with no incoming edges)
     */
    findStartNodes(nodes, edges) {
        const nodesWithIncoming = new Set(edges.map(edge => edge.target));
        return nodes.filter(node => !nodesWithIncoming.has(node.id));
    }
    /**
     * Get next nodes based on current node result and edges
     */
    getNextNodes(currentNodeId, result, edges, nodes) {
        const outgoingEdges = edges.filter(edge => edge.source === currentNodeId);
        const nextNodeIds = new Set();
        for (const edge of outgoingEdges) {
            // Check edge conditions
            if (this.shouldExecuteEdge(edge, result)) {
                nextNodeIds.add(edge.target);
            }
        }
        return nodes.filter(node => nextNodeIds.has(node.id));
    }
    /**
     * Check if edge should be executed based on result
     */
    shouldExecuteEdge(edge, result) {
        switch (edge.type) {
            case 'success':
                return result.status === 'success';
            case 'error':
                return result.status === 'error';
            case 'true':
                return result.data?.result === true;
            case 'false':
                return result.data?.result === false;
            case 'always':
                return true;
            default:
                return true;
        }
    }
    /**
     * Validate flow configuration
     */
    validateFlow(flowConfig) {
        const errors = [];
        // Check for nodes
        if (!flowConfig.nodes || flowConfig.nodes.length === 0) {
            errors.push('Flow must have at least one node');
        }
        // Check for start nodes
        const startNodes = this.findStartNodes(flowConfig.nodes, flowConfig.edges || []);
        if (startNodes.length === 0) {
            errors.push('Flow must have at least one start node (no incoming edges)');
        }
        // Check for circular dependencies
        if (this.hasCircularDependency(flowConfig.edges || [])) {
            errors.push('Flow contains circular dependencies');
        }
        // Validate node configurations
        for (const node of flowConfig.nodes) {
            const nodeErrors = this.validateNode(node);
            errors.push(...nodeErrors.map(error => `Node ${node.id}: ${error}`));
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Validate individual node
     */
    validateNode(node) {
        const errors = [];
        switch (node.type) {
            case 'http_request':
                if (!node.data.url) {
                    errors.push('HTTP request node must have URL');
                }
                if (!node.data.method) {
                    errors.push('HTTP request node must have method');
                }
                break;
            case 'condition':
                if (!node.data.condition) {
                    errors.push('Condition node must have condition expression');
                }
                break;
            case 'variable_set':
                if (!node.data.variable) {
                    errors.push('Variable set node must have variable name');
                }
                break;
            case 'delay':
                if (typeof node.data.duration !== 'number' || node.data.duration < 0) {
                    errors.push('Delay node must have valid duration');
                }
                break;
        }
        return errors;
    }
    /**
     * Check for circular dependencies in edges
     */
    hasCircularDependency(edges) {
        const graph = new Map();
        // Build adjacency list
        for (const edge of edges) {
            if (!graph.has(edge.source)) {
                graph.set(edge.source, []);
            }
            graph.get(edge.source).push(edge.target);
        }
        // Check for cycles using DFS
        const visited = new Set();
        const recursionStack = new Set();
        const hasCycle = (node) => {
            if (recursionStack.has(node))
                return true;
            if (visited.has(node))
                return false;
            visited.add(node);
            recursionStack.add(node);
            const neighbors = graph.get(node) || [];
            for (const neighbor of neighbors) {
                if (hasCycle(neighbor))
                    return true;
            }
            recursionStack.delete(node);
            return false;
        };
        for (const node of graph.keys()) {
            if (hasCycle(node))
                return true;
        }
        return false;
    }
    /**
     * Sleep utility
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
//# sourceMappingURL=FlowExecutor.js.map