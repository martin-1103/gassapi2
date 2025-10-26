/**
 * Environment Module Index
 * Main entry point for environment operations
 */

// Export tools
export {
  environmentTools,
  listEnvironmentsTool,
  getEnvironmentDetailsTool,
  createEnvironmentTool,
  updateEnvironmentVariablesTool,
  setDefaultEnvironmentTool,
  deleteEnvironmentTool
} from './tools.js';

// Export handlers
export { handleListEnvironments } from './handlers/listHandler.js';
export {
  handleGetEnvironmentDetails,
  handleCreateEnvironment,
  handleDeleteEnvironment
} from './handlers/detailsHandler.js';
export {
  handleUpdateEnvironmentVariables,
  handleSetDefaultEnvironment
} from './handlers/updateHandler.js';

// Export services
export { EnvironmentService } from './services/EnvironmentService.js';

// Export types
export * from './types.js';