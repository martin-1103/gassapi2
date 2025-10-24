/**
 * GASSAPI MCP Server v2 - Migration Mode
 * Core server implementation migrated from original MCP
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  InitializeRequestSchema,
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

// Simple logger (migrated from original pattern)
class SimpleLogger {
  private static instance: SimpleLogger;

  static getInstance(): SimpleLogger {
    if (!SimpleLogger.instance) {
      SimpleLogger.instance = new SimpleLogger();
    }
    return SimpleLogger.instance;
  }

  info(message: string, context?: any, module?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message,
      ...context,
      module: module || 'McpServer'
    };
    console.error(`[GASSAPI-MCP] [INFO] ${message}`, context ? logData : '');
  }

  error(message: string, context?: any, module?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      message,
      ...context,
      module: module || 'McpServer'
    };
    console.error(`[GASSAPI-MCP] [ERROR] ${message}`, context ? logData : '');
  }
}

const logger = SimpleLogger.getInstance();

/**
 * GASSAPI MCP Server Implementation
 * Migrated from original with simplified architecture
 */
export class McpServer {
  private server: Server;
  private tools: Map<string, any> = new Map();
  private startTime: number;

  constructor() {
    this.startTime = Date.now();

    // Initialize MCP server (similar to original)
    this.server = new Server(
      {
        name: 'GASSAPI MCP Client',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {
            listChanged: true
          }
        }
      }
    );

    // Register tools (will be populated during migration)
    this.registerAllTools();

