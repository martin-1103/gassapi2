import { CacheManager } from '../cache/CacheManager';
import {
  ApiResponse,
  PaginatedResponse,
  ProjectDetailsResponse,
  CollectionsResponse,
  EnvironmentsResponse,
  EnvironmentVariablesResponse,
  EndpointsResponse,
  EndpointDetailsResponse,
  TokenValidationResponse,
  McpConfigResponse,
  TestExecutionResponse,
  EnvironmentSetVariableRequest,
  EnvironmentImportRequest,
  CollectionCreateRequest,
  EndpointCreateRequest,
  EndpointUpdateRequest
} from '../types/api.types';

/**
 * Backend API Client with integrated caching
 * Handles all communication with GASSAPI backend
 */
export class BackendClient {
  private baseUrl: string;
  private token: string;
  private cacheManager: CacheManager;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
    this.cacheManager = new CacheManager();

    this.defaultHeaders = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'gassapi-mcp-client/1.0.0'
    };
  }

  // Token validation
  async validateToken(): Promise<TokenValidationResponse> {
    try {
      // Check cache first (1 minute cache)
      const cachedValidation = await this.cacheManager.getCachedTokenValidation(this.token);

      if (cachedValidation) {
        return cachedValidation;
      }

      // Cache miss, call backend API
      const response = await this.fetchWithTimeout('/mcp/validate', {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<TokenValidationResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Token validation failed');
      }

      // Cache the validation result (1 minute)
      await this.cacheManager.cacheTokenValidation(this.token, result.data, { ttlMs: 60000 });

      return result.data;
    } catch (error) {
      console.error('Token validation failed:', error);
      throw error;
    }
  }

  // Project operations
  async getProjectContext(projectId: string): Promise<{
    project: any;
    environments: any[];
    collections?: any[];
    endpoints?: any[];
  }> {
    try {
      // Check cache first
      let project = await this.cacheManager.getCachedProjectData(projectId);
      let environments = await this.cacheManager.getCachedEnvironments(projectId);
      let collections = await this.cacheManager.getCachedCollections(projectId);

      // If we have all data cached, return it
      if (project && environments && collections) {
        return {
          project,
          environments,
          collections
        };
      }

      // Call backend API for missing data
      const response = await this.fetchWithTimeout(`/projects/${projectId}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<ProjectDetailsResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get project context');
      }

      const projectData = result.data;

      // Cache the results
      if (!project) {
        await this.cacheManager.cacheProjectData(projectId, projectData, { ttlMs: 600000 }); // 10 minutes
        project = projectData;
      }

      if (!environments) {
        await this.cacheManager.cacheEnvironments(projectId, projectData.environments || [], { ttlMs: 600000 }); // 10 minutes
        environments = projectData.environments || [];
      }

      if (!collections) {
        const collectionsData = await this.getCollections(projectId);
        collections = collectionsData.collections || [];
      }

      return {
        project,
        environments,
        collections
      };
    } catch (error) {
      console.error('Failed to get project context:', error);
      throw error;
    }
  }

  async getProjectDetails(projectId: string): Promise<ProjectDetailsResponse> {
    try {
      // Check cache first
      const cachedProject = await this.cacheManager.getCachedProjectData(projectId);

      if (cachedProject) {
        return cachedProject;
      }

      // Cache miss, call backend
      const response = await this.fetchWithTimeout(`/projects/${projectId}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<ProjectDetailsResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get project details');
      }

      // Cache the result
      await this.cacheManager.cacheProjectData(projectId, result.data, { ttlMs: 600000 }); // 10 minutes

      return result.data;
    } catch (error) {
      console.error('Failed to get project details:', error);
      throw error;
    }
  }

  // Collection operations
  async getCollections(projectId: string): Promise<CollectionsResponse> {
    try {
      // Check cache first
      const cachedCollections = await this.cacheManager.getCachedCollections(projectId);

      if (cachedCollections) {
        return { collections: cachedCollections };
      }

      // Cache miss, call backend
      const response = await this.fetchWithTimeout(`/collections?project_id=${encodeURIComponent(projectId)}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any[]>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get collections');
      }

      const collections = result.data;

      // Cache the result
      await this.cacheManager.cacheCollections(projectId, collections, { ttlMs: 300000 }); // 5 minutes

      return { collections };
    } catch (error) {
      console.error('Failed to get collections:', error);
      throw error;
    }
  }

  async createCollection(collectionData: CollectionCreateRequest): Promise<any> {
    try {
      const response = await this.fetchWithTimeout('/collections', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(collectionData)
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create collection');
      }

      // Invalidate collections cache for the project
      await this.cacheManager.clearProjectCache(collectionData.project_id);

      return result.data;
    } catch (error) {
      console.error('Failed to create collection:', error);
      throw error;
    }
  }

  async moveCollection(collectionId: string, newParentId: string): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`/collections/${collectionId}/move`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify({ parent_id: newParentId })
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to move collection');
      }

      // Invalidate cache
      await this.cacheManager.clearProjectCache('all'); // We don't know the project_id

      return result.data;
    } catch (error) {
      console.error('Failed to move collection:', error);
      throw error;
    }
  }

  async deleteCollection(collectionId: string, force: boolean = false): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`/collections/${collectionId}?force=${force}`, {
        method: 'DELETE',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete collection');
      }

      // Invalidate cache
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to delete collection:', error);
      throw error;
    }
  }

  // Environment operations
  async getEnvironments(projectId: string): Promise<EnvironmentsResponse> {
    try {
      // Check cache first
      const cachedEnvironments = await this.cacheManager.getCachedEnvironments(projectId);

      if (cachedEnvironments) {
        return { environments: cachedEnvironments };
      }

      // Cache miss, call backend
      const response = await this.fetchWithTimeout(`/environments?project_id=${encodeURIComponent(projectId)}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any[]>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get environments');
      }

      const environments = result.data;

      // Cache the result
      await this.cacheManager.cacheEnvironments(projectId, environments, { ttlMs: 600000 }); // 10 minutes

      return { environments };
    } catch (error) {
      console.error('Failed to get environments:', error);
      throw error;
    }
  }

  async getEnvironmentVariables(environmentId: string): Promise<EnvironmentVariablesResponse> {
    try {
      const response = await this.fetchWithTimeout(`/environments/${environmentId}/variables`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get environment variables');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to get environment variables:', error);
      throw error;
    }
  }

  async setEnvironmentVariable(variableData: EnvironmentSetVariableRequest): Promise<any> {
    try {
      const response = await this.fetchWithTimeout('/environments/variables', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(variableData)
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to set environment variable');
      }

      // Invalidate environments cache for the project
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to set environment variable:', error);
      throw error;
    }
  }

  async exportEnvironment(environmentId: string, format: 'json' | 'env' | 'yaml' = 'json'): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`/environments/${environmentId}/export?format=${format}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to export environment');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to export environment:', error);
      throw error;
    }
  }

  async importEnvironment(importData: EnvironmentImportRequest): Promise<any> {
    try {
      const response = await this.fetchWithTimeout('/environments/import', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(importData)
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to import environment');
      }

      // Invalidate environments cache
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to import environment:', error);
      throw error;
    }
  }

  // Endpoint operations
  async getEndpoints(collectionId?: string, projectId?: string): Promise<EndpointsResponse> {
    try {
      let url = '/endpoints';
      const params = new URLSearchParams();

      if (collectionId) {
        params.append('collection_id', collectionId);
      }
      if (projectId) {
        params.append('project_id', projectId);
      }

      if (params.toString()) {
        url += '?' + params.toString();
      }

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<any[]>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get endpoints');
      }

      return { endpoints: result.data };
    } catch (error) {
      console.error('Failed to get endpoints:', error);
      throw error;
    }
  }

  async getEndpointDetails(endpointId: string): Promise<EndpointDetailsResponse> {
    try {
      const response = await this.fetchWithTimeout(`/endpoints/${endpointId}`, {
        method: 'GET',
        headers: this.defaultHeaders
      });

      const result = await response.json() as ApiResponse<EndpointDetailsResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to get endpoint details');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to get endpoint details:', error);
      throw error;
    }
  }

  async createEndpoint(endpointData: EndpointCreateRequest): Promise<any> {
    try {
      const response = await this.fetchWithTimeout('/endpoints', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(endpointData)
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create endpoint');
      }

      // Invalidate collections cache
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to create endpoint:', error);
      throw error;
    }
  }

  async updateEndpoint(endpointId: string, updateData: EndpointUpdateRequest): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`/endpoints/${endpointId}`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify(updateData)
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to update endpoint');
      }

      // Invalidate cache
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to update endpoint:', error);
      throw error;
    }
  }

  async moveEndpoint(endpointId: string, newCollectionId: string): Promise<any> {
    try {
      const response = await this.fetchWithTimeout(`/endpoints/${endpointId}/move`, {
        method: 'PUT',
        headers: this.defaultHeaders,
        body: JSON.stringify({ collection_id: newCollectionId })
      });

      const result = await response.json() as ApiResponse<any>;

      if (!result.success) {
        throw new Error(result.error || 'Failed to move endpoint');
      }

      // Invalidate cache
      await this.cacheManager.clearProjectCache('all');

      return result.data;
    } catch (error) {
      console.error('Failed to move endpoint:', error);
      throw error;
    }
  }

  // Test execution
  async testEndpoint(endpointId: string, environmentId: string, overrideVariables?: Record<string, string>): Promise<TestExecutionResponse> {
    try {
      const testData = {
        endpoint_id: endpointId,
        environment_id: environmentId,
        override_variables: overrideVariables,
        save_result: true
      };

      const response = await this.fetchWithTimeout('/test/execute', {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify(testData)
      });

      const result = await response.json() as ApiResponse<TestExecutionResponse>;

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to execute endpoint test');
      }

      return result.data;
    } catch (error) {
      console.error('Failed to test endpoint:', error);
      throw error;
    }
  }

  // Utility methods
  private async fetchWithTimeout(url: string, options: RequestInit & { timeout?: number }): Promise<Response> {
    const controller = new AbortController();
    const timeout = options.timeout || 30000; // 30 seconds default

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(this.baseUrl + url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Cache management
  async clearCache(): Promise<void> {
    return this.cacheManager.clearAllCache();
  }

  async getCacheStats(): Promise<any> {
    return this.cacheManager.getCacheStats();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: number }> {
    try {
      const response = await this.fetchWithTimeout('/health', {
        method: 'GET',
        timeout: 5000 // 5 seconds
      });

      const result = await response.json();
      return {
        status: 'ok',
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}