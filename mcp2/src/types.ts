/**
 * MCP Type Definitions for GASSAPI Server v2
 * Compatible with original MCP types
 */

// Core MCP Tool interface (compatible with original)
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

export interface McpParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: McpParameter;
  default?: string | number | boolean | null;
  additionalProperties?: boolean | McpParameter;
}

// MCP Request/Response Types (compatible with original)
export interface McpInitializeRequest {
  clientInfo: {
    name: string;
    version: string;
  };
  protocolVersion: string;
  capabilities: any;
}

export interface McpInitializeResult {
  protocolVersion: string;
  capabilities: {
    tools: {
      listChanged?: boolean;
    };
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface McpListToolsResponse {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: McpToolInputSchema;
  }>;
}

export interface McpToolCallRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface McpToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface McpServerStatus {
  status: 'ok' | 'error';
  details?: any;
  error?: string;
  timestamp: number;
}

// Legacy compatibility (for migration)
export interface Tool extends McpTool {}
export interface ToolResponse extends McpToolResponse {}
export interface ToolInputSchema extends McpToolInputSchema {}
export interface Parameter extends McpParameter {}

export interface InitializeRequest {
  clientInfo: {
    name: string;
    version: string;
  };
  protocolVersion: string;
  capabilities: any;
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: {
    tools: {
      listChanged?: boolean;
    };
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

export interface ListToolsResult {
  tools: Array<{
    name: string;
    description: string;
    inputSchema: ToolInputSchema;
  }>;
}

export interface CallToolRequest {
  name: string;
  arguments?: Record<string, any>;
}

export interface ServerStatus {
  status: 'ok' | 'error';
  details?: any;
  error?: string;
  timestamp: number;
}