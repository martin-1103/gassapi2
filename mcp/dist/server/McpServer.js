import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { InitializeRequestSchema, ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { authTools, AUTH_TOOLS } from '../tools/auth.js';
import { environmentTools, ENVIRONMENT_TOOLS } from '../tools/environment.js';
import { collectionTools, COLLECTION_TOOLS } from '../tools/collection.js';
import { endpointTools, ENDPOINT_TOOLS } from '../tools/endpoint.js';
import { testingTools, TESTING_TOOLS } from '../tools/testing.js';
import { flowTools, FLOW_TOOLS } from '../tools/flow.js';
import { logger } from '../utils/Logger.js';
/**
 * GASSAPI MCP Server
 * Implementasi Model Context Protocol buat Claude Desktop integration
 *
 * Server ini nanganin komunikasi antara MCP client dan backend GASSAPI
 * Pake proper logging instead of console.log biar lebih rapih
 */
export class GassapiMcpServer {
    constructor() {
        this.tools = new Map();
        this.config = null;
        this.server = new Server({
            name: 'GASSAPI MCP Client',
            version: '1.0.0'
        }, {
            capabilities: {
                tools: {
                    listChanged: true
                }
            }
        });
        this.registerAllTools();
    }
    /**
     * Daftarin semua tools yang tersedia
     * Tools ini dipake buat handle berbagai operasi di backend GASSAPI
     */
    registerAllTools() {
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
        // Register testing tools (enhanced with direct execution)
        TESTING_TOOLS.forEach(tool => {
            this.tools.set(tool.name, tool);
        });
        // Register flow tools (new direct execution)
        FLOW_TOOLS.forEach(tool => {
            this.tools.set(tool.name, tool);
        });
        logger.info(`Daftar ${this.tools.size} tool MCP udah terdaftar buat operasi GASSAPI`, { toolsCount: this.tools.size }, 'McpServer');
    }
    /**
     * Nyalain MCP server pake stdio transport
     * Server bakal jalan dan nunggu commands dari Claude Desktop
     */
    async start() {
        try {
            // Register MCP request handlers with proper schemas
            this.server.setRequestHandler(InitializeRequestSchema, this.handleInitialize.bind(this));
            this.server.setRequestHandler(ListToolsRequestSchema, this.handleListTools.bind(this));
            this.server.setRequestHandler(CallToolRequestSchema, this.handleToolCall.bind(this));
            // Create stdio transport
            const transport = new StdioServerTransport();
            logger.info('GASSAPI MCP Server mulai jalan nih...', { module: 'McpServer' });
            logger.info('Server capability: tools tersedia', { module: 'McpServer' });
            logger.info(`${this.tools.size} tools udah terdaftar`, { toolsCount: this.tools.size, module: 'McpServer' });
            await this.server.connect(transport);
            logger.info('GASSAPI MCP Server udah konek dan siap pakai', { module: 'McpServer' });
        }
        catch (error) {
            logger.error('Gagal mulai MCP server', { error: error instanceof Error ? error.message : String(error), module: 'McpServer' });
            throw error;
        }
    }
    /**
     * Nanganin MCP initialize request
     * Validate protocol version dan setup capabilities
     */
    async handleInitialize(request) {
        try {
            logger.info(`MCP client initialized: ${request.clientInfo.name}`, { clientName: request.clientInfo.name, module: 'McpServer' });
            // Validate protocol version
            if (!this.isProtocolVersionSupported(request.protocolVersion)) {
                throw new Error(`Unsupported protocol version: ${request.protocolVersion}`);
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
            logger.info('MCP initialization berhasil', { module: 'McpServer' });
            return result;
        }
        catch (error) {
            logger.error('MCP initialization gagal', { error: error instanceof Error ? error.message : String(error), module: 'McpServer' });
            throw error;
        }
    }
    /**
     * Nanganin tools/list request
     * Kembaliin daftar semua tools yang tersedia buat client
     */
    async handleListTools() {
        try {
            const toolList = Array.from(this.tools.values());
            logger.info(`Daftar tools diminta: ${toolList.length} tools tersedia`, { toolsCount: toolList.length, module: 'McpServer' });
            return {
                tools: toolList.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.inputSchema
                }))
            };
        }
        catch (error) {
            logger.error('Gagal nampilin daftar tools', { error: error instanceof Error ? error.message : String(error), module: 'McpServer' });
            throw error;
        }
    }
    /**
     * Nanganin tools/call request
     * Jalankan tool yang diminta sama client dan kembaliin hasilnya
     */
    async handleToolCall(request) {
        try {
            const { name, arguments: args } = request;
            logger.info(`Tool call: ${name}`, { toolName: name, arguments: args, module: 'McpServer' });
            if (!this.tools.has(name)) {
                throw new Error(`Unknown tool: ${name}`);
            }
            const tool = this.tools.get(name);
            // Route to appropriate tool handler
            let result;
            if (AUTH_TOOLS.some(t => t.name === name)) {
                result = await authTools.handleToolCall(name, args || {});
            }
            else if (ENVIRONMENT_TOOLS.some(t => t.name === name)) {
                result = await environmentTools.handleToolCall(name, args || {});
            }
            else if (COLLECTION_TOOLS.some(t => t.name === name)) {
                result = await collectionTools.handleToolCall(name, args || {});
            }
            else if (ENDPOINT_TOOLS.some(t => t.name === name)) {
                result = await endpointTools.handleToolCall(name, args || {});
            }
            else if (TESTING_TOOLS.some(t => t.name === name)) {
                result = await testingTools.handleToolCall(name, args || {});
            }
            else if (FLOW_TOOLS.some(t => t.name === name)) {
                result = await flowTools.handleToolCall(name, args || {});
            }
            else {
                throw new Error(`No handler found for tool: ${name}`);
            }
            logger.info(`Tool ${name} berhasil dijalanin`, { toolName: name, module: 'McpServer' });
            return {
                content: result.content || [],
                isError: result.isError || false
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error(`Tool ${request.name} gagal`, { toolName: request.name, error: error instanceof Error ? error.message : String(error), module: 'McpServer' });
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
    isProtocolVersionSupported(version) {
        const supportedVersions = ['2024-11-05', '2024-10-07'];
        return supportedVersions.includes(version);
    }
    /**
     * Get server status
     */
    getStatus() {
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
    getToolsByCategory() {
        return {
            authentication: AUTH_TOOLS,
            environment: ENVIRONMENT_TOOLS,
            collection: COLLECTION_TOOLS,
            endpoint: ENDPOINT_TOOLS,
            testing: TESTING_TOOLS,
            flow: FLOW_TOOLS
        };
    }
    /**
     * Add custom tool (for future extensions)
     */
    addCustomTool(tool) {
        this.tools.set(tool.name, tool);
        logger.info(`Custom tool ditambahin: ${tool.name}`, { toolName: tool.name, module: 'McpServer' });
    }
    /**
     * Remove tool by name
     */
    removeTool(toolName) {
        const removed = this.tools.delete(toolName);
        if (removed) {
            logger.info(`Tool dihapus: ${toolName}`, { toolName, module: 'McpServer' });
        }
        return removed;
    }
    /**
     * Matiin server dengan cara yang aman
     * Cleanup semua resources dan close connections
     */
    async shutdown() {
        try {
            logger.info('GASSAPI MCP server lagi dimatikan...', { module: 'McpServer' });
            if (this.server) {
                await this.server.close();
            }
            logger.info('GASSAPI MCP server berhasil dimatikan', { module: 'McpServer' });
        }
        catch (error) {
            logger.error('Error pas shutdown', { error: error instanceof Error ? error.message : String(error), module: 'McpServer' });
            throw error;
        }
    }
    /**
     * Health check for monitoring
     */
    async healthCheck() {
        try {
            const status = this.getStatus();
            return {
                status: 'ok',
                details: status,
                timestamp: Date.now()
            };
        }
        catch (error) {
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
    getDebugInfo() {
        const toolsByCategory = this.getToolsByCategory();
        const allTools = [
            ...toolsByCategory.authentication.map(t => ({ ...t, category: 'authentication' })),
            ...toolsByCategory.environment.map(t => ({ ...t, category: 'environment' })),
            ...toolsByCategory.collection.map(t => ({ ...t, category: 'collection' })),
            ...toolsByCategory.endpoint.map(t => ({ ...t, category: 'endpoint' })),
            ...toolsByCategory.testing.map(t => ({ ...t, category: 'testing' })),
            ...toolsByCategory.flow.map(t => ({ ...t, category: 'flow' }))
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
//# sourceMappingURL=McpServer.js.map