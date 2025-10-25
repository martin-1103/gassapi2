/**
 * Utility functions for API operations
 */

import { safePropertyAccess } from '@/lib/security/object-injection-utils';

/**
 * Validates if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Interpolates variables into a URL template
 */
export function interpolateUrl(
  url: string,
  variables: Record<string, string>,
): string {
  if (!url || !variables) return url;

  return url.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    // Validate key to prevent prototype pollution
    if (
      !trimmedKey ||
      typeof trimmedKey !== 'string' ||
      trimmedKey === '__proto__' ||
      trimmedKey === 'constructor' ||
      trimmedKey === 'prototype'
    ) {
      return match;
    }

    const value = safePropertyAccess(variables, trimmedKey);
    return value !== undefined ? value : match;
  });
}
