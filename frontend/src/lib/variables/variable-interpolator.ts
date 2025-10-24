/**
 * Environment Variable Interpolator
 * Menangani variable substitution di URLs, headers, dan body
 */

export interface EnvironmentVariable {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface Environment {
  id: string;
  name: string;
  variables: EnvironmentVariable[];
  is_default?: boolean;
}

export class VariableInterpolator {
  /**
   * Interpolate string dengan environment variables
   * {{variable_name}} akan diganti dengan nilai variable
   */
  interpolate(str: string, variables: Record<string, string>): string {
    if (!str || !variables) return str;

    return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      return variables[trimmedKey] !== undefined
        ? variables[trimmedKey]
        : match;
    });
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
      interpolated[key] = this.interpolate(value, variables);
    }

    return interpolated;
  }

  /**
   * Interpolate body dengan environment variables
   */
  interpolateBody(body: any, variables: Record<string, string>): any {
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
  private interpolateObject(obj: any, variables: Record<string, string>): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.interpolateObject(item, variables));
    } else if (typeof obj === 'object' && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          result[key] = this.interpolate(value, variables);
        } else {
          result[key] = this.interpolateObject(value, variables);
        }
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
          variables[variable.key] = variable.value;
        });
    }

    return variables;
  }

  /**
   * Process request configuration dengan environment variables
   */
  processRequestConfig(config: any, environment: Environment): any {
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
        return crypto.randomUUID();
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
        result = result.replace(
          new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          generator(),
        );
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
