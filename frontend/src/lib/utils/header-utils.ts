/**
 * Header-related utility functions
 * Extracted from RequestHeadersTab for better organization
 */

export interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export const COMMON_HEADERS = [
  {
    key: 'Content-Type',
    value: 'application/json',
    description: 'Media type of request body',
  },
  {
    key: 'Accept',
    value: 'application/json',
    description: 'Media types that are acceptable',
  },
  {
    key: 'Authorization',
    value: 'Bearer {{token}}',
    description: 'Authentication credentials',
  },
  {
    key: 'User-Agent',
    value: 'GASS-API/1.0',
    description: 'Client identification',
  },
  { key: 'Cache-Control', value: 'no-cache', description: 'Cache directives' },
  {
    key: 'X-Requested-With',
    value: 'XMLHttpRequest',
    description: 'AJAX request identifier',
  },
  {
    key: 'X-API-Key',
    value: '{{api_key}}',
    description: 'API key authentication',
  },
  { key: 'X-Client-Version', value: '1.0.0', description: 'Client version' },
];

/**
 * Buat header baru dengan ID unik
 */
export function createHeader(data: Partial<RequestHeader> = {}): RequestHeader {
  return {
    id: Date.now().toString(),
    key: '',
    value: '',
    enabled: true,
    ...data,
  };
}

/**
 * Convert header array ke object untuk API request
 */
export function headersToObject(headers: RequestHeader[]): Record<string, string> {
  const enabledHeaders = headers.filter(header => header.enabled && header.key);
  return enabledHeaders.reduce((acc, header) => {
    acc[header.key] = header.value;
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Format headers sebagai text untuk clipboard
 */
export function headersToText(headers: RequestHeader[]): string {
  const headersObj = headersToObject(headers);
  return Object.entries(headersObj)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
}

/**
 * Format headers sebagai cURL command
 */
export function headersToCurl(headers: RequestHeader[], url = 'https://example.com'): string {
  const headersObj = headersToObject(headers);
  const curlHeaders = Object.entries(headersObj)
    .map(([key, value]) => `-H "${key}: ${value}"`)
    .join(' \\\n  ');

  return `curl -X GET \\
  ${curlHeaders} \\
  ${url}`;
}

/**
 * Hitung header yang enabled
 */
export function getEnabledHeadersCount(headers: RequestHeader[]): number {
  return headers.filter(h => h.enabled).length;
}

/**
 * Filter hanya header yang enabled
 */
export function getEnabledHeaders(headers: RequestHeader[]): RequestHeader[] {
  return headers.filter(header => header.enabled);
}

/**
 * Cari header berdasarkan ID
 */
export function findHeaderById(headers: RequestHeader[], id: string): RequestHeader | undefined {
  return headers.find(header => header.id === id);
}

/**
 * Update header berdasarkan ID
 */
export function updateHeaderById(
  headers: RequestHeader[],
  id: string,
  updates: Partial<RequestHeader>
): RequestHeader[] {
  return headers.map(header =>
    header.id === id ? { ...header, ...updates } : header
  );
}

/**
 * Hapus header berdasarkan ID
 */
export function deleteHeaderById(headers: RequestHeader[], id: string): RequestHeader[] {
  return headers.filter(header => header.id !== id);
}

/**
 * Duplicate header
 */
export function duplicateHeader(headers: RequestHeader[], id: string): RequestHeader[] {
  const header = findHeaderById(headers, id);
  if (!header) return headers;

  const newHeader = createHeader({
    key: header.key,
    value: header.value,
    enabled: header.enabled,
    description: header.description,
  });

  return [...headers, newHeader];
}