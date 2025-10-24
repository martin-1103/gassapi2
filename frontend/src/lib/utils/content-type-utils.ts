import type { HttpResponseData } from '@/types/http-client';

/**
 * Pretty print JSON dengan indentation
 */
export function prettyPrintJson(data: any): string {
  try {
    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

/**
 * Format response body berdasarkan content type
 */
export function formatResponseBody(response: HttpResponseData): {
  formatted: string;
  type: 'json' | 'html' | 'xml' | 'text' | 'binary';
} {
  const contentType = response.headers['content-type']?.toLowerCase() || '';

  // JSON
  if (contentType.includes('application/json')) {
    try {
      const formatted = prettyPrintJson(response.data);
      return { formatted, type: 'json' };
    } catch {
      return { formatted: String(response.data), type: 'text' };
    }
  }

  // HTML
  if (contentType.includes('text/html')) {
    return { formatted: String(response.data), type: 'html' };
  }

  // XML
  if (
    contentType.includes('application/xml') ||
    contentType.includes('text/xml')
  ) {
    return { formatted: String(response.data), type: 'xml' };
  }

  // Binary
  if (
    contentType.includes('application/octet-stream') ||
    contentType.includes('image/') ||
    contentType.includes('video/') ||
    contentType.includes('audio/')
  ) {
    return { formatted: '[Binary Data]', type: 'binary' };
  }

  // Default: text
  return { formatted: String(response.data), type: 'text' };
}