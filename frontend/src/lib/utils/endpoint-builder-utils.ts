import { headersToObject } from '@/lib/utils/http-request-utils';
import type { AuthData, EndpointResponse } from '@/types/api';
import type { RequestBody } from '@/types/api';

/**
 * Build URL dengan query parameters
 */
export function buildUrlWithParams(
  baseUrl: string,
  params: Array<{ key: string; value: string; enabled: boolean }>,
): string {
  if (!params || params.length === 0) return baseUrl;

  const enabledParams = params.filter(p => p.enabled && p.key && p.value);
  if (enabledParams.length === 0) return baseUrl;

  // Handle relative URLs or URLs with variables
  try {
    const url = new URL(baseUrl);
    enabledParams.forEach(param => {
      url.searchParams.append(param.key, param.value);
    });
    return url.toString();
  } catch {
    // For relative URLs or invalid URLs, use manual construction
    const [path, existingQuery] = baseUrl.split('?');
    const queryParams = new URLSearchParams(existingQuery || '');

    enabledParams.forEach(param => {
      queryParams.append(param.key, param.value);
    });

    return `${path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  }
}

/**
 * Build headers dari array ke object
 */
export function buildHeaders(
  headers: Array<{ key: string; value: string; enabled: boolean }>,
): Record<string, string> {
  return headersToObject(headers);
}

/**
 * Add authentication headers ke existing headers
 */
export function addAuthHeaders(
  headers: Record<string, string>,
  authData: AuthData,
): Record<string, string> {
  const newHeaders = { ...headers };

  switch (authData.type) {
    case 'bearer':
      if (authData.bearer?.token) {
        newHeaders.Authorization = `Bearer ${authData.bearer.token}`;
      }
      break;

    case 'basic':
      if (authData.basic?.username && authData.basic?.password) {
        // Note: btoa is available in browser environment
        if (
          typeof window !== 'undefined' &&
          typeof window.btoa !== 'undefined'
        ) {
          const credentials = window.btoa(
            `${authData.basic.username}:${authData.basic.password}`,
          );
          newHeaders.Authorization = `Basic ${credentials}`;
        } else {
          // Fallback for environments without btoa
          // Skip Basic auth for now in this environment
        }
      }
      break;

    case 'apikey':
      if (authData.apikey?.key && authData.apikey?.value) {
        if (authData.apikey.addTo === 'header') {
          newHeaders[authData.apikey.key] = authData.apikey.value;
        }
        // Query param akan ditambahkan di buildUrlWithParams
      }
      break;

    case 'oauth2':
      if (authData.oauth2?.accessToken) {
        newHeaders.Authorization = `Bearer ${authData.oauth2.accessToken}`;
      }
      break;

    default:
      // noauth - tidak menambah header apapun
      break;
  }

  return newHeaders;
}

/**
 * Build request body berdasarkan method dan content type
 */
export function buildRequestBody(
  bodyData: RequestBody,
  method: string,
): string | object | undefined {
  // GET, HEAD, OPTIONS tidak boleh punya body
  if (['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())) {
    return undefined;
  }

  // Kalau bodyData sudah string atau object, return as-is
  if (typeof bodyData === 'string' || typeof bodyData === 'object') {
    return bodyData;
  }

  return undefined;
}

/**
 * Format axios response ke EndpointResponse format
 */
export function formatResponse(
  axiosResponse: {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: unknown;
  },
  startTime: number,
): EndpointResponse {
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  return {
    status: axiosResponse.status,
    statusText: axiosResponse.statusText,
    headers: axiosResponse.headers,
    data: axiosResponse.data,
    time: responseTime,
    size: JSON.stringify(axiosResponse.data || {}).length,
  };
}
