/**
 * Handler for create endpoint tool
 */

import { McpToolResponse } from '../../../types.js';
import { HttpMethod } from '../types.js';
import { EndpointCreateResponse } from '../types.js';
import {
  getEndpointDependencies
} from '../dependencies.js';
import {
  formatHeaders,
  formatBody,
  validateEndpointData,
  formatEndpointCreateText
} from '../utils.js';
import { getApiEndpoints } from '../../../lib/api/endpoints.js';

/**
 * Handle create endpoint request
 */
export async function handleCreateEndpoint(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    const { configManager, backendClient } = await getEndpointDependencies();

    const name = args.name as string;
    const method = args.method as HttpMethod;
    const url = args.url as string;
    const folderId = args.folder_id as string;
    const description = args.description as string | undefined;
    const headers = args.headers as Record<string, string> | undefined;
    const body = args.body as string | undefined;

    // Validate input
    const validationErrors = validateEndpointData({ name, method, url, folder_id: folderId });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    // Create endpoint
    const apiEndpoints = getApiEndpoints();
    const endpoint = apiEndpoints.getEndpoint('endpointCreate', { id: folderId });

    const requestBody = JSON.stringify({
      name: name.trim(),
      method,
      url: url.trim(),
      description: description?.trim() || null,
      headers: formatHeaders(headers || {}),
      body: formatBody(body) || null
    });

    console.error(`[EndpointTools] Creating endpoint at: ${endpoint}`);
    console.error(`[EndpointTools] Folder ID: ${folderId}`);
    console.error(`[EndpointTools] Base URL: ${backendClient.getBaseUrl()}`);
    console.error(`[EndpointTools] Token: ${backendClient.getToken().substring(0, 20)}...`);
    console.error(`[EndpointTools] Request Body: ${requestBody}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    let apiResponse;
    try {
      const result = await fetch(`${backendClient.getBaseUrl()}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${backendClient.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }

      const data = await result.json() as EndpointCreateResponse;

      apiResponse = {
        success: data.success,
        data: data.data,
        message: data.message,
        status: result.status
      };
    } catch (networkError) {
      clearTimeout(timeoutId);
      throw networkError;
    }

    if (!apiResponse.success) {
      let errorMessage = `Failed to create endpoint: ${apiResponse.message || 'Unknown error'}`;

      // Provide helpful error messages for common scenarios
      if (apiResponse.status === 404) {
        errorMessage = `Folder with ID '${folderId}' not found. Cannot create endpoint.\n\n`;
        errorMessage += `Please check:\n`;
        errorMessage += `• Folder ID '${folderId}' is correct\n`;
        errorMessage += `• You have access to this folder\n`;
        errorMessage += `• Folder exists in the project\n\n`;
        errorMessage += `Use get_folders to see available folders, or create a new folder first.`;
      } else if (apiResponse.status === 403) {
        errorMessage = `Access denied. You don't have permission to create endpoints in this folder.\n\n`;
        errorMessage += `Please check:\n`;
        errorMessage += `• You are a member of the project\n`;
        errorMessage += `• Your account has write permissions for this folder`;
      } else if (apiResponse.status === 400) {
        errorMessage = `Invalid endpoint data. Please check:\n`;
        errorMessage += `• Endpoint name is not empty\n`;
        errorMessage += `• URL is valid and properly formatted\n`;
        errorMessage += `• HTTP method is valid (GET, POST, PUT, DELETE, PATCH)\n`;
        errorMessage += `• Headers are valid JSON if provided`;
      }

      throw new Error(errorMessage);
    }

    if (apiResponse.success && apiResponse.data) {
      const createText = formatEndpointCreateText(apiResponse.data);

      return {
        content: [
          {
            type: 'text',
            text: createText
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to create endpoint: ${apiResponse.message || 'Unknown error'}`
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
          text: `❌ Endpoint creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}