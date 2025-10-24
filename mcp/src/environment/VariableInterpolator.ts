import { ExecutionError, ErrorCodes } from '../types/execution.types.js';
import { logger } from '../utils/Logger.js';

/**
 * Variable Interpolator
 * Handles variable substitution in strings, objects, and templates
 */
export class VariableInterpolator {
  private static readonly VARIABLE_REGEX = /\{\{(\w+)\}\}/g;
  private static readonly ALLOWED_GLOBALS = {
    Math: Math,
    Date: Date,
    JSON: JSON,
    parseInt: parseInt,
    parseFloat: parseFloat,
    String: String,
    Number: Number,
    Boolean: Boolean,
    Array: Array,
    Object: Object
  };

  /**
   * Interpolate variables in a string
   */
  static interpolate(text: string, variables: Record<string, any>): string {
    if (typeof text !== 'string') {
      return text;
    }

    try {
      return text.replace(this.VARIABLE_REGEX, (match, varName) => {
        if (variables.hasOwnProperty(varName)) {
          const value = variables[varName];
          return value !== null && value !== undefined ? String(value) : '';
        }
        logger.warn(`Undefined variable: ${varName}`, { variable: varName }, 'VariableInterpolator');
        return match; // Keep original if variable not found
      });
    } catch (error) {
      logger.error('String interpolation failed', {
        error: error instanceof Error ? error.message : String(error),
        text: text.substring(0, 100)
      }, 'VariableInterpolator');
      throw new ExecutionError(
        `Variable interpolation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.VARIABLE_INTERPOLATION_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Interpolate variables in an object recursively
   */
  static interpolateObject(obj: any, variables: Record<string, any>): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.interpolate(obj, variables);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, variables));
    }

    if (typeof obj === 'object') {
      const result: any = {};

      for (const [key, value] of Object.entries(obj)) {
        const interpolatedKey = this.interpolate(key, variables);
        const interpolatedValue = this.interpolateObject(value, variables);
        result[interpolatedKey] = interpolatedValue;
      }

      return result;
    }

    return obj;
  }

  /**
   * Interpolate variables in request body
   */
  static interpolateBody(body: any, variables: Record<string, any>): any {
    if (!body) return body;

    if (typeof body === 'string') {
      return this.interpolate(body, variables);
    }

    return this.interpolateObject(body, variables);
  }

  /**
   * Interpolate variables in URL
   */
  static interpolateUrl(url: string, variables: Record<string, any>): string {
    return this.interpolate(url, variables);
  }

  /**
   * Interpolate variables in headers
   */
  static interpolateHeaders(headers: Record<string, string>, variables: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      const interpolatedKey = this.interpolate(key, variables);
      const interpolatedValue = this.interpolate(value, variables);
      result[interpolatedKey] = interpolatedValue;
    }

    return result;
  }

  /**
   * Evaluate a JavaScript expression safely
   */
  static evaluateExpression(expression: string, context: Record<string, any>): any {
    try {
      // Sanitize expression
      const sanitized = this.sanitizeExpression(expression);

      // Create safe context
      const safeContext = {
        ...this.ALLOWED_GLOBALS,
        ...context
      };

      // Create function with limited scope
      const func = new Function(...Object.keys(safeContext), `return (${sanitized})`);

      return func(...Object.values(safeContext));
    } catch (error) {
      logger.error('Expression evaluation failed', {
        error: error instanceof Error ? error.message : String(error),
        expression: expression.substring(0, 100)
      }, 'VariableInterpolator');

      throw new ExecutionError(
        `Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.CONDITION_EVALUATION_ERROR,
        undefined,
        error as Error,
        { expression }
      );
    }
  }

  /**
   * Sanitize JavaScript expression to prevent dangerous operations
   */
  private static sanitizeExpression(expression: string): string {
    const dangerousPatterns = [
      /import\s+.*\s+from/i,
      /require\s*\(/i,
      /eval\s*\(/i,
      /function\s*\(/i,
      /=>\s*{/,
      /constructor/i,
      /prototype/i,
      /__proto__/i,
      /process\./i,
      /global\./i,
      /window\./i,
      /document\./i,
      /console\./i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /XMLHttpRequest/i,
      /fetch\s*\(/i,
      /require\s*\(/i,
      /import\s*\(/i,
      /new\s+(Function|eval|XMLHttpRequest|WebSocket)/i
    ];

    let sanitized = expression.trim();

    for (const pattern of dangerousPatterns) {
      sanitized = sanitized.replace(pattern, '/* REMOVED */');
    }

    // Remove comments that might hide dangerous code
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
    sanitized = sanitized.replace(/\/\/.*$/gm, '');

    return sanitized;
  }

  /**
   * Validate variable name
   */
  static isValidVariableName(name: string): boolean {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name);
  }

  /**
   * Extract variable names from template
   */
  static extractVariables(template: string): string[] {
    const matches = template.match(this.VARIABLE_REGEX);
    if (!matches) return [];

    return matches.map(match => {
      const varName = match.match(/\{\{(\w+)\}\}/)?.[1];
      return varName || '';
    }).filter(name => name && this.isValidVariableName(name));
  }

  /**
   * Check if template contains variables
   */
  static hasVariables(template: string): boolean {
    return this.VARIABLE_REGEX.test(template);
  }

  /**
   * Validate interpolation context
   */
  static validateContext(variables: Record<string, any>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(variables)) {
      if (!this.isValidVariableName(key)) {
        errors.push(`Invalid variable name: ${key}`);
      }

      if (typeof value === 'function') {
        errors.push(`Variable ${key} cannot be a function`);
      }

      if (value && typeof value === 'object' && value.constructor !== Object && value.constructor !== Array) {
        errors.push(`Variable ${key} contains unsupported object type`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}