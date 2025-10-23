import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  McpInitializeRequest,
  McpInitializeResult,
  McpServerCapabilities,
  McpTool,
  McpListToolsResponse,
  McpToolCallRequest,
  McpToolResponse
} from '../types/mcp.types';
import { authTools, AUTH_TOOLS } from '../tools/auth';
import { environmentTools, ENVIRONMENT_TOOLS } from '../tools/environment';
import { collectionTools, COLLECTION_TOOLS } from '../tools/collection';
import { endpointTools, ENDPOINT_TOOLS } from '../tools/endpoint';
import { testingTools, TESTING_TOOLS } from '../tools/testing';

/**
 * GASSAPI MCP Server
 * Implements Model Context Protocol for Claude Desktop integration
 */
export class McpServer {
  private server: Server;
  private tools: Map<string, McpTool> = new Map();
  private config: any = null;

  constructor() {
    this.server = new Server(
      {
        name: 'GASSAPI MCP Client',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.registerAllTools();
  }

  /**
   * Register all available tools
   */
  private registerAllTools(): void {
    // Register authentication tools
    AUTH_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Register environment tools
    ENVIRONMENT_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Register collection tools
    COLLECTION_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Register endpoint tools
    ENDPOINT_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    // Register testing tools
    TESTING_TOOLS.forEach(tool => {
      this.tools.set(tool.name, tool);
    });

    console.log(`Registered ${this.tools.size} MCP tools for GASSAPI operations`);
  }

  /**
   * Start MCP server with stdio transport
   */
  async start(): Promise<void> {
    try {
      // Setup request handlers
      this.server.setRequestHandler('initialize', this.handleInitialize.bind(this));
      this.server.setRequestHandler('tools/list', this.handleListTools.bind(this));
      this.server.setRequestHandler('tools/call', this.handleToolCall.bind(this));

      // Create stdio transport
      const transport = new StdioServerTransport();

      console.log('🤖 GASSAPI MCP Server starting...');
      console.log('📡 Server capabilities: tools available');
      console.log(`🔧 ${this.tools.size} tools registered`);

      await this.server.connect(transport);
      console.log('✅ GASSAPI MCP Server connected and ready');

    } catch (error) {
      console.error('❌ Failed to start MCP server:', error);
      throw error;
    }
  }

  /**
   * Handle MCP initialize request
   */
  private async handleInitialize(request: McpInitializeRequest): Promise<McpInitializeResult> {
    try {
      console.log('🔐 MCP client initialized:', request.clientInfo.name);

      // Validate protocol version
      if (!this.isProtocolVersionSupported(request.protocolVersion)) {
        throw new Error(`Unsupported protocol version: ${request.protocolVersion}`);
      }

      const result: McpInitializeResult = {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: true
          }
        },
        serverInfo: {
          name: 'GASSAPI MCP Client',
          version: '1.0.0'
        }
      };

      console.log('✅ MCP initialization successful');
      return result;

    } catch (error) {
      console.error('❌ MCP initialization failed:', error);
      throw error;
    }
  }

  /**
   * Handle tools/list request
   */
  private async handleListTools(): Promise<McpListToolsResponse> {
    try {
      const toolList = Array.from(this.tools.values());

      console.log(`📋 Tools list requested: ${toolList.length} tools available`);

      return {
        tools: toolList.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };

    } catch (error) {
      console.error('❌ Failed to list tools:', error);
      throw error;
    }
  }

