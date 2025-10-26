/**
 * Handler for list endpoints tool
 */

import { McpToolResponse } from '../../../types.js';
import { HttpMethod } from '../types.js';
import { EndpointListResponse } from '../types.js';
import { getEndpointDependencies } from '../dependencies.js';
import { formatEndpointListText } from '../utils.js';
import { getApiEndpoints } from '../../../lib/api/endpoints.js';

/**
 * Handle list endpoints request
 */
export async function handleListEndpoints(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    const { configManager, backendClient } = await getEndpointDependencies();

    // Get project ID from args or config
    let projectId = args.project_id as string | undefined;
    if (!projectId) {
      const config = await configManager.detectProjectConfig();
      projectId = config?.project?.id;
      if (!projectId) {
        throw new Error('Project ID not found in config and not provided in arguments');
      }
    }

    const folderId = args.folder_id as string | undefined;
    const method = args.method as HttpMethod | undefined;

    // Build query parameters for endpoint_list
    const apiEndpoints = getApiEndpoints();
    let endpoint: string;

    if (folderId) {
      // List endpoints for a specific folder
      endpoint = apiEndpoints.getEndpoint('endpointList', { id: folderId });
    } else {
      // List all endpoints for the project
      endpoint = apiEndpoints.getEndpoint('projectEndpointsList', { project_id: projectId });
    }

    const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

    console.error(`[EndpointTools] Requesting endpoints from: ${fullUrl}`);

    // Use BackendClient.makeRequest for consistent authentication like get_project_context
    const response = await backendClient.makeRequest(endpoint, {
      method: 'GET'
    });

    if (!response.success) {
      let errorMessage = `Failed to list endpoints: ${response.error || response.message || 'Unknown error'}`;

      // Provide helpful error messages for common scenarios
      if (response.status === 404) {
        if (folderId) {
          errorMessage = `Folder with ID '${folderId}' not found. Please check:\n`;
          errorMessage += `• Folder ID is correct\n`;
          errorMessage += `• You have access to this folder\n`;
          errorMessage += `• Folder exists in the project\n\n`;
          errorMessage += `Try using project-wide listing by omitting folder_id parameter, or use get_folders to see available folders.`;
        } else {
          errorMessage = `Endpoints not found. This might indicate:\n`;
          errorMessage += `• No endpoints exist in this project\n`;
          errorMessage += `• Project ID is invalid or you don't have access\n`;
          errorMessage += `• Use create_endpoint to add your first endpoint`;
        }
      } else if (response.status === 403) {
        errorMessage = `Access denied. You don't have permission to view endpoints in this project. Please check:\n`;
        errorMessage += `• You are a member of the project\n`;
        errorMessage += `• Your account has proper permissions`;
      }

      throw new Error(errorMessage);
    }

    if (response.success && response.data) {
      // Handle nested response structure from backend
      const responseData = response.data as any;
      const endpointsData = responseData.data || responseData;
      const endpoints = Array.isArray(endpointsData) ? endpointsData : [];
      const endpointText = formatEndpointListText(endpoints, folderId, method);

      return {
        content: [
          {
            type: 'text',
            text: endpointText
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to list endpoints: ${response.error || 'Unknown error'}`
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Endpoints list error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}