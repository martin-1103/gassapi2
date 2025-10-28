/**
 * Simplified Backend Client for GASSAPI MCP v2
 * Migrated from original BackendClient but simplified
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface TokenValidationResponse {
  success: boolean;
  data?: {
    valid: boolean;
    project?: {
      id: string;
      name: string;
    };
    environment?: {
      id: string;
      name: string;
    };
    lastValidatedAt?: string;
  };
  error?: string;
  message?: string;
}

export interface ProjectContextResponse {
  project: {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  };
  environments: Array<{
    id: string;
    name: string;
    description?: string;
    is_default?: boolean;
    variables?: Record<string, any>;
    created_at?: string;
    updated_at?: string;
  }>;
  folders: Array<{
    id: string;
    name: string;
    description?: string;
    endpoint_count?: number;
    created_at?: string;
    updated_at?: string;
  }>;
  user: {
    id: string;
    token_type: 'jwt' | 'mcp';
    authenticated: boolean;
  };
}

export interface UnifiedEnvironment {
  id: string;
  name: string;
  description?: string;
  is_default?: boolean;
  project_id?: string;
  variable_count?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * Simple backend client for GASSAPI API
 * Simplified from original BackendClient
 */
export class BackendClient {
  private baseUrl: string;
  private mcpToken: string;
  private defaultHeaders: Record<string, string>;

  constructor(mcpToken: string) {
    this.baseUrl = "http://mapi.gass.web.id"; // Back to original base URL
    this.mcpToken = mcpToken;

    this.defaultHeaders = {
      'Authorization': `Bearer ${this.mcpToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GASSAPI-MCP/1.0.0'
    };
  }

  /**
   * Make HTTP request with proper error handling
   */
  public async makeRequest<T>(endpoint: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}/index.php${endpoint}`;
      const method = options.method || 'GET';

      const headers = {
        ...this.defaultHeaders,
        ...options.headers
      };
      const timeout = options.timeout || 30000;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers,
        body: options.body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: any = await response.json();

      // Handle different response formats
      if (data.success === false) {
        return {
          success: false,
          error: data.error || 'Request failed',
          message: data.message,
          status: response.status
        };
      }

      return {
        success: true,
        data: data.data || data
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timeout'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate MCP token
   */
  async validateToken(): Promise<ApiResponse<TokenValidationResponse>> {
    return this.makeRequest<TokenValidationResponse>('/?act=validate_token', {
      method: 'POST'
    });
  }

  /**
   * Get project context using new dual-token endpoint
   */
  async getProjectContext(projectId: string): Promise<ApiResponse<ProjectContextResponse>> {
    if (!projectId) {
      throw new Error('Project ID is required for project context');
    }

    // For testing, use existing project endpoint first
    const endpoint = `/?act=project&id=${encodeURIComponent(projectId)}`;
    const fullUrl = `${this.baseUrl}${endpoint}`;

    console.error(`[BackendClient] Requesting project context from: ${fullUrl}`);

    const result = await this.makeRequest<ProjectContextResponse>(endpoint, {
      method: 'GET'
    });

    console.error(`[BackendClient] Response:`, JSON.stringify(result, null, 2));
    return result;
  }

  /**
   * Get current project
   */
  async getCurrentProject(): Promise<ApiResponse<any>> {
    return this.makeRequest('/?act=current_project', {
      method: 'GET'
    });
  }

  /**
   * Flow operations
   */
  async createFlow(flowData: any): Promise<ApiResponse<any>> {
    const projectId = flowData.project_id;
    if (!projectId) {
      throw new Error('Project ID is required for flow creation');
    }

    return this.makeRequest(`/?act=flow_create&id=${projectId}`, {
      method: 'POST',
      body: JSON.stringify(flowData)
    });
  }

  async getFlowDetails(flowId: string): Promise<ApiResponse<any>> {
    const response = await this.makeRequest(`/?act=flow&id=${flowId}`, {
      method: 'GET'
    });

    // Handle nested response structure
    if (response.success && response.data) {
      const responseData = response.data as any;
      let flowData = responseData.data || responseData;

      // Parse flow_data if it's a string
      if (flowData.flow_data && typeof flowData.flow_data === 'string') {
        try {
          flowData.flow_data = JSON.parse(flowData.flow_data);
        } catch (e) {
          // If parsing fails, set default structure
          flowData.flow_data = { version: '1.0', steps: [] };
        }
      }

      return {
        success: true,
        data: flowData
      };
    }

    return response as ApiResponse<any>;
  }

  async getFlows(filters?: any): Promise<ApiResponse<any[]>> {
    const projectId = filters?.project_id;
    if (!projectId) {
      throw new Error('Project ID is required for flows');
    }

    // Build query params excluding project_id (used in act parameter)
    const queryParams = { ...filters };
    delete queryParams.project_id;

    const params = new URLSearchParams(queryParams).toString();
    const endpoint = params ? `/?act=flows&id=${projectId}&${params}` : `/?act=flows&id=${projectId}`;
    return this.makeRequest(endpoint, {
      method: 'GET'
    });
  }

  async deleteFlow(flowId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/?act=flow_delete&id=${flowId}`, {
      method: 'DELETE'
    });
  }

  async getEndpoints(filters?: any): Promise<ApiResponse<any[]>> {
    const folderId = filters?.folder_id;
    if (!folderId) {
      throw new Error('Folder ID is required for endpoints');
    }

    // Build query params excluding folder_id (used in act parameter)
    const queryParams = { ...filters };
    delete queryParams.folder_id;

    const params = new URLSearchParams(queryParams).toString();
    const endpoint = params ? `/?act=endpoints&id=${folderId}&${params}` : `/?act=endpoints&id=${folderId}`;
    const response = await this.makeRequest(endpoint, {
      method: 'GET'
    });

    // Handle nested response structure
    if (response.success && response.data) {
      const responseData = response.data as any;
      const endpointsData = responseData.data || responseData;
      if (Array.isArray(endpointsData)) {
        return {
          success: true,
          data: endpointsData
        };
      }
    }

    return response as ApiResponse<any[]>;
  }

  /**
   * Update endpoint
   */
  async updateEndpoint(endpointId: string, updateData: any): Promise<ApiResponse<any>> {
    const endpoint = `/?act=endpoint&id=${endpointId}`;
    const response = await this.makeRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });

    // Handle nested response structure
    if (response.success && response.data) {
      const responseData = response.data as any;
      return {
        success: true,
        data: responseData.data || responseData
      };
    }

    return response as ApiResponse<any>;
  }

  /**
   * Get status
   */
  getStatus(): {
    connected: boolean;
    server_url: string;
    token_configured: boolean;
    token_expired: boolean;
  } {
    return {
      connected: true,
      server_url: this.baseUrl,
      token_configured: !!this.mcpToken,
      token_expired: false // Simple check - in real app would check expiry
    };
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  
  /**
   * Get MCP token
   */
  getMcpToken(): string {
    return this.mcpToken;
  }

  /**
   * Get current active token
   */
  getToken(): string {
    return this.mcpToken;
  }
}