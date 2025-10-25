/**
 * Environment Variable Interpolator
 * Menangani variable substitution di URLs, headers, dan body
 */

import { logger } from '@/lib/logger';
import {
  safePropertyAccess,
  safePropertyAssignment,
  validatePropertyName,
} from '@/lib/security/object-injection-utils';
import { createSafeRegExp } from '@/lib/security/regexp-utils';
import type {
  Environment,
  RequestConfig,
  InterpolatableValue,
  InterpolatedObject,
} from '@/types/variable-types';

export class VariableInterpolator {
  /**
   * Interpolate string dengan environment variables
   * {{variable_name}} akan diganti dengan nilai variable
   */
  interpolate(str: string, variables: Record<string, string>): string {
    if (!str || !variables) return str;

    try {
      // Gunakan safe RegExp untuk variable pattern matching
      const variableRegex = createSafeRegExp('\\{\\{([^}]+)\\}\\}', 'g', {
        maxLength: 100,
        allowComplex: false,
      });

      return str.replace(variableRegex, (match, key) => {
        const trimmedKey = key.trim();
        // Validasi key menggunakan security utilities
        const keyValidation = validatePropertyName(trimmedKey);
        if (!keyValidation.isValid) {
          return match;
        }

        // Safe property access untuk variables
        const value = safePropertyAccess(variables, trimmedKey);
        return value !== undefined ? value : match;
      });
    } catch (error) {
      logger.warn(
        'Failed to interpolate variables',
        error,
        'variable-interpolator',
      );
      return str;
    }
  }

  /**
   * Interpolate headers dengan environment variables
   */
  interpolateHeaders(
    headers: Record<string, string>,
    variables: Record<string, string>,
  ): Record<string, string> {
    const interpolated: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      // Validasi key menggunakan security utilities
      const keyValidation = validatePropertyName(key);
      if (!keyValidation.isValid) {
        continue;
      }

      const interpolatedValue = this.interpolate(value, variables);
      // Safe property assignment
      safePropertyAssignment(interpolated, key, interpolatedValue);
    }

