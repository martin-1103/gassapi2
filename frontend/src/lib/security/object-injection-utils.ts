/**
 * Object Injection Security Utilities
 *
 * Utility functions untuk mencegah object injection dan prototype pollution attacks
 */

import { logger } from '@/lib/logger';

/**
 * Whitelist dari safe property names yang diizinkan untuk dynamic access
 */
export const SAFE_PROPERTY_PATTERN = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

/**
 * Blacklist dari dangerous property names yang bisa menyebabkan prototype pollution
 */
export const DANGEROUS_PROPERTIES = [
  '__proto__',
  'prototype',
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf',
];

/**
 * Maximum depth untuk object traversal (mencegah infinite recursion)
 */
export const MAX_TRAVERSAL_DEPTH = 10;

/**
 * Maximum number of properties dalam object (mencegah DoS)
 */
export const MAX_PROPERTIES = 1000;

/**
 * Validasi property name untuk dynamic object access
 */
export function validatePropertyName(propertyName: string): {
  isValid: boolean;
  reason?: string;
} {
  if (typeof propertyName !== 'string') {
    return { isValid: false, reason: 'Property name must be a string' };
  }

  if (propertyName.length === 0) {
    return { isValid: false, reason: 'Property name cannot be empty' };
  }

  if (propertyName.length > 100) {
    return {
      isValid: false,
      reason: 'Property name too long (max 100 characters)',
    };
  }

  // Cek dangerous properties
  if (DANGEROUS_PROPERTIES.includes(propertyName)) {
    return { isValid: false, reason: 'Dangerous property name detected' };
  }

  // Cek pattern untuk safe property names
  if (!SAFE_PROPERTY_PATTERN.test(propertyName)) {
    return { isValid: false, reason: 'Invalid property name pattern' };
  }

  return { isValid: true };
}

/**
 * Safe property access dengan validasi
 */
export function safePropertyAccess<T = unknown>(
  obj: Record<string, unknown>,
  propertyName: string,
): T | undefined {
  const validation = validatePropertyName(propertyName);
  if (!validation.isValid) {
    logger.warn(
      `Unsafe property access blocked: ${validation.reason}`,
      { property: propertyName, obj: 'Object' },
      'object-injection-utils',
    );
    return undefined;
  }

  // Additional validation: cek apakah property ada di object itu sendiri
  if (
    obj &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, propertyName)
  ) {
    return obj[propertyName];
  }

  return undefined;
}

/**
 * Safe property assignment dengan validasi
 */
export function safePropertyAssignment<T>(
  obj: Record<string, unknown>,
  propertyName: string,
  value: T,
): boolean {
  const validation = validatePropertyName(propertyName);
  if (!validation.isValid) {
    logger.warn(
      `Unsafe property assignment blocked: ${validation.reason}`,
      { property: propertyName, value },
      'object-injection-utils',
    );
    return false;
  }

  // Validasi object
  if (!obj || typeof obj !== 'object') {
    logger.warn(
      'Invalid target object for property assignment',
      { property: propertyName, value },
      'object-injection-utils',
    );
    return false;
  }

  try {
    obj[propertyName] = value;
    return true;
  } catch (error) {
    logger.warn('Property assignment failed', error, 'object-injection-utils');
    return false;
  }
}

/**
 * Validasi object untuk keamanan
 */
export function validateObject(
  obj: unknown,
  options?: {
    maxDepth?: number;
    maxProperties?: number;
    allowFunctions?: boolean;
  },
): {
  isValid: boolean;
  reason?: string;
} {
  const maxDepth = options?.maxDepth || MAX_TRAVERSAL_DEPTH;
  const maxProperties = options?.maxProperties || MAX_PROPERTIES;
  const allowFunctions = options?.allowFunctions || false;

  if (obj === null || obj === undefined) {
    return { isValid: true }; // null dan undefined aman
  }

  if (typeof obj !== 'object') {
    return { isValid: false, reason: 'Input must be an object' };
  }

  // Cek object depth
  let depth = 0;
  const checkDepth = (current: unknown, currentDepth: number): boolean => {
    if (currentDepth > maxDepth) {
      return false;
    }

    if (current && typeof current === 'object') {
      depth = Math.max(depth, currentDepth);
      const keys = Object.keys(current);

      if (keys.length > maxProperties) {
        return false;
      }

      for (const key of keys) {
        if (!checkDepth(current[key], currentDepth + 1)) {
          return false;
        }
      }
    }

    return true;
  };

  if (!checkDepth(obj, 0)) {
    return {
      isValid: false,
      reason: 'Object too complex or too many properties',
    };
  }

  // Cek untuk dangerous properties di top level
  for (const dangerous of DANGEROUS_PROPERTIES) {
    if (Object.prototype.hasOwnProperty.call(obj, dangerous)) {
      return {
        isValid: false,
        reason: `Dangerous property detected: ${dangerous}`,
      };
    }
  }

  // Cek untuk functions jika tidak diizinkan
  if (!allowFunctions) {
    const checkForFunctions = (current: unknown): boolean => {
      if (typeof current === 'function') {
        return false;
      }

      if (current && typeof current === 'object') {
        for (const key in current) {
          if (Object.prototype.hasOwnProperty.call(current, key)) {
            if (!checkForFunctions(current[key])) {
              return false;
            }
          }
        }
      }

      return true;
    };

    if (!checkForFunctions(obj)) {
      return { isValid: false, reason: 'Functions not allowed in object' };
    }
  }

  return { isValid: true };
}

