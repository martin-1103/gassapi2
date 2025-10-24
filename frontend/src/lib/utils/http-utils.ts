/**
 * HTTP utilities untuk formatting dan helper functions
 */

import type { HttpResponseData, HttpHeader } from '@/types/http-client';

/**
 * Format response time untuk display
 */
export function formatResponseTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Format response size untuk display
 */
export function formatResponseSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes}B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)}KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

/**
 * Get status color based on HTTP status code
 */
export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return 'text-green-600';
  } else if (status >= 300 && status < 400) {
    return 'text-blue-600';
  } else if (status >= 400 && status < 500) {
    return 'text-orange-600';
  } else if (status >= 500) {
    return 'text-red-600';
  }
  return 'text-gray-600';
}

/**
 * Get status badge variant
 */
export function getStatusBadgeVariant(
  status: number,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status >= 200 && status < 300) {
    return 'default';
  } else if (status >= 300 && status < 400) {
    return 'secondary';
  } else if (status >= 400) {
    return 'destructive';
  }
  return 'outline';
}

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

/**
 * Parse headers dari berbagai format
 */
export function parseHeaders(
  headers: string | Record<string, string> | HttpHeader[],
): HttpHeader[] {
  // Kalau sudah format HttpHeader[]
  if (Array.isArray(headers)) {
    return headers;
  }

  // Kalau object
  if (typeof headers === 'object') {
    return Object.entries(headers).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));
  }

  // Kalau string (multi-line format)
  if (typeof headers === 'string') {
    return headers
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [key, ...valueParts] = line.split(':');
        return {
          key: key.trim(),
          value: valueParts.join(':').trim(),
          enabled: true,
        };
      });
  }

  return [];
}

/**
 * Convert HttpHeader[] to object
 */
export function headersToObject(headers: HttpHeader[]): Record<string, string> {
  return headers
    .filter(h => h.enabled)
    .reduce(
      (acc, header) => {
        acc[header.key] = header.value;
        return acc;
      },
      {} as Record<string, string>,
    );
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    // Check kalau relative URL atau with variable
    if (url.startsWith('/') || url.includes('{{')) {
      return true;
    }
    return false;
  }
}

/**
 * Get HTTP method color
 */
export function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'text-green-600';
    case 'POST':
      return 'text-blue-600';
    case 'PUT':
      return 'text-orange-600';
    case 'DELETE':
      return 'text-red-600';
    case 'PATCH':
      return 'text-purple-600';
    case 'HEAD':
      return 'text-gray-600';
    case 'OPTIONS':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get HTTP method badge variant
 */
export function getMethodBadgeVariant(
  method: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'default';
    case 'POST':
      return 'default';
    case 'PUT':
      return 'secondary';
    case 'DELETE':
      return 'destructive';
    case 'PATCH':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Extract domain dari URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback untuk browser yang ga support clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  } catch {
    return false;
  }
}

/**
 * Download response sebagai file
 */
export function downloadResponse(
  response: HttpResponseData,
  filename?: string,
): void {
  const { formatted } = formatResponseBody(response);
  const blob = new Blob([formatted], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `response-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate cURL command dari request config
 */
export function generateCurlCommand(config: {
  method: string;
  url: string;
  headers?: HttpHeader[];
  body?: any;
}): string {
  let curl = `curl -X ${config.method} '${config.url}'`;

  // Add headers
  if (config.headers && config.headers.length > 0) {
    config.headers
      .filter(h => h.enabled)
      .forEach(header => {
        curl += ` \\\n  -H '${header.key}: ${header.value}'`;
      });
  }

  // Add body
  if (config.body) {
    const bodyStr =
      typeof config.body === 'string'
        ? config.body
        : JSON.stringify(config.body);
    curl += ` \\\n  -d '${bodyStr}'`;
  }

  return curl;
}
