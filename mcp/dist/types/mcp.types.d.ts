/**
 * MCP Protocol Type Definitions
 * Based on Model Context Protocol specification
 */
export interface McpTool {
    name: string;
    description: string;
    inputSchema: McpToolInputSchema;
}
export interface McpToolInputSchema {
    type: 'object';
    properties: Record<string, McpParameter>;
    required?: string[];
}
/**
 * Parameter definition for MCP tool input schema
 */
export interface McpParameter {
    /** Parameter data type */
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    /** Human-readable parameter description */
    description: string;
    /** Allowed values for this parameter */
    enum?: string[];
    /** Type definition for array items */
    items?: McpParameter;
    /** Default value if parameter is optional */
    default?: string | number | boolean | null | Record<string, unknown> | unknown[];
}
export interface McpResource {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}
export interface McpPrompt {
    name: string;
    description?: string;
    arguments?: McpPromptArgument[];
}
export interface McpPromptArgument {
    name: string;
    description?: string;
    required?: boolean;
}
export interface McpServerCapabilities {
    tools?: McpToolCapability;
    resources?: McpResourceCapability;
    prompts?: McpPromptCapability;
}
export interface McpToolCapability {
    listChanged?: boolean;
}
export interface McpResourceCapability {
    subscribe?: boolean;
    listChanged?: boolean;
}
export interface McpPromptCapability {
    listChanged?: boolean;
}
export interface McpInitializeRequest {
    protocolVersion: string;
    capabilities: McpClientCapabilities;
    clientInfo: McpClientInfo;
}
/**
 * Client capabilities advertised during MCP initialization
 */
export interface McpClientCapabilities {
    /** Experimental features supported by the client */
    experimental?: Record<string, unknown>;
    /** Sampling capabilities for AI model interaction */
    sampling?: McpSamplingCapability;
}
export interface McpSamplingCapability {
    [key: string]: unknown;
}
export interface McpClientInfo {
    name: string;
    version: string;
}
export interface McpInitializeResult {
    protocolVersion: string;
    capabilities: McpServerCapabilities;
    serverInfo: McpServerInfo;
}
/**
 * Server status information for health checks
 */
export interface McpServerStatus {
    /** Overall server health status */
    status: "error" | "ok";
    /** Additional status context or metrics */
    details?: Record<string, unknown>;
    /** Unix timestamp of status report */
    timestamp: number;
    /** Error message if status is 'error' */
    error?: string;
}
export interface McpServerInfo {
    name: string;
    version: string;
}
export interface McpToolCallRequest {
    name: string;
    arguments?: Record<string, unknown>;
}
export interface McpToolResponse {
    content: McpContent[];
    isError?: boolean;
}
export interface McpContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}
export interface McpListToolsResponse {
    tools: McpTool[];
}
export interface McpListResourcesResponse {
    resources: McpResource[];
}
export interface McpListPromptsResponse {
    prompts: McpPrompt[];
}
export interface McpReadResourceRequest {
    uri: string;
}
export interface McpReadResourceResponse {
    contents: McpResourceContent[];
}
export interface McpResourceContent {
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
}
export interface GassapiProjectContext {
    project: GassapiProject;
    environments: GassapiEnvironment[];
    collections?: GassapiCollection[];
    endpoints?: GassapiEndpoint[];
}
export interface GassapiProject {
    id: string;
    name: string;
    description?: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}
export interface GassapiEnvironment {
    id: string;
    project_id: string;
    name: string;
    variables: Record<string, string>;
    is_default: boolean;
    created_at: string;
    updated_at: string;
}
export interface GassapiCollection {
    id: string;
    project_id?: string;
    parent_id?: string;
    name: string;
    description?: string;
    endpoint_count?: number;
    endpoints?: GassapiEndpoint[];
    children?: string[];
    created_at: string;
    updated_at: string;
}
/**
 * GASSAPI endpoint representation for MCP tools
 */
