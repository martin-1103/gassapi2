/**
 * Centralized API Endpoints Management for GASSAPI MCP v2
 * Replaces hardcoded paths with configurable endpoints
 */

export interface ApiEndpoints {
  // Environment endpoints
  projectEnvironments: string;
  environmentDetails: string;
  environmentUpdate: string;
  environmentVariables: string;

  // Folder endpoints
  projectFolders: string;
  folderDetails: string;
  folderCreate: string;
  folderUpdate: string;
  folderDelete: string;

  // Endpoint endpoints
  endpointDetails: string;
  endpointCreate: string;
  endpointUpdate: string;
  endpointDelete: string;
  endpointTest: string;
  endpointList: string;
  projectEndpointsList: string;

  // Flow endpoints
  flowDetails: string;
  flowCreate: string;
  flowUpdate: string;
  flowDelete: string;
  flowExecute: string;
  flowList: string;
  flowTest: string;
  flowValidate: string;

  // Testing endpoints
  endpointTestDirect: string;
  environmentVariablesDirect: string;

  // Auth endpoints
  tokenValidate: string;
  projectContext: string;
}

/**
 * Default API endpoints configuration
 */
export const DEFAULT_API_ENDPOINTS: ApiEndpoints = {
  // Environment endpoints
  projectEnvironments: '/gassapi2/backend/?act=project_environments&id={id}',
  environmentDetails: '/gassapi2/backend/?act=environment&id={id}',
  environmentUpdate: '/gassapi2/backend/?act=environment_update&id={id}',
  environmentVariables: '/gassapi2/backend/?act=environment_variables&id={id}',

  // Folder endpoints
  projectFolders: '/gassapi2/backend/?act=project_folders&id={id}',
  folderDetails: '/gassapi2/backend/?act=folder&id={id}',
  folderCreate: '/gassapi2/backend/?act=folder_create&id={project_id}',
  folderUpdate: '/gassapi2/backend/?act=folder_update&id={id}',
  folderDelete: '/gassapi2/backend/?act=folder_delete&id={id}',

  // Endpoint endpoints
  endpointDetails: '/gassapi2/backend/?act=endpoint&id={id}',
  endpointCreate: '/gassapi2/backend/?act=endpoint_create&id={id}',
  endpointUpdate: '/gassapi2/backend/?act=endpoint_update&id={id}',
  endpointDelete: '/gassapi2/backend/?act=endpoint_delete&id={id}',
  endpointTest: '/gassapi2/backend/?act=endpoint_test',
  endpointList: '/gassapi2/backend/?act=endpoints_list&id={id}',
  projectEndpointsList: '/gassapi2/backend/?act=project_endpoints_list&id={project_id}',

  // Flow endpoints
  flowDetails: '/gassapi2/backend/?act=flow&id={id}',
  flowCreate: '/gassapi2/backend/?act=flow_create&id={project_id}',
  flowUpdate: '/gassapi2/backend/?act=flow_update&id={id}',
  flowDelete: '/gassapi2/backend/?act=flow_delete&id={id}',
  flowExecute: '/gassapi2/backend/?act=flow_execute',
  flowList: '/gassapi2/backend/?act=flows&id={project_id}',
  flowTest: '/gassapi2/backend/?act=flow_test',
  flowValidate: '/gassapi2/backend/?act=flow_validate',

  // Testing endpoints
  endpointTestDirect: '/gassapi2/backend/?act=endpoint&id={id}',
  environmentVariablesDirect: '/gassapi2/backend/?act=environment_variables&id={id}',

  // Auth endpoints
  tokenValidate: '/api/v1/auth/validate',
  projectContext: '/gassapi2/backend/?act=project&id={id}'
};

/**
 * API Endpoints Manager
 */
export class ApiEndpointsManager {
  private endpoints: ApiEndpoints;

  constructor(customEndpoints?: Partial<ApiEndpoints>) {
    this.endpoints = { ...DEFAULT_API_ENDPOINTS, ...customEndpoints };
  }

  /**
   * Get endpoint with variable substitution
   */
  getEndpoint(key: keyof ApiEndpoints, variables?: Record<string, string>): string {
    let endpoint = this.endpoints[key];

    if (variables) {
      Object.entries(variables).forEach(([varName, value]) => {
        endpoint = endpoint.replace(new RegExp(`{${varName}}`, 'g'), encodeURIComponent(value));
      });
    }

    return endpoint;
  }

  /**
   * Update specific endpoint
   */
  updateEndpoint(key: keyof ApiEndpoints, value: string): void {
    this.endpoints[key] = value;
  }

  /**
   * Get all endpoints
   */
  getAllEndpoints(): ApiEndpoints {
    return { ...this.endpoints };
  }

  /**
   * Validate endpoint variables
   */
  validateEndpoint(key: keyof ApiEndpoints, variables?: Record<string, string>): { valid: boolean; missing: string[] } {
    const endpoint = this.endpoints[key];
    const missing: string[] = [];

    if (variables) {
      const matches = endpoint.match(/{([^}]+)}/g);
      if (matches) {
        matches.forEach(match => {
          const varName = match.slice(1, -1); // Remove { }
          if (!variables[varName]) {
            missing.push(varName);
          }
        });
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }
}

/**
 * Global API endpoints instance
 */
let globalApiEndpoints: ApiEndpointsManager | null = null;

/**
 * Get global API endpoints instance
 */
export function getApiEndpoints(): ApiEndpointsManager {
  if (!globalApiEndpoints) {
    globalApiEndpoints = new ApiEndpointsManager();
  }
  return globalApiEndpoints;
}

/**
 * Set global API endpoints configuration
 */
export function setApiEndpoints(customEndpoints: Partial<ApiEndpoints>): void {
  globalApiEndpoints = new ApiEndpointsManager(customEndpoints);
}