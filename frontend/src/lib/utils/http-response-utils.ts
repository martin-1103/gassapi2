import type { HttpResponseData } from '@/types/http-client';
import { prettyPrintJson, formatResponseBody } from './content-type-utils';

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