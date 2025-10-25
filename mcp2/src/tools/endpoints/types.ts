/**
 * Type definitions for endpoint management tools
 */

import { McpToolResponse } from '../../types.js';

// HTTP Methods type
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// API Response Interfaces
export interface EndpointListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    folder_id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    created_at: string;
    updated_at: string;
  }>;
  message?: string;
}

export interface EndpointDetailsResponse {
  success: boolean;
  data?: {
    id: string;
    folder_id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    created_at: string;
    updated_at: string;
    folder?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  message?: string;
}

export interface EndpointCreateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    folder_id: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

export interface EndpointUpdateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    method: HttpMethod;
    url: string;
    description?: string;
    headers?: string;
    body?: string;
    folder_id: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

export interface EndpointMoveResponse {
  success: boolean;
  message?: string;
}

// Tool handler function types
export type EndpointToolHandler = (args: Record<string, any>) => Promise<McpToolResponse>;