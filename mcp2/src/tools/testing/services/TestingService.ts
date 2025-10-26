/**
 * Testing Service
 * Handles endpoint testing operations using shared HTTP client
 */

import { HttpClient } from '../../../shared/http/HttpClient.js';
import { StringUtils, TimeUtils, ValidationUtils, ErrorUtils } from '../../../shared/utils/index.js';
import {
  EndpointTestRequest,
  EndpointTestResponse,
  BatchTestRequest,
  BatchTestResponse,
  CreateTestSuiteRequest,
  CreateTestSuiteResponse,
  ListTestSuitesRequest,
  ListTestSuitesResponse,
  TestValidationResult,
  TestResult,
  TestExecutionResult,
  TestReport,
  HttpMethod
} from '../types.js';

export class TestingService {
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
   * Test a single endpoint
   */
  async testEndpoint(request: EndpointTestRequest): Promise<EndpointTestResponse> {
    try {
      // Get endpoint details
      const endpointDetails = await this.getEndpointDetails(request.endpointId);
      if (!endpointDetails.success || !endpointDetails.data) {
        return {
          success: false,
          error: endpointDetails.error || 'Failed to get endpoint details'
        };
      }

      // Get environment variables if specified
      let environmentVariables: Record<string, string> = {};
      if (request.environmentId) {
        const envResponse = await this.getEnvironmentVariables(request.environmentId);
        if (envResponse.success && envResponse.data) {
          environmentVariables = envResponse.data.variables;
        }
      }

      // Merge with provided variables
      const allVariables = { ...environmentVariables, ...(request.variables || {}) };

      // Execute test
      const testResult = await this.executeEndpointTest(
        endpointDetails.data,
        allVariables,
        request.timeout
      );

      return {
        success: true,
        data: testResult,
        message: 'Endpoint test completed'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Test multiple endpoints (batch testing)
   */
  async testMultipleEndpoints(request: BatchTestRequest): Promise<BatchTestResponse> {
    try {
      if (!request.endpointIds || request.endpointIds.length === 0) {
        return {
          success: false,
          error: 'At least one endpoint ID is required'
        };
      }

      // Validate endpoints exist
      const validation = await this.validateEndpoints(request.endpointIds);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        };
      }

      // Get environment variables if specified
      let environmentVariables: Record<string, string> = {};
      if (request.environmentId) {
        const envResponse = await this.getEnvironmentVariables(request.environmentId);
        if (envResponse.success && envResponse.data) {
          environmentVariables = envResponse.data.variables;
        }
      }

      // Merge with provided variables
      const allVariables = { ...environmentVariables, ...(request.variables || {}) };

      const config = request.config || {
        timeout: 30000,
        parallel: false,
        retries: 1,
        stopOnError: false
      };

      // Execute tests
      const results = await this.executeBatchTests(
        request.endpointIds,
        allVariables,
        config
      );

      const passedTests = results.filter(r => r.success).length;
      const failedTests = results.length - passedTests;

      const executionResult: TestExecutionResult = {
        success: failedTests === 0,
        data: {
          suiteId: StringUtils.generateId(),
          totalTests: results.length,
          passedTests,
          failedTests,
          executionTime: results.reduce((sum, r) => sum + r.executionTime, 0),
          results,
          timestamp: TimeUtils.now()
        },
        message: failedTests === 0 ? 'All tests passed' : `${failedTests} test(s) failed`
      };

      return {
        success: true,
        data: executionResult,
        message: executionResult.message
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Create a test suite
   */
  async createTestSuite(request: CreateTestSuiteRequest): Promise<CreateTestSuiteResponse> {
    try {
      // Validate request
      const validation = this.validateCreateSuiteRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        };
      }

      // For now, this is a placeholder implementation
      // In a real implementation, you would store test suites in a database
      const testSuite = {
        id: StringUtils.generateId(),
        name: request.name,
        description: request.description,
        endpoints: request.endpointIds,
        environment: request.environmentId,
        config: request.config || {
          timeout: 30000,
          parallel: false,
          retries: 1,
          stopOnError: false
        },
        createdAt: TimeUtils.now()
      };

      return {
        success: true,
        data: testSuite,
        message: 'Test suite created successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * List test suites (placeholder implementation)
   */
  async listTestSuites(request: ListTestSuitesRequest): Promise<ListTestSuitesResponse> {
    try {
      // This is a placeholder implementation
      // In a real implementation, you would retrieve from database
      return {
        success: true,
        data: [],
        message: 'No test suites found'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Execute test suite
   */
  async executeTestSuite(suiteId: string, variables?: Record<string, string>): Promise<TestExecutionResult> {
    try {
      // Get test suite details (placeholder)
      // In a real implementation, you would retrieve from database
      throw new Error('Test suite execution not yet implemented');

    } catch (error) {
      throw new Error(`Test suite execution failed: ${ErrorUtils.extractMessage(error)}`);
    }
  }

  /**
   * Execute a single endpoint test
   */
  private async executeEndpointTest(
    endpoint: any,
    variables: Record<string, string>,
    timeout?: number
  ): Promise<TestResult> {
    const startTime = Date.now();

    try {
      // Parse headers and body
      const headers = this.parseHeaders(endpoint.headers);
      const body = this.parseBody(endpoint.body);

      // Apply variable interpolation
      const interpolatedUrl = StringUtils.interpolate(endpoint.url, variables);
      const interpolatedHeaders: Record<string, string> = {};
      const interpolatedBody: any = body;

      for (const [key, value] of Object.entries(headers)) {
        interpolatedHeaders[key] = StringUtils.interpolate(String(value), variables);
      }

      if (typeof body === 'object' && body !== null) {
        const bodyStr = JSON.stringify(body);
        const interpolatedBodyStr = StringUtils.interpolate(bodyStr, variables);
        Object.assign(interpolatedBody, JSON.parse(interpolatedBodyStr));
      }

      // Execute HTTP request
      const response = await this.httpClient.request({
        method: endpoint.method,
        url: interpolatedUrl,
        headers: interpolatedHeaders,
        body: interpolatedBody,
        timeout: timeout || 30000
      });

      const executionTime = Date.now() - startTime;

      return {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        success: response.success,
        executionTime,
        request: {
          method: endpoint.method,
          url: interpolatedUrl,
          headers: interpolatedHeaders,
          body: interpolatedBody
        },
        response: {
          success: response.success,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          responseTime: response.responseTime,
          error: response.error
        },
        error: !response.success ? response.error : undefined
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = ErrorUtils.extractMessage(error);

      return {
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        success: false,
        executionTime,
        request: {
          method: endpoint.method,
          url: endpoint.url,
          headers: this.parseHeaders(endpoint.headers),
          body: this.parseBody(endpoint.body)
        },
        response: {
          success: false,
          status: 0,
          statusText: 'Error',
          headers: {},
          data: null,
          responseTime: 0,
          error: errorMessage
        },
        error: errorMessage
      };
    }
  }

  /**
   * Execute batch tests
   */
  private async executeBatchTests(
    endpointIds: string[],
    variables: Record<string, string>,
    config: any
  ): Promise<TestResult[]> {
    const results: TestResult[] = [];

    if (config.parallel) {
      // Execute in parallel
      const promises = endpointIds.map(async (endpointId) => {
        const endpointDetails = await this.getEndpointDetails(endpointId);
        if (endpointDetails.success && endpointDetails.data) {
          return await this.executeEndpointTest(
            endpointDetails.data,
            variables,
            config.timeout
          );
        }
        return null;
      });

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value);
        }
      });
    } else {
      // Execute sequentially
      for (const endpointId of endpointIds) {
        const endpointDetails = await this.getEndpointDetails(endpointId);
        if (endpointDetails.success && endpointDetails.data) {
          const testResult = await this.executeEndpointTest(
            endpointDetails.data,
            variables,
            config.timeout
          );
          results.push(testResult);

          if (!testResult.success && config.stopOnError) {
            break;
          }
        }
      }
    }

    return results;
  }

  /**
   * Get endpoint details from backend
   */
  private async getEndpointDetails(endpointId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/?act=endpoint&id=${endpointId}`;
      const response = await this.httpClient.get(url);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const endpointData = response.data.data || response.data;
        return {
          success: true,
          data: endpointData
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to get endpoint details'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Get environment variables
   */
  private async getEnvironmentVariables(environmentId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/?act=environment_details&id=${environmentId}`;
      const response = await this.httpClient.get(url);

      if (response.success && response.data) {
        let variables: Record<string, string> = {};
        try {
          variables = JSON.parse(response.data.variables || '{}');
        } catch (e) {
          // Handle parsing error
        }

        return {
          success: true,
          data: { variables }
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to get environment variables'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Validate endpoints exist
   */
  private async validateEndpoints(endpointIds: string[]): Promise<TestValidationResult> {
    const errors: string[] = [];

    for (const endpointId of endpointIds) {
      const details = await this.getEndpointDetails(endpointId);
      if (!details.success) {
        errors.push(`Endpoint ${endpointId} not found or inaccessible`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: []
    };
  }

  /**
   * Validate create test suite request
   */
  private validateCreateSuiteRequest(request: CreateTestSuiteRequest): TestValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Test suite name is required');
    }

    if (!request.endpointIds || request.endpointIds.length === 0) {
      errors.push('At least one endpoint is required');
    }

    if (request.config) {
      if (request.config.timeout && !ValidationUtils.validateTimeout(request.config.timeout)) {
        errors.push('Invalid timeout value');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Parse headers string to object
   */
  private parseHeaders(headersStr?: string): Record<string, string> {
    if (!headersStr || headersStr === '{}') {
      return {};
    }
    try {
      const parsed = JSON.parse(headersStr);
      return typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  /**
   * Parse body value
   */
  private parseBody(bodyStr?: string): any {
    if (!bodyStr || bodyStr === 'null') {
      return null;
    }
    if (bodyStr === '{}') {
      return {};
    }
    try {
      return JSON.parse(bodyStr);
    } catch (e) {
      return bodyStr;
    }
  }
}