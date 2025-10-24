import { QueryParam } from '@/components/workspace/request-tabs/params-tab';

/**
 * Validates a query parameter
 */
export function validateQueryParam(param: QueryParam): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check if key is valid
  if (param.key && !isValidParamKey(param.key)) {
    errors.push('Parameter key contains invalid characters');
  }
  
  // Check if value is valid
  if (param.value && !isValidParamValue(param.value)) {
    errors.push('Parameter value contains invalid characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates all parameters in the list
 */
export function validateAllParams(params: QueryParam[]): {
  isValid: boolean;
  errors: { [id: string]: string[] };
} {
  const errors: { [id: string]: string[] } = {};
  
  params.forEach(param => {
    const validation = validateQueryParam(param);
    if (!validation.isValid) {
      errors[param.id] = validation.errors;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Checks if a parameter key is valid (only contains valid URL parameter characters)
 */
export function isValidParamKey(key: string): boolean {
  // Parameter key should contain only alphanumeric characters, hyphens, underscores, and dots
  const validKeyRegex = /^[a-zA-Z0-9_\-./]*$/;
  return validKeyRegex.test(key);
}

/**
 * Checks if a parameter value is valid (doesn't contain invalid URL characters)
 */
export function isValidParamValue(value: string): boolean {
  // Basic check to prevent potentially harmful characters
  // We allow most characters but block control characters
  const invalidCharRegex = /[\x00-\x1F\x7F]/;
  return !invalidCharRegex.test(value);
}

/**
 * Sanitizes a parameter key to make it URL-safe
 */
export function sanitizeParamKey(key: string): string {
  // Remove characters that could be problematic in URLs
  return key.replace(/[^a-zA-Z0-9_\-./]/g, '');
}

/**
 * Sanitizes a parameter value to make it URL-safe
 */
export function sanitizeParamValue(value: string): string {
  // Remove control characters but preserve other characters
  return value.replace(/[\x00-\x1F\x7F]/g, '');
}