  /**
   * Handle tools/call request
   */
  private async handleToolCall(request: McpToolCallRequest): Promise<McpToolResponse> {
    try {
      const { name, arguments: args } = request;
      console.log(`🔧 Tool call: ${name}`, args);

      if (!this.tools.has(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }

      const tool = this.tools.get(name)!;

      // Route to appropriate tool handler
      let result;

      if (AUTH_TOOLS.some(t => t.name === name)) {
        result = await authTools.handleToolCall(name, args);
      } else if (ENVIRONMENT_TOOLS.some(t => t.name === name)) {
        result = await environmentTools.handleToolCall(name, args);
      } else if (COLLECTION_TOOLS.some(t => t.name === name)) {
        result = await collectionTools.handleToolCall(name, args);
      } else if (ENDPOINT_TOOLS.some(t => t.name === name)) {
        result = await endpointTools.handleToolCall(name, args);
      } else if (TESTING_TOOLS.some(t => t.name === name)) {
        result = await testingTools.handleToolCall(name, args);
      } else {
        throw new Error(`No handler found for tool: ${name}`);
      }

      console.log(`✅ Tool ${name} executed successfully`);

      return {
        content: result.content || [],
        isError: result.isError || false
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Tool ${request.name} failed:`, error);

      return {
        content: [
          {
                type: 'text',
                text: `❌ Tool execution failed: ${errorMessage}`
              }
            ],
        isError: true
      };
    }
  }

  /**
   * Check if protocol version is supported
   */
  private isProtocolVersionSupported(version: string): boolean {
    const supportedVersions = ['2024-11-05', '2024-10-07'];
    return supportedVersions.includes(version);
  }

  /**
   * Get server status
   */
  getStatus(): {
    name: string;
    version: string;
    toolsCount: number;
    status: string;
  } {
    return {
      name: 'GASSAPI MCP Client',
      version: '1.0.0',
      toolsCount: this.tools.size,
      status: 'running'
    };
  }

  /**
   * Get available tools by category
   */
  getToolsByCategory(): {
    authentication: McpTool[];
    environment: McpTool[];
    collection: McpTool[];
    endpoint: McpTool[];
    testing: McpTool[];
  } {
    return {
      authentication: AUTH_TOOLS,
      environment: ENVIRONMENT_TOOLS,
      collection: COLLECTION_TOOLS,
      endpoint: ENDPOINT_TOOLS,
      testing: TESTING_TOOLS
    };
  }

  /**
   * Add custom tool (for future extensions)
   */
  addCustomTool(tool: McpTool): void {
    this.tools.set(tool.name, tool);
    console.log(`🔧 Added custom tool: ${tool.name}`);
  }

  /**
   * Remove tool by name
   */
  removeTool(toolName: string): boolean {
    const removed = this.tools.delete(toolName);
    if (removed) {
      console.log(`🗑️ Removed tool: ${toolName}`);
    }
    return removed;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    try {
      console.log('🔄 Shutting down GASSAPI MCP server...');

      if (this.server) {
        await this.server.close();
      }

      console.log('✅ GASSAPI MCP server shut down successfully');
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      throw error;
    }
  }

  /**
   * Health check for monitoring
   */
  async healthCheck(): Promise<{
    status: 'ok' | 'error';
    details?: any;
    timestamp: number;
  }> {
    try {
      const status = this.getStatus();

      return {
        status: 'ok',
        details: status,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      };
    }
  }

  /**
   * Get server info for debugging
   */
  getDebugInfo(): {
    server: any;
    tools: Array<{ name: string; description: string; category: string }>;
    config: any;
  } {
    const toolsByCategory = this.getToolsByCategory();

    const allTools = [
      ...toolsByCategory.authentication.map(t => ({ ...t, category: 'authentication' })),
      ...toolsByCategory.environment.map(t => ({ ...t, category: 'environment' })),
      ...toolsByCategory.collection.map(t => ({ ...t, category: 'collection' })),
      ...toolsByCategory.endpoint.map(t => ({ ...t, category: 'endpoint' })),
      ...toolsByCategory.testing.map(t => ({ ...t, category: 'testing' }))
    ];

    return {
      server: {
        name: 'GASSAPI MCP Client',
        version: '1.0.0',
        protocol: 'Model Context Protocol'
      },
      tools: allTools,
      config: this.config
    };
  }
}