    logger.info('GASSAPI MCP Server initialized', {
      toolsCount: this.tools.size,
      module: 'McpServer'
    });
  }

  /**
   * Register all available tools
   * Pattern from original MCP
   */
  private registerAllTools(): void {
    // Import tools dynamically for migration
    import('./tools/index.js').then(({ ALL_TOOLS }) => {
      this.tools.clear();

      ALL_TOOLS.forEach(tool => {
        this.tools.set(tool.name, tool);
      });

      logger.info(`Registered ${this.tools.size} tools`, {
        toolsCount: this.tools.size,
        tools: Array.from(this.tools.keys()),
        module: 'McpServer'
      });
    }).catch(error => {
      logger.error('Failed to load tools', {
        error: error instanceof Error ? error.message : String(error),
        module: 'McpServer'
      });

      // Fallback: register only health_check
      const healthCheckTool = {
        name: 'health_check',
        description: 'Check if the MCP server is running properly',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      };
      this.tools.set(healthCheckTool.name, healthCheckTool);
    });
  }

  /**
   * Start MCP server with stdio transport
   * Migrated from original implementation
   */
  async start(): Promise<void> {
    try {
      // Register MCP request handlers (original pattern)
      this.server.setRequestHandler(InitializeRequestSchema, this.handleInitialize.bind(this));
      this.server.setRequestHandler(ListToolsRequestSchema, this.handleListTools.bind(this));
      this.server.setRequestHandler(CallToolRequestSchema, this.handleToolCall.bind(this));

      // Create stdio transport
      const transport = new StdioServerTransport();

      logger.info('GASSAPI MCP Server starting...', { module: 'McpServer' });
      logger.info('Server capability: tools available', { module: 'McpServer' });
      logger.info(`${this.tools.size} tools registered`, {
        toolsCount: this.tools.size,
        module: 'McpServer'
      });

      await this.server.connect(transport);

      logger.info('GASSAPI MCP Server connected and ready', { module: 'McpServer' });

    } catch (error) {
      logger.error('Failed to start MCP server', {
        error: error instanceof Error ? error.message : String(error),
        module: 'McpServer'
      });
      throw error;
    }
  }

  /**
   * Handle MCP initialize request
   * Migrated from original implementation
   */
  private async handleInitialize(request: any): Promise<any> {
    try {
      logger.info(`MCP client initialized: ${request.params.clientInfo.name}`, {
        clientName: request.params.clientInfo.name,
        module: 'McpServer'
      });

      // Validate protocol version
      if (!this.isProtocolVersionSupported(request.params.protocolVersion)) {
        throw new Error(`Unsupported protocol version: ${request.params.protocolVersion}`);
      }

      const result = {
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

      logger.info('MCP initialization successful', { module: 'McpServer' });
      return result;

    } catch (error) {
      logger.error('MCP initialization failed', {
        error: error instanceof Error ? error.message : String(error),
        module: 'McpServer'
      });
      throw error;
    }
  }

  /**
   * Handle tools/list request
   * Migrated from original implementation
   */
  private async handleListTools(): Promise<any> {
    try {
      const toolList = Array.from(this.tools.values());

      logger.info(`Tools list requested: ${toolList.length} tools available`, {
        toolsCount: toolList.length,
        module: 'McpServer'
      });

      return {
        tools: toolList.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      };

    } catch (error) {
      logger.error('Failed to list tools', {
        error: error instanceof Error ? error.message : String(error),
        module: 'McpServer'
      });
      throw error;
    }
  }

  /**
   * Handle tools/call request
   * Migrated from original implementation
   */
  private async handleToolCall(request: any): Promise<any> {
    try {
      const { name, arguments: args } = request.params;

      logger.info(`Tool call: ${name}`, {
        toolName: name,
        arguments: args,
        module: 'McpServer'
      });

      if (!this.tools.has(name)) {
        throw new Error(`Unknown tool: ${name}`);
      }

      // Route to appropriate tool handler using dynamic import
      try {
        const { createAllToolHandlers } = await import('./tools/index.js');
        const handlers = createAllToolHandlers();

        if (handlers[name]) {
          return await handlers[name](args || {});
        } else {
          throw new Error(`Tool handler not found: ${name}`);
        }
      } catch (handlerError) {
        throw new Error(`Failed to execute tool ${name}: ${handlerError instanceof Error ? handlerError.message : 'Unknown error'}`);
      }

    } catch (error) {
      logger.error(`Tool ${request.params.name} failed`, {
        error: error instanceof Error ? error.message : String(error),
        toolName: request.params.name,
        module: 'McpServer'
      });

      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Handle health_check tool
   */
  private async handleHealthCheck(args: Record<string, any>): Promise<any> {
    try {
      const uptime = (Date.now() - this.startTime) / 1000;
      const memory = process.memoryUsage();

      const status = {
        server: 'GASSAPI MCP Client',
        version: '1.0.0',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: uptime,
        memory: memory,
        tools: Array.from(this.tools.keys()),
        migration_status: 'Step 1 - Core Framework Migrated'
      };

      return {
        content: [
          {
            type: 'text',
            text: `✅ GASSAPI MCP Server Status\n\n${JSON.stringify(status, null, 2)}`
          }
        ]
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    const supportedVersions = ['2024-11-05', '2025-06-18'];
    return supportedVersions.includes(version);
  }

  /**
   * Stop the MCP server
   */
  async shutdown(): Promise<void> {
    try {
      await this.server.close();
      logger.info('MCP Server shutdown complete', { module: 'McpServer' });
    } catch (error) {
      logger.error('Error during shutdown', {
        error: error instanceof Error ? error.message : String(error),
        module: 'McpServer'
      });
      throw error;
    }
  }

  /**
   * Get server status
   */
  getStatus(): any {
    try {
      const uptime = (Date.now() - this.startTime) / 1000;

      return {
        status: 'ok',
        details: {
          version: '1.0.0',
          uptime: uptime,
          toolsCount: this.tools.size,
          tools: Array.from(this.tools.keys()),
          migrationStatus: 'Step 1 - Core Framework Migrated'
        },
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
   * Add tool dynamically (for migration)
   */
  addTool(tool: any): void {
    this.tools.set(tool.name, tool);
    logger.info(`Tool added: ${tool.name}`, {
      toolName: tool.name,
      totalTools: this.tools.size,
      module: 'McpServer'
    });
  }

  /**
   * Get all registered tools
   */
  getTools(): any[] {
    return Array.from(this.tools.values());
  }
}