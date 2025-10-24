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
  collections: Array<{
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
  private token: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;

    this.defaultHeaders = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'GASSAPI-MCP/1.0.0'
    };
  }

  /**
   * Make HTTP request with proper error handling
   */
  private async makeRequest<T>(endpoint: string, options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    timeout?: number;
  }): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const method = options.method || 'GET';
      const headers = { ...this.defaultHeaders, ...options.headers };
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
    return this.makeRequest<TokenValidationResponse>('/api/v1/auth/validate', {
      method: 'POST'
    });
  }

  /**
   * Get project context using new dual-token endpoint
   */
  async getProjectContext(projectId?: string): Promise<ApiResponse<ProjectContextResponse>> {
    if (!projectId) {
      throw new Error('Project ID is required for project context');
    }

    // For testing, use existing project endpoint first
    const endpoint = `/gassapi2/backend/?act=project&id=${encodeURIComponent(projectId)}`;
    const fullUrl = `${this.baseUrl}${endpoint}`;

    console.error(`[BackendClient] Requesting project context from: ${fullUrl}`);

    const result = await this.makeRequest<ProjectContextResponse>(endpoint, {
      method: 'GET'
    });

    console.error(`[BackendClient] Response:`, JSON.stringify(result, null, 2));
    return result;
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
      token_configured: !!this.token,
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
   * Get token
   */
  getToken(): string {
    return this.token;
  }
}