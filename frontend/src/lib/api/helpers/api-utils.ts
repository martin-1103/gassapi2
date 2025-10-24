/**
 * Utility functions for API operations
 */

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
    return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
  });
}
