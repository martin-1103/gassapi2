import {
  // Content type utilities
  prettyPrintJson,
  formatResponseBody,
} from './content-type-utils';
import {
  // Request utilities
  parseHeaders,
  headersToObject,
  isValidUrl,
  extractDomain,
  getMethodColor,
  getMethodBadgeVariant,
  generateCurlCommand,
} from './http-request-utils';
import {
  // Response utilities
  formatResponseTime,
  formatResponseSize,
  getStatusColor,
  getStatusBadgeVariant,
  copyToClipboard,
  downloadResponse,
} from './http-response-utils';

/**
 * Unified HTTP utilities class that provides access to all HTTP-related utilities
 */
export class HttpUtils {
  // Request-related utilities
  static parseHeaders = parseHeaders;
  static headersToObject = headersToObject;
  static isValidUrl = isValidUrl;
  static extractDomain = extractDomain;
  static getMethodColor = getMethodColor;
  static getMethodBadgeVariant = getMethodBadgeVariant;
  static generateCurlCommand = generateCurlCommand;

  // Response-related utilities
  static formatResponseTime = formatResponseTime;
  static formatResponseSize = formatResponseSize;
  static getStatusColor = getStatusColor;
  static getStatusBadgeVariant = getStatusBadgeVariant;
  static copyToClipboard = copyToClipboard;
  static downloadResponse = downloadResponse;

  // Content-type and formatting utilities
  static prettyPrintJson = prettyPrintJson;
  static formatResponseBody = formatResponseBody;
}
