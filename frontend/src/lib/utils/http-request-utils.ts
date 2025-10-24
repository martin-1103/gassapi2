import type { HttpResponseData, HttpHeader } from '@/types/http-client';

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