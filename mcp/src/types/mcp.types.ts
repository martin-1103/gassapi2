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

export interface McpParameter {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  enum?: string[];
  items?: McpParameter;
  default?: any;
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

export interface McpClientCapabilities {
  experimental?: Record<string, any>;
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

export interface McpServerStatus {
  status: "error" | "ok";
  details?: any;
  timestamp: number;
  error?: string;
}

export interface McpServerInfo {
  name: string;
  version: string;
}

export interface McpToolCallRequest {
  name: string;
  arguments?: Record<string, any>;
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

// GASSAPI-specific MCP types
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
  project_id: string;
  parent_id?: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GassapiEndpoint {
  id: string;
  collection_id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Record<string, string>;
  body?: any;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GassapiTestResult {
  id: string;
  endpoint_id: string;
  environment_id: string;
  status: number;
  response_time: number;
  response_body?: any;
  error?: string;
  created_at: string;
}