/**
 * Handler for update endpoint tool
 */

import { McpToolResponse } from '../../../types.js';
import { HttpMethod } from '../types.js';
import { EndpointUpdateResponse } from '../types.js';
import {
  getEndpointDependencies
} from '../dependencies.js';
import {
  formatHeaders,
  formatBody,
  validateUpdateData,
  formatEndpointUpdateText,
  formatEndpointMoveText
} from '../utils.js';
import { getApiEndpoints } from '../../../lib/api/endpoints.js';

/**
 * Handle update endpoint request
 */
export async function handleUpdateEndpoint(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    console.error('[UPDATE-HANDLER] Starting update endpoint with args:', args);
    console.error('[UPDATE-HANDLER] About to get dependencies...');
    const { configManager, backendClient } = await getEndpointDependencies();
    console.error('[UPDATE-HANDLER] Dependencies loaded successfully');

    const endpointId = args.endpoint_id as string;
    const name = args.name as string | undefined;
    const method = args.method as HttpMethod | undefined;
    const url = args.url as string | undefined;
    const description = args.description as string | undefined;
    const headers = args.headers as Record<string, string> | undefined;
    const body = args.body as string | undefined;

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (method !== undefined) updateData.method = method;
    if (url !== undefined) updateData.url = url.trim();
    if (description !== undefined) updateData.description = description.trim() || null;
    if (headers !== undefined) updateData.headers = formatHeaders(headers);
    if (body !== undefined) updateData.body = formatBody(body);

    // Validate
    const validationErrors = validateUpdateData({ endpoint_id: endpointId, updateData });
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    // Update endpoint using BackendClient
    console.error(`[EndpointTools] Updating endpoint: ${endpointId}`);

    const result = await backendClient.updateEndpoint(endpointId, updateData);

    if (!result.success) {
      throw new Error(`Failed to update endpoint: ${result.error || 'Unknown error'}`);
    }

    if (result.data) {
      const updateText = formatEndpointUpdateText(result.data);

      return {
        content: [
          {
            type: 'text',
            text: updateText
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to update endpoint: No data returned`
          }
        ],
        isError: true
      };
    }
  } catch (error) {
    console.error('[UPDATE-HANDLER] Error caught:', error);
    return {
      content: [
        {
          type: 'text',
          text: `❌ Endpoint update error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}

/**
 * Handle move endpoint request
 */
export async function handleMoveEndpoint(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    const { configManager, backendClient } = await getEndpointDependencies();

    const endpointId = args.endpoint_id as string;
    const newFolderId = args.new_folder_id as string;

    if (!endpointId) {
      throw new Error('Endpoint ID is required');
    }
    if (!newFolderId) {
      throw new Error('New folder ID is required');
    }

    // Move endpoint (using update endpoint with folder_id)
    const apiEndpoints = getApiEndpoints();
    const endpoint = apiEndpoints.getEndpoint('endpointUpdate', { id: endpointId });
    const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

    console.error(`[EndpointTools] Moving endpoint at: ${fullUrl}`);

    const result = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${backendClient.getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        folder_id: newFolderId
      })
    });

    if (!result.ok) {
      throw new Error(`Failed to move endpoint: HTTP ${result.status}`);
    }

    const data = await result.json() as EndpointUpdateResponse;

    if (data.success && data.data) {
      const moveText = formatEndpointMoveText(data.data);

      return {
        content: [
          {
            type: 'text',
            text: moveText
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: 'text',
            text: `❌ Failed to move endpoint: ${data.message || 'Unknown error'}`
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
          text: `❌ Endpoint move error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}