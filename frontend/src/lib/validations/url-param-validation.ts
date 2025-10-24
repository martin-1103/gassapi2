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
  // Check for characters with ASCII codes < 32 (control characters) and DEL (127)
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    if (
      (charCode >= 0 && charCode <= 8) ||
      (charCode >= 11 && charCode <= 12) ||
      (charCode >= 14 && charCode <= 31) ||
      charCode === 127
    ) {
      return false;
    }
  }
  return true;
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
  // Use character code filtering instead of regex with control characters
  let result = '';
  for (let i = 0; i < value.length; i++) {
    const charCode = value.charCodeAt(i);
    // Skip control characters (ASCII < 32, except tab=9, newline=10, carriage=13)
    // and DEL character (127)
    if (
      !(
        (charCode >= 0 && charCode <= 8) ||
        (charCode >= 11 && charCode <= 12) ||
        (charCode >= 14 && charCode <= 31) ||
        charCode === 127
      )
    ) {
      result += value[i];
    }
  }
  return result;
}
