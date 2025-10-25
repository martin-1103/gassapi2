/**
 * Handler for get endpoint details tool
 */

import { McpToolResponse } from '../../../types.js';
import { EndpointDetailsResponse } from '../types.js';
import { getEndpointDependencies } from '../dependencies.js';
import { formatEndpointDetailsText } from '../utils.js';
import { getApiEndpoints } from '../../../lib/api/endpoints.js';

/**
 * Handle get endpoint details request
 */
export async function handleGetEndpointDetails(args: Record<string, any>): Promise<McpToolResponse> {
  try {
    const { configManager, backendClient } = await getEndpointDependencies();

    const endpointId = args.endpoint_id as string;
    if (!endpointId) {
      throw new Error('Endpoint ID is required');
    }

    // Get endpoint details
    const apiEndpoints = getApiEndpoints();
    const endpoint = apiEndpoints.getEndpoint('endpointDetails', { id: endpointId });
    const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

    console.error(`[EndpointTools] Requesting endpoint details from: ${fullUrl}`);

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const result = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${backendClient.getToken()}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if request succeeds

      if (!result.ok) {
        throw new Error(`HTTP ${result.status}: ${result.statusText}`);
      }

      const data = await result.json() as EndpointDetailsResponse;

      if (data.success && data.data) {
        const detailsText = formatEndpointDetailsText(data.data);

        return {
          content: [
            {
              type: 'text',
              text: detailsText
            }
          ]
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Failed to get endpoint details: ${data.message || 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    // Handle network and timeout errors specifically
    } catch (networkError) {
      clearTimeout(timeoutId); // Ensure timeout is cleared on error

      let errorMessage = 'Network error occurred';
      if (networkError instanceof Error) {
        if (networkError.name === 'AbortError') {
          errorMessage = 'Request timeout (30 seconds)';
        } else {
          errorMessage = `Network error: ${networkError.message}`;
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `❌ ${errorMessage}`
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
          text: `❌ Endpoint details error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ],
      isError: true
    };
  }
}