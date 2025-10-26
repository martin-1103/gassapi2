/**
 * Endpoint Management Tools for GASSAPI MCP v2
 * Migrated from original endpoint tools with backend adaptation
 *
 * This file has been refactored into modular components.
 * All functionality is preserved while improving maintainability.
 */

// Re-export everything from the new modular structure
export {
  // Main exports
  ENDPOINT_TOOLS,
  TOOLS,
  createEndpointToolHandlers,

  // Tools
  listEndpointsTool,
  getEndpointDetailsTool,
  createEndpointTool,
  updateEndpointTool,

  // Handlers
  handleListEndpoints,
  handleGetEndpointDetails,
  handleCreateEndpoint,
  handleUpdateEndpoint,

  // Types
  type HttpMethod,
  type EndpointListResponse,
  type EndpointDetailsResponse,
  type EndpointCreateResponse,
  type EndpointUpdateResponse,
  type EndpointMoveResponse,
  type EndpointToolHandler,

  // Utils
  formatHeaders,
  parseHeaders,
  formatBody,
  validateEndpointData,
  validateUpdateData,
  formatEndpointListText,
  formatEndpointDetailsText,
  formatEndpointCreateText,
  formatEndpointUpdateText,

  // Dependencies
  getEndpointDependencies,
  resetDependencies,

  // Legacy compatibility
  ToolHandlers,
  createToolHandlers
} from './endpoints/index.js';

