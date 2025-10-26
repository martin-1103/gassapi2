/**
 * Shared utilities for MCP2 Tools
 * Common helper functions used across modules
 */

import { ValidationError } from '../types/index.js';

/**
 * Validation utilities
 */
export class ValidationUtils {
  /**
   * Validate required fields
   */
  static validateRequired(data: any, requiredFields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      if (!data[field]) {
        errors.push({
          field,
          message: `${field} is required`,
          value: data[field]
        });
      }
    }

    return errors;
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate HTTP method
   */
  static validateHttpMethod(method: string): boolean {
    const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    return validMethods.includes(method.toUpperCase());
  }

  /**
   * Validate timeout value
   */
  static validateTimeout(timeout: any): boolean {
    const num = Number(timeout);
    return !isNaN(num) && num > 0 && num <= 300000; // Max 5 minutes
  }
}

/**
 * String interpolation utilities
 */
export class StringUtils {
  /**
   * Simple template interpolation
   */
  static interpolate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  /**
   * Convert object to query string
   */
  static toQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        params.append(key, String(value));
      }
    }

    return params.toString();
  }

  /**
   * Generate random ID
   */
  static generateId(length: number = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
  }

  /**
   * Truncate string with ellipsis
   */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }
}

/**
 * Time utilities
 */
export class TimeUtils {
  /**
   * Format milliseconds to human readable format
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }

  /**
   * Get current timestamp in ISO format
   */
  static now(): string {
    return new Date().toISOString();
  }

  /**
   * Parse timeout value with default
   */
  static parseTimeout(value?: any, defaultValue: number = 30000): number {
    if (!value) return defaultValue;
    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : Math.max(1000, Math.min(300000, parsed));
  }
}

/**
 * Object utilities
 */
export class ObjectUtils {
  /**
   * Deep merge objects
   */
  static deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Remove undefined values from object
   */
  static removeUndefined(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.filter(item => item !== undefined).map(item => this.removeUndefined(item));

    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        result[key] = this.removeUndefined(value);
      }
    }

    return result;
  }

  /**
   * Pick specific keys from object
   */
  static pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const result = {} as Pick<T, K>;

    for (const key of keys) {
      if (key in obj) {
        result[key] = obj[key];
      }
    }

    return result;
  }
}

/**
 * Error utilities
 */
export class ErrorUtils {
  /**
   * Create standardized error response
   */
  static createErrorResponse(message: string, code?: string, details?: any) {
    return {
      success: false,
      error: message,
      code: code || 'UNKNOWN_ERROR',
      details,
      timestamp: TimeUtils.now()
    };
  }

  /**
   * Extract meaningful error message from error object
   */
  static extractMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'Unknown error occurred';
  }

  /**
   * Check if error is network related
   */
  static isNetworkError(error: any): boolean {
    const message = this.extractMessage(error).toLowerCase();
    return message.includes('network') ||
           message.includes('fetch') ||
           message.includes('timeout') ||
           message.includes('connection');
  }
}

/**
 * Async utilities
 */
export class AsyncUtils {
  /**
   * Sleep for specified milliseconds
   */
  static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute with timeout
   */
  static async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  /**
   * Retry async function
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt < maxAttempts) {
          await this.sleep(delayMs * attempt); // Exponential backoff
        }
      }
    }

    throw lastError;
  }
}