import type { CodeSnippet, RequestData } from './types';

// Export common types for template files
export type { CodeSnippet, RequestData };

// Utility functions untuk template generation
export function escapeJsonString(json: unknown): string {
  return JSON.stringify(json).replace(/"/g, '\\"');
}

export function formatHeaders(headers: Record<string, string>): string {
  return JSON.stringify(headers, null, 2);
}

export function generateCurlHeaders(headers: Record<string, string>): string {
  return Object.entries(headers)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' ');
}

export function formatHeadersForCode(
  headers: Record<string, string>,
  indent: string = '',
): string {
  return Object.entries(headers)
    .map(([key, value]) => `${indent}.header("${key}", "${value}")`)
    .join('\n');
}

export function formatPowerShellHeaders(
  headers: Record<string, string>,
): string {
  return Object.entries(headers)
    .map(([key, value]) => `'${key}' = '${value}'`)
    .join('; ');
}
