/**
 * Main entry point for endpoint management tools
 */

import { McpTool, McpToolResponse } from '../../types.js';
import { HttpMethod } from './types.js';
import { ENDPOINT_TOOLS } from './tools.js';
import { createEndpointToolHandlers } from './handlers.js';

// Export all tools
export { ENDPOINT_TOOLS };

// Legacy compatibility
export const TOOLS: McpTool[] = ENDPOINT_TOOLS;

// Export tool creators
export { createEndpointToolHandlers };

// Export handlers
export {
  handleListEndpoints,
  handleGetEndpointDetails,
  handleCreateEndpoint,
  handleUpdateEndpoint,
  handleMoveEndpoint
} from './handlers.js';

// Export tools individually
export {
  listEndpointsTool,
  getEndpointDetailsTool,
  createEndpointTool,
  updateEndpointTool,
  moveEndpointTool
} from './tools.js';

// Export types
export type { HttpMethod } from './types.js';
export type {
  EndpointListResponse,
  EndpointDetailsResponse,
  EndpointCreateResponse,
  EndpointUpdateResponse,
  EndpointMoveResponse,
  EndpointToolHandler
} from './types.js';

// Export utils
export {
  formatHeaders,
  parseHeaders,
  formatBody,
  validateEndpointData,
  validateUpdateData,
  formatEndpointListText,
  formatEndpointDetailsText,
  formatEndpointCreateText,
  formatEndpointUpdateText,
  formatEndpointMoveText
} from './utils.js';

// Export dependencies
export {
  getEndpointDependencies,
  resetDependencies
} from './dependencies.js';

// Legacy ToolHandlers class for backward compatibility
export class ToolHandlers {
  static async handleListEndpoints(args?: {
    project_id?: string;
    folder_id?: string;
    method?: HttpMethod;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.list_endpoints(args || {});
  }

  static async handleGetEndpointDetails(args: { endpoint_id: string }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.get_endpoint_details(args);
  }

  static async handleCreateEndpoint(args: {
    name: string;
    method: HttpMethod;
    url: string;
    folder_id: string;
    description?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.create_endpoint(args);
  }

  static async handleUpdateEndpoint(args: {
    endpoint_id: string;
    name?: string;
    method?: HttpMethod;
    url?: string;
    description?: string;
    headers?: Record<string, string>;
    body?: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.update_endpoint(args);
  }

  static async handleMoveEndpoint(args: {
    endpoint_id: string;
    new_folder_id: string;
  }): Promise<McpToolResponse> {
    const handlers = createEndpointToolHandlers();
    return handlers.move_endpoint(args);
  }
}

// Legacy function for backward compatibility
export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createEndpointToolHandlers();
}