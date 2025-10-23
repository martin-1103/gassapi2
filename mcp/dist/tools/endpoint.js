"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENDPOINT_TOOLS = exports.endpointTools = exports.EndpointTools = void 0;
const ConfigLoader_1 = require("../discovery/ConfigLoader");
const BackendClient_1 = require("../client/BackendClient");
/**
 * Endpoint Management MCP Tools
 * Handles API endpoint configuration operations
 */
const get_endpoint_details = {
    name: 'get_endpoint_details',
    description: 'Get detailed endpoint configuration with collection information',
    inputSchema: {
        type: 'object',
        properties: {
            endpointId: {
                type: 'string',
                description: 'Endpoint UUID to get details for'
            },
            includeCollection: {
                type: 'boolean',
                description: 'Include collection information in response',
                default: true
            }
        },
        required: ['endpointId']
    }
};
const create_endpoint = {
    name: 'create_endpoint',
    description: 'Create new endpoint in collection',
    inputSchema: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Endpoint display name'
            },
            method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                description: 'HTTP method'
            },
            url: {
                type: 'string',
                description: 'Endpoint URL (relative or absolute)'
            },
            headers: {
                type: 'object',
                description: 'Default request headers',
                default: {}
            },
            body: {
                type: 'object',
                description: 'Default request body (for POST/PUT/PATCH)'
            },
            collectionId: {
                type: 'string',
                description: 'Collection UUID to add endpoint to'
            },
            description: {
                type: 'string',
                description: 'Endpoint description'
            }
        },
        required: ['name', 'method', 'url', 'collectionId']
    }
};
const update_endpoint = {
    name: 'update_endpoint',
    description: 'Update existing endpoint configuration',
    inputSchema: {
        type: 'object',
        properties: {
            endpointId: {
                type: 'string',
                description: 'Endpoint UUID to update'
            },
            name: {
                type: 'string',
                description: 'New endpoint name'
            },
            method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                description: 'New HTTP method'
            },
            url: {
                type: 'string',
                description: 'New endpoint URL'
            },
            headers: {
                type: 'object',
                description: 'New request headers'
            },
            body: {
                type: 'object',
                description: 'New default request body'
            },
            description: {
                type: 'string',
                description: 'New endpoint description'
            }
        },
        required: ['endpointId']
    }
};
const move_endpoint = {
    name: 'move_endpoint',
    description: 'Move endpoint to different collection',
    inputSchema: {
        type: 'object',
        properties: {
            endpointId: {
                type: 'string',
                description: 'Endpoint UUID to move'
            },
            newCollectionId: {
                type: 'string',
                description: 'Target collection UUID'
            }
        },
        required: ['endpointId', 'newCollectionId']
    }
};
class EndpointTools {
    configLoader;
    backendClient = null;
    constructor() {
        this.configLoader = new ConfigLoader_1.ConfigLoader();
    }
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
        }
        this.backendClient = new BackendClient_1.BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
        return this.backendClient;
    }
    /**
     * Get detailed endpoint information
     */
    async getEndpointDetails(args) {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const client = await this.getBackendClient();
            const result = await client.getEndpointDetails(args.endpointId);
            const includeCollection = args.includeCollection !== false;
            let detailsText = `🔌 Endpoint Details

Endpoint Information:
- Name: ${result.name || 'N/A'}
- Method: ${result.method || 'N/A'}
- URL: ${result.url || 'N/A'}
- ID: ${result.id}
- Description: ${result.description || 'No description'}
- Created: ${new Date(result.created_at).toLocaleString()}
- Updated: ${new Date(result.updated_at).toLocaleString()}`;
            if (includeCollection && result.collection) {
                detailsText += `

Collection Information:
- Name: ${result.collection.name}
- ID: ${result.collection.id}`;
                if (result.collection.parent_id) {
                    detailsText += `
- Parent ID: ${result.collection.parent_id}`;
                }
            }
            if (result.headers && Object.keys(result.headers).length > 0) {
                detailsText += `

Default Headers:`;
                Object.entries(result.headers).forEach(([key, value]) => {
                    detailsText += `\n- ${key}: ${value}`;
                });
            }
            if (result.body) {
                const bodyText = typeof result.body === 'string'
                    ? result.body
                    : JSON.stringify(result.body, null, 2);
                detailsText += `

Default Body:
\`\`\`
${bodyText}
\`\`\``;
            }
            if (result.test_results && result.test_results.length > 0) {
                detailsText += `

Recent Test Results:`;
                result.test_results.slice(-3).forEach((test, index) => {
                    const status = test.status >= 200 && test.status < 300 ? '🟢' : '🔴';
                    detailsText += `\n${index + 1}. ${status} ${test.status} (${test.response_time}ms) - ${new Date(test.created_at).toLocaleString()}`;
                });
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: detailsText
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Failed to Get Endpoint Details

Error: ${errorMessage}

Please check:
1. Endpoint ID is correct
2. Have access to the endpoint
3. Backend server is accessible`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Create new endpoint
     */
    async createEndpoint(args) {
        try {
            const client = await this.getBackendClient();
            const endpointData = {
                name: args.name,
                method: args.method,
                url: args.url,
                headers: args.headers || {},
                body: args.body || null,
                collection_id: args.collectionId,
                description: args.description || undefined
            };
            const result = await client.createEndpoint(endpointData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Endpoint Created

Endpoint Details:
- Name: ${args.name}
- Method: ${args.method}
- URL: ${args.url}
- Collection ID: ${args.collectionId}
- ID: ${result.id}
- Description: ${args.description || 'No description'}

Headers: ${args.headers ? Object.keys(args.headers).length : 0} configured
Body: ${args.body ? 'Configured' : 'Not configured'}

Endpoint "${args.name}" created successfully!

You can now:
1. Test the endpoint using test_endpoint tool
2. Add more endpoints to the same collection
3. Create automated test flows`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Failed to Create Endpoint

Error: ${errorMessage}

Please check:
1. Collection ID is valid
2. Endpoint name and URL format
3. HTTP method is supported
4. Have write access to the collection`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Update existing endpoint
     */
    async updateEndpoint(args) {
        try {
            const client = await this.getBackendClient();
            const updateData = {};
            // Only include fields that are being updated
            if (args.name !== undefined)
                updateData.name = args.name;
            if (args.method !== undefined)
                updateData.method = args.method;
            if (args.url !== undefined)
                updateData.url = args.url;
            if (args.headers !== undefined)
                updateData.headers = args.headers;
            if (args.body !== undefined)
                updateData.body = args.body;
            if (args.description !== undefined)
                updateData.description = args.description;
            const result = await client.updateEndpoint(args.endpointId, updateData);
            const changes = Object.keys(updateData).map(key => `- ${key}: ${updateData[key]}`).join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Endpoint Updated

Update Details:
- Endpoint ID: ${args.endpointId}
- Changes Made:
${changes}
- Updated At: ${new Date().toLocaleString()}

Endpoint updated successfully!

Changes are now active and will be used in subsequent tests.`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Failed to Update Endpoint

Error: ${errorMessage}

Please check:
1. Endpoint ID is correct
2. Updated fields are valid
3. Have write access to the endpoint
4. No conflicts with other endpoints`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Move endpoint to different collection
     */
    async moveEndpoint(args) {
        try {
            const client = await this.getBackendClient();
            const result = await client.moveEndpoint(args.endpointId, args.newCollectionId);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Endpoint Moved

Move Operation:
- Endpoint ID: ${args.endpointId}
- New Collection: ${args.newCollectionId}
- Result: Success
- Moved At: ${new Date().toLocaleString()}

Endpoint moved successfully!

The endpoint is now part of the target collection and will appear in that collection's endpoint list.`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Failed to Move Endpoint

Error: ${errorMessage}

Please check:
1. Endpoint ID exists and is accessible
2. Target collection ID is valid
3. Have write access to both collections
4. No circular references in the move`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * List all endpoints with optional filtering
     */
    async listEndpoints(args) {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const client = await this.getBackendClient();
            const result = await client.getEndpoints(args.collectionId, args.projectId);
            if (!result.endpoints || result.endpoints.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🔌 Endpoints

${args.collectionId ? `Collection: ${args.collectionId}` : args.projectId ? `Project: ${args.projectId}` : 'Global'}
Result: No endpoints found

To add endpoints:
1. Use create_endpoint tool
2. Import from API documentation
3. Clone from existing endpoints`
                        }
                    ]
                };
            }
            const endpointList = result.endpoints.map((endpoint, index) => `${index + 1}. ${endpoint.method} ${endpoint.url} (${endpoint.name}) - Collection: ${endpoint.collection?.name || 'N/A'}`).join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `🔌 Project Endpoints

${args.collectionId ? `Collection: ${args.collectionId}` : args.projectId ? `Project: ${args.projectId}` : 'Global'}
Total Endpoints: ${result.endpoints.length}

Endpoints:
${endpointList}

Use endpointId for specific operations.`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Failed to List Endpoints

Error: ${errorMessage}

Please check:
1. Collection/Project ID is correct
2. MCP token has proper access
3. Backend server is accessible`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Get endpoint tools list
     */
    getTools() {
        return [
            get_endpoint_details,
            create_endpoint,
            update_endpoint,
            move_endpoint
        ];
    }
    /**
     * Handle tool calls
     */
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'get_endpoint_details':
                return this.getEndpointDetails(args);
            case 'create_endpoint':
                return this.createEndpoint(args);
            case 'update_endpoint':
                return this.updateEndpoint(args);
            case 'move_endpoint':
                return this.moveEndpoint(args);
            case 'list_endpoints':
                return this.listEndpoints(args);
            default:
                throw new Error(`Unknown endpoint tool: ${toolName}`);
        }
    }
}
exports.EndpointTools = EndpointTools;
// Export for MCP server registration
exports.endpointTools = new EndpointTools();
exports.ENDPOINT_TOOLS = [
    get_endpoint_details,
    create_endpoint,
    update_endpoint,
    move_endpoint
];
//# sourceMappingURL=endpoint.js.map