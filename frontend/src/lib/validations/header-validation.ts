/**
 * Header validation utilities
 * Extracted from RequestHeadersTab for better organization
 */

import { RequestHeader } from '@/lib/utils/header-utils';

export interface ValidationError {
  field: 'key' | 'value';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validasi format header name
 */
export function validateHeaderName(key: string): string | null {
  if (!key || !key.trim()) {
    return 'Header name is required';
  }

  // Header name tidak boleh mengandung whitespace
  if (/\s/.test(key)) {
    return 'Header name cannot contain spaces';
  }

  // Header name harus valid HTTP token
  if (!/^[a-zA-Z0-9!#$%&'*+\-.^_`|~]+$/.test(key)) {
    return 'Header name contains invalid characters';
  }

  // Header name case-insensitive, tapi biasanya Title-Case
  if (key !== key.trim()) {
    return 'Header name cannot have leading or trailing spaces';
  }

  return null;
}

/**
 * Validasi header value
 */
export function validateHeaderValue(value: string): string | null {
  // Value boleh kosong (untuk headers tertentu)
  if (value === undefined) {
    return null;
  }

  // HTTP header value tidak boleh mengandung CRLF
  if (/[\r\n]/.test(value)) {
    return 'Header value cannot contain line breaks';
  }

  return null;
}

/**
 * Validasi single header object
 */
export function validateHeader(header: RequestHeader): ValidationResult {
  const errors: ValidationError[] = [];

  const keyError = validateHeaderName(header.key);
  if (keyError) {
    errors.push({ field: 'key', message: keyError });
  }

  const valueError = validateHeaderValue(header.value);
  if (valueError) {
    errors.push({ field: 'value', message: valueError });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validasi array of headers
 */
export function validateHeaders(headers: RequestHeader[]): {
  isValid: boolean;
  errors: Array<{ headerId: string; errors: ValidationError[] }>;
} {
  const allErrors: Array<{ headerId: string; errors: ValidationError[] }> = [];

  for (const header of headers) {
    const validation = validateHeader(header);
    if (!validation.isValid) {
      allErrors.push({
        headerId: header.id,
        errors: validation.errors,
      });
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Cek apakah header key duplikat (case-insensitive)
 */
export function findDuplicateHeaders(headers: RequestHeader[]): string[] {
  const seenKeys = new Set<string>();
  const duplicates: string[] = [];

  for (const header of headers) {
    if (!header.key || !header.enabled) continue;

    const lowerKey = header.key.toLowerCase();
    if (seenKeys.has(lowerKey)) {
      duplicates.push(header.id);
    } else {
      seenKeys.add(lowerKey);
    }
  }

  return duplicates;
}

/**
 * Cek apakah header valid untuk dikirim
 */
export function isValidForRequest(header: RequestHeader): boolean {
  if (!header.enabled) return false;
  if (!header.key || !header.key.trim()) return false;

  const validation = validateHeader(header);
  return validation.isValid;
}

/**
 * Filter hanya header yang valid untuk request
 */
export function getValidHeadersForRequest(headers: RequestHeader[]): RequestHeader[] {
  return headers.filter(isValidForRequest);
}