    return interpolated;
  }

  /**
   * Interpolate body dengan environment variables
   */
  interpolateBody(
    body: InterpolatableValue,
    variables: Record<string, string>,
  ): InterpolatableValue {
    if (typeof body === 'string') {
      try {
        const parsed = JSON.parse(body);
        const interpolated = this.interpolateObject(parsed, variables);
        return JSON.stringify(interpolated);
      } catch {
        return this.interpolate(body, variables);
      }
    } else if (typeof body === 'object' && body !== null) {
      return this.interpolateObject(body, variables);
    }

    return body;
  }

  /**
   * Interpolate object recursively
   */
  private interpolateObject(
    obj: InterpolatableValue,
    variables: Record<string, string>,
  ): InterpolatableValue {
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, variables));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: InterpolatedObject = {};
      for (const [key, value] of Object.entries(obj)) {
        // Validasi key menggunakan security utilities
        const keyValidation = validatePropertyName(key);
        if (!keyValidation.isValid) {
          continue;
        }

        let interpolatedValue: InterpolatableValue;
        if (typeof value === 'string') {
          interpolatedValue = this.interpolate(value, variables);
        } else {
          interpolatedValue = this.interpolateObject(value, variables);
        }

        // Safe property assignment
        safePropertyAssignment(result, key, interpolatedValue);
      }
      return result;
    }

    return obj;
  }

  /**
   * Extract variables dari string template
   */
  extractVariables(str: string): string[] {
    if (!str) return [];

    const matches = str.match(/\{\{([^}]+)\}\}/g);
    if (!matches) return [];

    return matches
      .map(match => match.replace(/\{\{([^}]+)\}\}/, '$1').trim())
      .filter((variable, index, self) => self.indexOf(variable) === index);
  }

  /**
   * Validate string template
   */
  validateTemplate(
    str: string,
    availableVariables: string[],
  ): {
    isValid: boolean;
    missingVariables: string[];
    invalidSyntax: string[];
  } {
    const missingVariables: string[] = [];
    const invalidSyntax: string[] = [];

    // Find all variable patterns
    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variablePattern.exec(str)) !== null) {
      const variableName = match[1].trim();

      // Check syntax
      if (
        !variableName ||
        variableName.includes(' ') ||
        variableName.includes('{{') ||
        variableName.includes('}}')
      ) {
        invalidSyntax.push(match[0]);
      } else if (!availableVariables.includes(variableName)) {
        missingVariables.push(variableName);
      }
    }

    return {
      isValid: missingVariables.length === 0 && invalidSyntax.length === 0,
      missingVariables,
      invalidSyntax,
    };
  }

  /**
   * Get all variables from environment
   */
  getEnvironmentVariables(environment: Environment): Record<string, string> {
    const variables: Record<string, string> = {};

    if (environment && environment.variables) {
      environment.variables
        .filter(variable => variable.enabled)
        .forEach(variable => {
          // Validasi key menggunakan security utilities
          const keyValidation = validatePropertyName(variable.key);
          if (keyValidation.isValid) {
            // Safe property assignment
            safePropertyAssignment(variables, variable.key, variable.value);
          }
        });
    }

    return variables;
  }

  /**
   * Process request configuration dengan environment variables
   */
  processRequestConfig(
    config: RequestConfig,
    environment: Environment,
  ): RequestConfig {
    const variables = this.getEnvironmentVariables(environment);

    return {
      ...config,
      url: this.interpolate(config.url || '', variables),
      headers: this.interpolateHeaders(config.headers || {}, variables),
      body: config.body
        ? this.interpolateBody(config.body, variables)
        : undefined,
    };
  }

  /**
   * Generate random value untuk dynamic variables
   */
  generateRandomValue(
    type: 'uuid' | 'timestamp' | 'number' | 'string',
  ): string {
    switch (type) {
      case 'uuid':
        // Check for crypto API availability (browser vs Node.js)
        if (
          typeof globalThis !== 'undefined' &&
          globalThis.crypto?.randomUUID
        ) {
          return globalThis.crypto.randomUUID();
        }
        // Fallback UUID generation
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      case 'timestamp':
        return Date.now().toString();
      case 'number':
        return Math.floor(Math.random() * 1000000).toString();
      case 'string':
        return Math.random().toString(36).substring(2, 15);
      default:
        return '';
    }
  }

  /**
   * Special variables handling
   */
  interpolateSpecialVariables(
    str: string,
    additionalVars?: Record<string, string>,
  ): string {
    const specialVars: Record<string, () => string> = {
      '{{$uuid}}': () => this.generateRandomValue('uuid'),
      '{{$timestamp}}': () => this.generateRandomValue('timestamp'),
      '{{$randomInt}}': () => this.generateRandomValue('number'),
      '{{$randomString}}': () => this.generateRandomValue('string'),
    };

    let result = str;

    // Process special variables
    for (const [pattern, generator] of Object.entries(specialVars)) {
      if (result.includes(pattern)) {
        // Safe regex construction with whitelist of allowed patterns
        const allowedPatterns = [
          '{{$uuid}}',
          '{{$timestamp}}',
          '{{$randomInt}}',
          '{{$randomString}}',
        ];
        if (allowedPatterns.includes(pattern)) {
          // Gunakan safe RegExp construction
          try {
            const safeRegex = createSafeRegExp(pattern, 'g', {
              maxLength: 50,
              allowComplex: false,
            });
            result = result.replace(safeRegex, generator());
          } catch (error) {
            logger.warn(
              `Failed to create regex for pattern ${pattern}`,
              error,
              'variable-interpolator',
            );
          }
        }
      }
    }

    // Process additional variables
    if (additionalVars) {
      result = this.interpolate(result, additionalVars);
    }

    return result;
  }
}

// Global instance
export const variableInterpolator = new VariableInterpolator();
