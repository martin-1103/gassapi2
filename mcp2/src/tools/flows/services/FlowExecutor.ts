/**
 * Flow Executor Service
 * Handles the core flow execution logic
 */

import { HttpClient } from '../../../shared/http/HttpClient.js';
import { StringUtils, TimeUtils, ValidationUtils } from '../../../shared/utils/index.js';
import {
  FlowStep,
  FlowNodeResult,
  FlowExecutionContext,
  FlowExecutionOptions,
  FlowExecutionMode,
  FlowStepResult
} from '../types.js';

export class FlowExecutor {
  private httpClient: HttpClient;

  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || new HttpClient();
  }

  /**
   * Execute a flow with the given context and options
   */
  async executeFlow(
    steps: FlowStep[],
    initialVariables: Record<string, any> = {},
    options: FlowExecutionOptions = {}
  ): Promise<{
    success: boolean;
    results: FlowNodeResult[];
    executionTime: number;
    errors: string[];
    variables: Record<string, any>;
  }> {
    const context: FlowExecutionContext = {
      flowId: StringUtils.generateId(),
      variables: { ...initialVariables },
      config: {
        timeout: options.timeout || 30000,
        stopOnError: options.stopOnError !== false,
        parallel: options.mode === 'parallel',
        maxConcurrency: options.maxConcurrency || 5
      },
      startTime: Date.now(),
      nodeResults: [],
      errors: [],
      stopped: false
    };

    try {
      if (options.mode === 'parallel' && !options.dryRun) {
        await this.executeParallel(steps, context);
      } else {
        await this.executeSequential(steps, context);
      }

      const executionTime = Date.now() - context.startTime;

      return {
        success: context.errors.length === 0 && !context.stopped,
        results: context.nodeResults,
        executionTime,
        errors: context.errors,
        variables: context.variables
      };

    } catch (error) {
      const executionTime = Date.now() - context.startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      return {
        success: false,
        results: context.nodeResults,
        executionTime,
        errors: [...context.errors, errorMessage],
        variables: context.variables
      };
    }
  }

  /**
   * Execute steps sequentially
   */
  private async executeSequential(steps: FlowStep[], context: FlowExecutionContext): Promise<void> {
    for (let i = 0; i < steps.length; i++) {
      if (context.stopped) break;

      const step = steps[i];
      const result = await this.executeStep(step, context.variables, context.config.timeout || 30000);

      context.nodeResults.push(result);

      if (!result.success) {
        const error = result.error || `Step ${step.name} failed`;
        context.errors.push(error);

        if (context.config.stopOnError) {
          context.stopped = true;
          break;
        }
      }

      // Update variables with step results for interpolation in next steps
      if (result.response?.data) {
        context.variables[`step_${step.id}_response`] = result.response.data;
        context.variables[`step_${step.id}_status`] = result.response.status;
        context.variables[`step_${step.id}_time`] = result.executionTime;
      }
    }
  }

  /**
   * Execute steps in parallel
   */
  private async executeParallel(steps: FlowStep[], context: FlowExecutionContext): Promise<void> {
    const maxConcurrency = Math.min(context.config.maxConcurrency || 5, steps.length);
    const chunks = this.chunkArray(steps, maxConcurrency);

    for (const chunk of chunks) {
      if (context.stopped) break;

      const promises = chunk.map(step =>
        this.executeStep(step, context.variables, context.config.timeout || 30000)
      );

      const results = await Promise.allSettled(promises);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const step = chunk[i];

        if (result.status === 'fulfilled') {
          context.nodeResults.push(result.value);

          if (!result.value.success) {
            const error = result.value.error || `Step ${step.name} failed`;
            context.errors.push(error);

            if (context.config.stopOnError) {
              context.stopped = true;
              break;
            }
          }

          // Update variables
          if (result.value.response?.data) {
            context.variables[`step_${step.id}_response`] = result.value.response.data;
            context.variables[`step_${step.id}_status`] = result.value.response.status;
            context.variables[`step_${step.id}_time`] = result.value.executionTime;
          }
        } else {
          const error = result.reason instanceof Error ? result.reason.message : 'Unknown error';
          context.errors.push(`Step ${step.name} failed: ${error}`);

          if (context.config.stopOnError) {
            context.stopped = true;
            break;
          }
        }
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: FlowStep,
    variables: Record<string, any>,
    timeout: number
  ): Promise<FlowNodeResult> {
    const startTime = Date.now();

    try {
      // Build request from step or endpoint reference
      const request = this.buildStepRequest(step, variables);

      // Validate request
      const validation = this.validateStepRequest(request);
      if (!validation.valid) {
        return {
          stepId: step.id,
          stepName: step.name,
          success: false,
          executionTime: Date.now() - startTime,
          error: validation.errors.join(', ')
        };
      }

      // Execute HTTP request
      const response = await this.httpClient.request({
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        timeout: step.timeout || timeout
      });

      const executionTime = Date.now() - startTime;

      // Check expected status
      const statusMatches = !step.expectedStatus || response.status === step.expectedStatus;

      return {
        stepId: step.id,
        stepName: step.name,
        success: response.success && statusMatches,
        executionTime,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
          body: request.body
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
        error: (!response.success || !statusMatches) ?
          `HTTP ${response.status}: ${response.statusText}` : undefined
      };

    } catch (error) {
      return {
        stepId: step.id,
        stepName: step.name,
        success: false,
        executionTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Build HTTP request from step definition
   */
  private buildStepRequest(step: FlowStep, variables: Record<string, any>) {
    const method = step.method || 'GET';
    let url = step.url || '';
    const headers = { ...step.headers };
    let body = step.body;

    // Interpolate variables
    url = StringUtils.interpolate(url, variables);

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        headers[key] = StringUtils.interpolate(String(value), variables);
      }
    }

    if (body && typeof body === 'object') {
      body = JSON.parse(StringUtils.interpolate(JSON.stringify(body), variables));
    }

    return {
      method,
      url,
      headers,
      body
    };
  }

  /**
   * Validate step request
   */
  private validateStepRequest(request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.method) {
      errors.push('HTTP method is required');
    } else if (!ValidationUtils.validateHttpMethod(request.method)) {
      errors.push(`Invalid HTTP method: ${request.method}`);
    }

    if (!request.url) {
      errors.push('URL is required');
    } else if (!ValidationUtils.validateUrl(request.url)) {
      errors.push(`Invalid URL: ${request.url}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Utility to chunk array for parallel execution
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}