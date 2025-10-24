import { ExecutionError, ErrorCodes } from '../types/execution.types.js';
import { logger } from '../utils/Logger.js';

/**
 * Safe Expression Evaluator
 * Evaluates JavaScript expressions in a sandboxed environment
 */
export class SafeExpressionEvaluator {
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
    Object: Object,
    RegExp: RegExp,
    isNaN: isNaN,
    isFinite: isFinite,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent
  };

  private static readonly MAX_EXPRESSION_LENGTH = 1000;
  private static readonly MAX_EXECUTION_TIME = 5000; // 5 seconds

  /**
   * Evaluate a JavaScript expression safely
   */
  static evaluate(expression: string, context: Record<string, any> = {}): any {
    try {
      // Validate expression
      const validation = this.validateExpression(expression);
      if (!validation.isValid) {
        throw new ExecutionError(
          `Expression validation failed: ${validation.errors.join(', ')}`,
          ErrorCodes.UNSAFE_EXPRESSION
        );
      }

      // Sanitize expression
      const sanitized = this.sanitizeExpression(expression);

      // Create safe context
      const safeContext = this.createSafeContext(context);

      // Evaluate with timeout
      return this.evaluateWithTimeout(sanitized, safeContext);

    } catch (error) {
      logger.error('Expression evaluation failed', {
        error: error instanceof Error ? error.message : String(error),
        expression: expression.substring(0, 100)
      }, 'SafeExpressionEvaluator');

      if (error instanceof ExecutionError) {
        throw error;
      }

      throw new ExecutionError(
        `Expression evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
        ErrorCodes.CONDITION_EVALUATION_ERROR,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Validate expression before evaluation
   */
  private static validateExpression(expression: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check length
    if (expression.length > this.MAX_EXPRESSION_LENGTH) {
      errors.push(`Expression too long (max ${this.MAX_EXPRESSION_LENGTH} characters)`);
    }

    // Check for empty expression
    if (!expression.trim()) {
      errors.push('Expression cannot be empty');
    }

    // Check for dangerous patterns
    const dangerousPatterns = [
      { pattern: /import\s+.*\s+from/i, message: 'Import statements not allowed' },
      { pattern: /require\s*\(/i, message: 'Require calls not allowed' },
      { pattern: /eval\s*\(/i, message: 'Eval calls not allowed' },
      { pattern: /function\s*\(/i, message: 'Function declarations not allowed' },
      { pattern: /=>\s*{/, message: 'Arrow function with body not allowed' },
      { pattern: /constructor/i, message: 'Constructor access not allowed' },
      { pattern: /prototype/i, message: 'Prototype access not allowed' },
      { pattern: /__proto__/i, message: '__proto__ access not allowed' },
      { pattern: /process\./i, message: 'Process access not allowed' },
      { pattern: /global\./i, message: 'Global access not allowed' },
      { pattern: /window\./i, message: 'Window access not allowed' },
      { pattern: /document\./i, message: 'Document access not allowed' },
      { pattern: /console\./i, message: 'Console access not allowed' },
      { pattern: /setTimeout\s*\(/i, message: 'setTimeout not allowed' },
      { pattern: /setInterval\s*\(/i, message: 'setInterval not allowed' },
      { pattern: /XMLHttpRequest/i, message: 'XMLHttpRequest not allowed' },
      { pattern: /fetch\s*\(/i, message: 'Fetch calls not allowed' },
      { pattern: /new\s+(Function|eval|XMLHttpRequest|WebSocket)/i, message: 'Dangerous constructor calls not allowed' },
      { pattern: /while\s*\(/i, message: 'While loops not allowed' },
      { pattern: /for\s*\(/i, message: 'For loops not allowed' },
      { pattern: /\bdo\s*\{/i, message: 'Do-while loops not allowed' },
      { pattern: /\}\s*while\s*\(/i, message: 'Do-while loops not allowed' }
    ];

    dangerousPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(expression)) {
        errors.push(message);
      }
    });

    // Check for nested brackets (potential infinite recursion)
    const bracketCount = (expression.match(/\{/g) || []).length;
    if (bracketCount > 3) {
      errors.push('Too many nested brackets');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize expression to remove dangerous constructs
   */
  private static sanitizeExpression(expression: string): string {
    let sanitized = expression.trim();

    // Remove comments
    sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
    sanitized = sanitized.replace(/\/\/.*$/gm, '');

    // Remove semicolons at the end (to prevent multiple statements)
    sanitized = sanitized.replace(/;+\s*$/, '');

    // Ensure it's a single expression
    if (sanitized.includes(';')) {
      throw new Error('Multiple statements not allowed');
    }

    return sanitized;
  }

  /**
   * Create safe evaluation context
   */
  private static createSafeContext(userContext: Record<string, any>): Record<string, any> {
    const safeContext = { ...this.ALLOWED_GLOBALS };

    // Add user context with validation
    for (const [key, value] of Object.entries(userContext)) {
      if (this.isValidContextKey(key)) {
        safeContext[key] = this.sanitizeContextValue(value);
      }
    }

    return safeContext;
  }

  /**
   * Check if context key is valid
   */
  private static isValidContextKey(key: string): boolean {
    // Must be valid JavaScript identifier
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) &&
           !Object.keys(this.ALLOWED_GLOBALS).includes(key);
  }

  /**
   * Sanitize context value
   */
  private static sanitizeContextValue(value: any): any {
    // Allow primitives
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }

    // Allow arrays with primitive values
    if (Array.isArray(value)) {
      return value.filter(item =>
        typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
      );
    }

    // Allow plain objects with primitive values
    if (value && typeof value === 'object' && value.constructor === Object) {
      const sanitized: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        if (this.isValidContextKey(key)) {
          sanitized[key] = this.sanitizeContextValue(val);
        }
      }
      return sanitized;
    }

    // Convert everything else to string
    return String(value);
  }

  /**
   * Evaluate expression with timeout
   */
  private static evaluateWithTimeout(expression: string, context: Record<string, any>): any {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Expression evaluation timeout'));
      }, this.MAX_EXECUTION_TIME);

      try {
        // Create function with limited scope
        const func = new Function(...Object.keys(context), `return (${expression})`);
        const result = func(...Object.values(context));

        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Test expression for syntax validity
   */
  static testExpression(expression: string): { isValid: boolean; error?: string } {
    try {
      const validation = this.validateExpression(expression);
      if (!validation.isValid) {
        return { isValid: false, error: validation.errors[0] };
      }

      // Try to create function (syntax check)
      new Function('Math', `return (${expression})`);
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get allowed functions and variables
   */
  static getAllowedGlobals(): string[] {
    return Object.keys(this.ALLOWED_GLOBALS);
  }
}