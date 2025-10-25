/**
 * Stateful Variable Interpolation System
 * Supports all variable types with session state context
 */

import { SessionState } from './McpSession';

export interface InterpolationContext {
  state: SessionState;
  currentStepId?: string;
  debugMode?: boolean;
}

/**
 * Enhanced variable interpolation with full state support
 */
export class StatefulInterpolator {
  private static readonly VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;
  private static readonly VALID_TYPES = ['input', 'env', 'runtime', 'config', 'headers'];

  /**
   * Interpolate variables in text with session state context
   */
  static interpolate(text: string, context: InterpolationContext): string {
    if (!text || typeof text !== 'string') {
      return text;
    }

    return text.replace(this.VARIABLE_PATTERN, (match, variableExpression) => {
      try {
        const value = this.extractValue(variableExpression, context);

        if (context.debugMode) {
          console.error(`[StatefulInterpolator] ${match} → ${value}`);
        }

        return value !== null && value !== undefined ? String(value) : match;
      } catch (error) {
        if (context.debugMode) {
          console.error(`[StatefulInterpolator] Error processing ${variableExpression}:`, error);
        }
        return match; // Keep original if error
      }
    });
  }

  /**
   * Extract value from variable expression with state context
   */
  private static extractValue(expression: string, context: InterpolationContext): any {
    const parts = expression.trim().split('.');

    if (parts.length < 2) {
      throw new Error(`Invalid variable format: ${expression}`);
    }

    const [type, ...fieldPath] = parts;
    const field = fieldPath.join('.');

    switch (type) {
      case 'input':
        return this.getInputValue(field, context.state.flowInputs);

      case 'env':
        return this.getEnvironmentValue(field, context.state.environment);

      case 'runtime':
        return this.getRuntimeValue(field, context.state.runtimeVars);

      case 'config':
        return this.getConfigValue(field, context.state.config);

      case 'headers':
        return this.getHeaderValue(field, context);

      default:
        // Check if it's a step ID reference
        return this.getStepOutputValue(type, field, context.state.stepOutputs);
    }
  }

  /**
   * Get value from flow inputs
   */
  private static getInputValue(field: string, flowInputs: Record<string, any>): any {
    if (!flowInputs || !(field in flowInputs)) {
      throw new Error(`Input field not found: ${field}`);
    }
    return flowInputs[field];
  }

  /**
   * Get value from environment variables
   */
  private static getEnvironmentValue(field: string, environment: Record<string, string>): any {
    if (!environment || !(field in environment)) {
      throw new Error(`Environment variable not found: ${field}`);
    }
    return environment[field];
  }

  /**
   * Get value from runtime variables
   */
  private static getRuntimeValue(field: string, runtimeVars: Record<string, any>): any {
    if (!runtimeVars || !(field in runtimeVars)) {
      throw new Error(`Runtime variable not found: ${field}`);
    }
    return runtimeVars[field];
  }

  /**
   * Get value from configuration
   */
  private static getConfigValue(field: string, config: Record<string, any>): any {
    if (!config || !(field in config)) {
      throw new Error(`Configuration not found: ${field}`);
    }
    return config[field];
  }

  /**
   * Get value from request headers (during execution)
   */
  private static getHeaderValue(field: string, context: InterpolationContext): any {
    // This would be populated during HTTP request execution
    // For now, return placeholder or throw error
    throw new Error(`Header interpolation not implemented: ${field}`);
  }

  /**
   * Get value from step outputs
   */
  private static getStepOutputValue(stepId: string, field: string, stepOutputs: Record<string, any>): any {
    if (!stepOutputs || !(stepId in stepOutputs)) {
      throw new Error(`Step output not found: ${stepId}`);
    }

    const stepOutput = stepOutputs[stepId];

    // Navigate nested object path
    return this.navigatePath(stepOutput, field);
  }

  /**
   * Navigate nested object path
   */
  private static navigatePath(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        throw new Error(`Path not found: ${path}`);
      }
    }

    return current;
  }

  /**
   * Extract all variable references from text
   */
  static extractVariableReferences(text: string): string[] {
    if (!text || typeof text !== 'string') {
      return [];
    }

    const references: string[] = [];
    let match;

    while ((match = this.VARIABLE_PATTERN.exec(text)) !== null) {
      references.push(match[1]);
    }

    return references;
  }

  /**
   * Validate variable references against session state
   */
  static validateReferences(references: string[], context: InterpolationContext): {
    valid: string[];
    invalid: { reference: string; error: string }[];
  } {
    const valid: string[] = [];
    const invalid: { reference: string; error: string }[] = [];

    for (const reference of references) {
      try {
        this.extractValue(reference, context);
        valid.push(reference);
      } catch (error) {
        invalid.push({
          reference,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return { valid, invalid };
  }

  /**
   * Build variable summary for debugging
   */
  static buildVariableSummary(context: InterpolationContext): {
    availableInputs: string[];
    availableEnvironment: string[];
    availableRuntime: string[];
    availableConfig: string[];
    availableSteps: string[];
  } {
    return {
      availableInputs: Object.keys(context.state.flowInputs),
      availableEnvironment: Object.keys(context.state.environment),
      availableRuntime: Object.keys(context.state.runtimeVars),
      availableConfig: Object.keys(context.state.config),
      availableSteps: Object.keys(context.state.stepOutputs)
    };
  }

  /**
   * Interpolate object values recursively
   */
  static interpolateObject(obj: any, context: InterpolationContext): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.interpolate(obj, context);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, context));
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }

    return obj;
  }

  /**
   * Check if text contains variable references
   */
  static hasVariables(text: string): boolean {
    return this.VARIABLE_PATTERN.test(text);
  }

  /**
   * Get all variable types used in text
   */
  static getVariableTypes(text: string): string[] {
    const references = this.extractVariableReferences(text);
    const types = new Set<string>();

    for (const ref of references) {
      const [type] = ref.split('.');
      if (type && !this.VALID_TYPES.includes(type)) {
        // It's likely a step ID
        types.add('step');
      } else {
        types.add(type);
      }
    }

    return Array.from(types);
  }
}