export interface GassapiEndpoint {
    /** Unique endpoint identifier */
    id: string;
    /** Parent collection identifier */
    collection_id: string;
    /** Human-readable endpoint name */
    name: string;
    /** HTTP method for this endpoint */
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
    /** Endpoint URL path */
    url: string;
    /** Default headers for endpoint requests */
    headers?: Record<string, string>;
    /** Default request body template */
    body?: Record<string, unknown> | unknown[] | string | null;
    /** Optional description of endpoint purpose */
    description?: string;
    /** Collection reference (for API responses) */
    collection?: {
        id: string;
        name: string;
    };
    /** ISO timestamp when endpoint was created */
    created_at: string;
    /** ISO timestamp when endpoint was last updated */
    updated_at: string;
}
/**
 * GASSAPI test execution result for MCP tools
 */
export interface GassapiTestResult {
    /** Test execution identifier */
    id: string;
    /** Endpoint that was tested */
    endpoint_id: string;
    /** Environment used for testing */
    environment_id: string;
    /** HTTP status code received */
    status: number;
    /** Response time in milliseconds */
    response_time: number;
    /** Raw response body (parsed if JSON) */
    response_body?: Record<string, unknown> | unknown[] | string | null;
    /** Error message if test failed */
    error?: string;
    /** ISO timestamp when test was executed */
    created_at: string;
}
/**
 * MCP message types for protocol communication
 */
export type McpMessageType = 'initialize' | 'initialized' | 'list_tools' | 'call_tool' | 'list_resources' | 'read_resource' | 'list_prompts' | 'get_prompt' | 'ping' | 'error';
/**
 * Base MCP message structure
 */
export interface McpMessage {
    /** JSON-RPC protocol version (always "2.0") */
    jsonrpc: "2.0";
    /** Unique message identifier */
    id?: string | number;
    /** Message method/type */
    method: McpMessageType;
    /** Message parameters (method-specific) */
    params?: Record<string, unknown>;
}
/**
 * MCP error response structure
 */
export interface McpError {
    /** Error code (JSON-RPC standard) */
    code: number;
    /** Human-readable error message */
    message: string;
    /** Additional error data */
    data?: unknown;
}
/**
 * MCP tool call context information
 */
export interface McpToolCallContext {
    /** User identifier making the request */
    userId?: string;
    /** Session identifier for the conversation */
    sessionId?: string;
    /** Request identifier for tracking */
    requestId?: string;
    /** Additional context metadata */
    metadata?: Record<string, unknown>;
}
/**
 * Generic tool handler function signature
 */
export interface McpToolHandler {
    (toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
/**
 * Environment variable structure from GASSAPI API
 */
export interface GassapiEnvironmentVariable {
    id?: string;
    environment_id?: string;
    key: string;
    value: string;
    enabled: boolean;
    description?: string;
    created_at?: string;
    updated_at?: string;
}
/**
 * Environment variable import structure for bulk operations
 */
export interface GassapiEnvironmentVariableImport {
    key: string;
    value: string;
    enabled?: boolean;
    description?: string;
}
/**
 * Test result structure for API testing
 */
export interface GassapiTestExecution {
    id: string;
    endpoint_id: string;
    environment_id: string;
    status: number;
    response_time: number;
    response_body?: Record<string, unknown> | unknown[] | string | number | null;
    response_headers?: Record<string, string>;
    error?: string;
    created_at: string;
    executed_by?: string;
}
/**
 * Project configuration data
 */
export interface GassapiProjectConfig {
    id: string;
    name: string;
    description?: string;
    settings: {
        timeout?: number;
        retries?: number;
        environment?: string;
    };
    created_at: string;
    updated_at: string;
}
/**
 * Log metadata structure for consistent typing
 */
export interface LogMetadata {
    [key: string]: unknown;
    /** Optional timestamp override */
    timestamp?: number;
    /** Optional source identifier */
    source?: string;
    /** Optional correlation ID for request tracking */
    correlationId?: string;
    /** Optional user context */
    userId?: string;
    /** Optional session context */
    sessionId?: string;
}
/**
 * Collection tree node for hierarchical collection display
 */
export interface CollectionTreeNode {
    collection: GassapiCollection;
    children: CollectionTreeNode[];
    endpointCount?: number;
    endpoint_count?: number;
}
//# sourceMappingURL=mcp.types.d.ts.map