/**
 * Safe object cloning dengan validasi
 */
export function safeObjectClone<T>(
  obj: T,
  options?: {
    maxDepth?: number;
    maxProperties?: number;
  },
): T | null {
  const validation = validateObject(obj, options);
  if (!validation.isValid) {
    logger.warn(
      `Object cloning blocked: ${validation.reason}`,
      { obj: 'Object' },
      'object-injection-utils',
    );
    return null;
  }

  try {
    // Gunakan structuredClone jika tersedia (modern browsers)
    if (typeof globalThis !== 'undefined' && 'structuredClone' in globalThis) {
      return (
        globalThis as { structuredClone: (input: unknown) => unknown }
      ).structuredClone(obj);
    }

    // Fallback ke JSON parse/stringify (dengan validasi)
    const jsonString = JSON.stringify(obj);
    if (jsonString === undefined) {
      throw new Error('Failed to serialize object');
    }

    return JSON.parse(jsonString);
  } catch (error) {
    logger.warn('Object cloning failed', error, 'object-injection-utils');
    return null;
  }
}

/**
 * Safe object merging dengan pencegahan prototype pollution
 */
export function safeObjectMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T | null {
  if (!target || typeof target !== 'object') {
    logger.warn(
      'Invalid target object for merge',
      { target, source },
      'object-injection-utils',
    );
    return null;
  }

  if (!source || typeof source !== 'object') {
    logger.warn(
      'Invalid source object for merge',
      { target, source },
      'object-injection-utils',
    );
    return null;
  }

  const targetValidation = validateObject(target);
  if (!targetValidation.isValid) {
    logger.warn(
      `Target object validation failed: ${targetValidation.reason}`,
      { target, source },
      'object-injection-utils',
    );
    return null;
  }

  const sourceValidation = validateObject(source);
  if (!sourceValidation.isValid) {
    logger.warn(
      `Source object validation failed: ${sourceValidation.reason}`,
      { target, source },
      'object-injection-utils',
    );
    return null;
  }

  try {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const keyValidation = validatePropertyName(key);
        if (!keyValidation.isValid) {
          logger.warn(
            `Skipping dangerous property during merge: ${key}`,
            { key, target, source },
            'object-injection-utils',
          );
          continue;
        }

        result[key] = source[key];
      }
    }

    return result;
  } catch (error) {
    logger.warn('Object merge failed', error, 'object-injection-utils');
    return null;
  }
}

/**
 * Type guard untuk safe object types
 */
export function isSafeObject(obj: unknown): obj is Record<string, unknown> {
  const validation = validateObject(obj);
  return validation.isValid;
}

/**
 * Sanitize object key untuk dynamic access
 */
export function sanitizeObjectKey(key: string): string | null {
  if (typeof key !== 'string') {
    return null;
  }

  // Remove dangerous characters dan patterns
  const sanitized = key
    .replace(/[^a-zA-Z0-9_$]/g, '')
    .replace(/^[^a-zA-Z_$]/, '') // Ensure first character is valid
    .substring(0, 100); // Limit length

  const validation = validatePropertyName(sanitized);
  return validation.isValid ? sanitized : null;
}

// Export default untuk convenience
export default {
  validatePropertyName,
  safePropertyAccess,
  safePropertyAssignment,
  validateObject,
  safeObjectClone,
  safeObjectMerge,
  isSafeObject,
  sanitizeObjectKey,
  SAFE_PROPERTY_PATTERN,
  DANGEROUS_PROPERTIES,
  MAX_TRAVERSAL_DEPTH,
  MAX_PROPERTIES,
};
