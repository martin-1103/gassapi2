import { McpTool } from '../types/mcp.types.js';
import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { FlowExecutor } from '../execution/FlowExecutor.js';
import { EnvironmentManager } from '../environment/EnvironmentManager.js';
import { logger } from '../utils/Logger.js';

/**
 * Flow Execution Tools
 * Handles flow execution with direct HTTP requests and logic processing
 */

const execute_flow: McpTool = {
  name: 'execute_flow',
  description: 'Execute a flow with direct HTTP requests and logic processing',
  inputSchema: {
    type: 'object',
    properties: {
      flowId: {
        type: 'string',
        description: 'Flow UUID to execute'
      },
      environmentId: {
        type: 'string',
        description: 'Environment UUID for variable substitution'
      },
      overrideVariables: {
        type: 'object',
        description: 'Override environment variables for this execution',
        default: {}
      },
      maxExecutionTime: {
        type: 'number',
        description: 'Maximum execution time in milliseconds',
        default: 600000
      },
      saveResult: {
        type: 'boolean',
        description: 'Save execution result in backend',
        default: true
      },
      debugMode: {
        type: 'boolean',
        description: 'Enable debug mode for detailed execution logging',
        default: false
      }
    },
    required: ['flowId', 'environmentId']
  }
};

export class FlowTools {
  private configLoader: ConfigLoader;
  private flowExecutor: FlowExecutor;
  private envManager: EnvironmentManager;

  constructor() {
    this.configLoader = new ConfigLoader();
    this.flowExecutor = new FlowExecutor();
    this.envManager = new EnvironmentManager();
  }

