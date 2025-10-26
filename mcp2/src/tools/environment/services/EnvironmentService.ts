/**
 * Environment Service
 * Handles environment-related operations with backend
 */

import { HttpClient } from '../../../shared/http/HttpClient.js';
import { ValidationUtils, ErrorUtils, StringUtils } from '../../../shared/utils/index.js';
import {
  ListEnvironmentsRequest,
  ListEnvironmentsResponse,
  GetEnvironmentDetailsRequest,
  UpdateEnvironmentVariablesRequest,
  UpdateEnvironmentVariablesResponse,
  CreateEnvironmentRequest,
  CreateEnvironmentResponse,
  DeleteEnvironmentResponse,
  EnvironmentValidationResult,
  Environment,
  EnvironmentVariables
} from '../types.js';

export class EnvironmentService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * List all environments for a project
   */
  async listEnvironments(request: ListEnvironmentsRequest): Promise<ListEnvironmentsResponse> {
    try {
      if (!request.projectId) {
        return {
          success: false,
          error: 'Project ID is required'
        };
      }

      const url = `${this.baseUrl}/?act=project_environments&id=${request.projectId}`;
      const response = await this.httpClient.get<any>(url);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const environmentsData = response.data.data || response.data;

        // Ensure environmentsData is an array
        if (!Array.isArray(environmentsData)) {
          return {
            success: false,
            error: 'Invalid response format: expected array of environments'
          };
        }

        return {
          success: true,
          data: environmentsData,
          message: `Retrieved ${environmentsData.length} environments`
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to retrieve environments'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Get detailed environment information
   */
  async getEnvironmentDetails(request: GetEnvironmentDetailsRequest): Promise<any> {
    try {
      const url = `${this.baseUrl}/?act=environment&id=${request.environmentId}`;
      const response = await this.httpClient.get(url);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const envData = response.data.data || response.data;

        return {
          success: true,
          data: envData
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to get environment details'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Update environment variables
   */
  async updateEnvironmentVariables(request: UpdateEnvironmentVariablesRequest): Promise<UpdateEnvironmentVariablesResponse> {
    try {
      // Get current environment details
      const currentDetails = await this.getEnvironmentDetails({
        environmentId: request.environmentId
      });

      if (!currentDetails.success || !currentDetails.data) {
        return {
          success: false,
          error: 'Failed to get current environment details'
        };
      }

      // Parse current variables
      let currentVariables: EnvironmentVariables = {};
      try {
        currentVariables = JSON.parse(currentDetails.data.variables || '{}');
      } catch (e) {
        console.error('Failed to parse current variables:', e);
      }

      // Apply operation
      let updatedVariables: EnvironmentVariables;
      const operation = request.operation || 'merge';

      if (operation === 'replace') {
        updatedVariables = { ...request.variables };
      } else {
        // Merge operation
        updatedVariables = { ...currentVariables, ...request.variables };
      }

      // Update environment
      const url = `${this.baseUrl}/?act=environment_update&id=${request.environmentId}`;
      const updateData = {
        variables: JSON.stringify(updatedVariables)
      };

      const response = await this.httpClient.put(url, updateData);

      if (response.success) {
        // Calculate updated variables
        const updatedKeys = Object.keys(request.variables);
        const removedKeys = operation === 'replace'
          ? Object.keys(currentVariables).filter(key => !request.variables[key])
          : [];

        return {
          success: true,
          message: 'Environment variables updated successfully',
          data: {
            updatedVariables: updatedKeys,
            removedVariables: removedKeys,
            totalVariables: Object.keys(updatedVariables).length
          }
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to update environment variables'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Create a new environment
   */
  async createEnvironment(request: CreateEnvironmentRequest): Promise<CreateEnvironmentResponse> {
    try {
      // Validate request
      const validation = this.validateCreateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const url = `${this.baseUrl}/?act=environment_create&id=${request.projectId}`;
      const createData = {
        name: request.name.trim(),
        description: request.description?.trim(),
        variables: JSON.stringify(request.variables || {}),
        is_default: request.isDefault || false
      };

      const response = await this.httpClient.post(url, createData);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Environment created successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to create environment'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Delete an environment
   */
  async deleteEnvironment(environmentId: string): Promise<DeleteEnvironmentResponse> {
    try {
      const url = `${this.baseUrl}/?act=environment_delete&id=${environmentId}`;
      const response = await this.httpClient.delete(url);

      if (response.success) {
        return {
          success: true,
          message: 'Environment deleted successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to delete environment'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Set default environment
   */
  async setDefaultEnvironment(environmentId: string): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/?act=environment_update&id=${environmentId}`;
      const response = await this.httpClient.post(url);

      return response.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Duplicate environment
   */
  async duplicateEnvironment(sourceId: string, newName: string): Promise<CreateEnvironmentResponse> {
    try {
      // Get source environment
      const sourceDetails = await this.getEnvironmentDetails({
        environmentId: sourceId
      });

      if (!sourceDetails.success || !sourceDetails.data) {
        return {
          success: false,
          error: 'Failed to get source environment details'
        };
      }

      // Create duplicate
      const createRequest: CreateEnvironmentRequest = {
        name: newName,
        description: sourceDetails.data.description
          ? `Copy of: ${sourceDetails.data.description}`
          : 'Duplicated environment',
        variables: sourceDetails.data.variables
          ? JSON.parse(sourceDetails.data.variables)
          : {},
        isDefault: false,
        projectId: sourceDetails.data.project_id
      };

      return await this.createEnvironment(createRequest);

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Export environment configuration
   */
  async exportEnvironment(environmentId: string): Promise<string> {
    try {
      const details = await this.getEnvironmentDetails({
        environmentId
      });

      if (!details.success || !details.data) {
        throw new Error('Failed to get environment details');
      }

      const exportData = {
        name: details.data.name,
        description: details.data.description,
        variables: details.data.variables ? JSON.parse(details.data.variables) : {},
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      throw new Error(`Export failed: ${ErrorUtils.extractMessage(error)}`);
    }
  }

  /**
   * Import environment configuration
   */
  async importEnvironment(name: string, data: string, projectId?: string): Promise<CreateEnvironmentResponse> {
    try {
      const importData = JSON.parse(data);

      const createRequest: CreateEnvironmentRequest = {
        name: name || importData.name,
        description: importData.description,
        variables: importData.variables || {},
        isDefault: false,
        projectId
      };

      return await this.createEnvironment(createRequest);

    } catch (error) {
      return {
        success: false,
        error: `Import failed: ${ErrorUtils.extractMessage(error)}`
      };
    }
  }

  /**
   * Validate create environment request
   */
  private validateCreateRequest(request: CreateEnvironmentRequest): EnvironmentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Environment name is required');
    }

    if (request.name && request.name.length > 100) {
      errors.push('Environment name must be 100 characters or less');
    }

    if (request.description && request.description.length > 500) {
      warnings.push('Description is very long (>500 characters)');
    }

    if (request.variables) {
      const varCount = Object.keys(request.variables).length;
      if (varCount > 100) {
        warnings.push(`Large number of variables (${varCount}). Consider using a secrets manager for sensitive data.`);
      }

      // Validate variable keys and values
      for (const [key, value] of Object.entries(request.variables)) {
        if (key.length > 100) {
          errors.push(`Variable key '${key}' is too long (>100 characters)`);
        }
        if (typeof value !== 'string') {
          errors.push(`Variable '${key}' value must be a string`);
        }
        if (value.length > 1000) {
          warnings.push(`Variable '${key}' value is very long (>1000 characters)`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}