  /**
   * Execute a flow with direct HTTP requests and logic processing
   */
  async executeFlow(args: {
    flowId: string;
    environmentId: string;
    overrideVariables?: Record<string, string>;
    maxExecutionTime?: number;
    saveResult?: boolean;
    debugMode?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      logger.info('Executing flow via MCP tool', {
        flowId: args.flowId,
        environmentId: args.environmentId,
        debugMode: args.debugMode
      }, 'FlowTools');

      // Validate inputs
      const validation = this.validateFlowExecutionArgs(args);
      if (!validation.isValid) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Invalid Flow Execution Arguments\n\n${validation.errors.map(error => `• ${error}`).join('\n')}\n\nPlease check your input and try again.`
            }
          ],
          isError: true
        };
      }

      // Load configuration
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Configuration Required\n\nNo GASSAPI configuration found. Please create gassapi.json in your project root with project and MCP client settings.`
            }
          ],
          isError: true
        };
      }

      // Execute flow
      const result = await this.flowExecutor.executeFlow(
        args.flowId,
        args.environmentId,
        args.overrideVariables,
        args.maxExecutionTime
      );

      // Format result
      const formattedResult = this.formatFlowExecutionResult(result, args.debugMode);

      return {
        content: [
          {
            type: 'text',
            text: formattedResult
          }
        ]
      };

    } catch (error) {
      logger.error('Flow execution failed in MCP tool', {
        flowId: args.flowId,
        environmentId: args.environmentId,
        error: error instanceof Error ? error.message : String(error)
      }, 'FlowTools');

      return {
        content: [
          {
            type: 'text',
            text: `❌ Flow Execution Failed\n\nError: ${error instanceof Error ? error.message : String(error)}\n\nPossible causes:\n• Flow configuration is invalid\n• Environment variables are missing\n• Network connectivity issues\n• Flow contains unsupported node types\n\nCheck the flow configuration and try again.`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Validate flow execution arguments
   */
  private validateFlowExecutionArgs(args: {
    flowId: string;
    environmentId: string;
    overrideVariables?: Record<string, string>;
    maxExecutionTime?: number;
    saveResult?: boolean;
    debugMode?: boolean;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!args.flowId || typeof args.flowId !== 'string') {
      errors.push('flowId is required and must be a string');
    }

    if (!args.environmentId || typeof args.environmentId !== 'string') {
      errors.push('environmentId is required and must be a string');
    }

    if (args.maxExecutionTime && (typeof args.maxExecutionTime !== 'number' || args.maxExecutionTime < 0)) {
      errors.push('maxExecutionTime must be a positive number');
    }

    if (args.overrideVariables && typeof args.overrideVariables !== 'object') {
      errors.push('overrideVariables must be an object');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Format flow execution result for display
   */
  private formatFlowExecutionResult(result: any, debugMode?: boolean): string {
    const status = this.getStatusEmoji(result.status);
    const nodeResults = result.nodeResults || [];

    const successCount = nodeResults.filter((r: any) => r.status === 'success').length;
    const errorCount = nodeResults.filter((r: any) => r.status === 'error').length;
    const skippedCount = nodeResults.filter((r: any) => r.status === 'skipped').length;

    let output = `🔄 Flow Execution Result\n\n`;
    output += `${status} Status: ${result.status}\n`;
    output += `⏱️ Execution Time: ${result.executionTime}ms\n`;
    output += `📊 Nodes: ${nodeResults.length} total (${successCount} ✅, ${errorCount} ❌, ${skippedCount} ⏭️)\n`;
    output += `🕐 Timestamp: ${result.timestamp}\n\n`;

    // Execution path
    if (result.executionPath && result.executionPath.length > 0) {
      output += `📋 Execution Path:\n`;
      result.executionPath.forEach((nodeId: string, index: number) => {
        const nodeResult = nodeResults.find((r: any) => r.nodeId === nodeId);
        const nodeStatus = this.getNodeStatusEmoji(nodeResult?.status);
        output += `${index + 1}. ${nodeId}: ${nodeStatus}\n`;
      });
      output += '\n';
    }

    // Errors
    if (result.errors && result.errors.length > 0) {
      output += `❌ Errors (${result.errors.length}):\n`;
      result.errors.forEach((error: any, index: number) => {
        output += `${index + 1}. ${error.message}\n`;
      });
      output += '\n';
    }

    // Final variables
    if (result.variables && Object.keys(result.variables).length > 0) {
      output += `🔧 Final Variables:\n`;
      Object.entries(result.variables).forEach(([key, value]) => {
        const displayValue = typeof value === 'string' && value.length > 50
          ? value.substring(0, 50) + '...'
          : String(value);
        output += `• ${key}: ${displayValue}\n`;
      });
      output += '\n';
    }

    // Debug information
    if (debugMode && nodeResults.length > 0) {
      output += `🐛 Debug Information:\n`;
      nodeResults.slice(0, 5).forEach((nodeResult: any) => {
        output += `• ${nodeResult.nodeId}: ${nodeResult.executionTime}ms\n`;
        if (nodeResult.response) {
          output += `  └─ Status: ${nodeResult.response.status}, Time: ${nodeResult.response.responseTime}ms\n`;
        }
      });
      if (nodeResults.length > 5) {
        output += `• ... and ${nodeResults.length - 5} more nodes\n`;
      }
      output += '\n';
    }

    output += `✅ Flow execution completed!`;
    return output;
  }

  /**
   * Get status emoji
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'completed': return '🟢';
      case 'completed_with_errors': return '🟡';
      case 'failed': return '🔴';
      case 'timeout': return '⏰';
      default: return '⚪';
    }
  }

  /**
   * Get node status emoji
   */
  private getNodeStatusEmoji(status?: string): string {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'skipped': return '⏭️';
      default: return '⚪';
    }
  }

  /**
   * Get available flow tools
   */
  getTools(): McpTool[] {
    return [execute_flow];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'execute_flow':
        return this.executeFlow(args as {
          flowId: string;
          environmentId: string;
          overrideVariables?: Record<string, string>;
          maxExecutionTime?: number;
          saveResult?: boolean;
          debugMode?: boolean;
        });
      default:
        throw new Error(`Flow tool not found: ${toolName}`);
    }
  }
}

// Export for MCP server registration
export const flowTools = new FlowTools();
export const FLOW_TOOLS = [execute_flow];