/**
 * Main Library Exports
 * Central export point untuk semua HTTP client functionality
 */

// Direct API Client
export {
  directApiClient,
  DirectApiClient,
  type HttpRequestConfig,
  type HttpResponseData,
  type HttpError,
  type HttpMethod,
  type HttpHeader,
  type HttpQueryParam,
  type HttpRequestBody,
} from './api';

// CORS Handler
export { corsHandler, CorsHandler } from './api/cors-handler';

// Variable Interpolation
export {
  VariableInterpolator,
  interpolateString,
  interpolateVariables,
  type VariableContext,
  type InterpolationResult,
} from './variables';

// Request History
export {
  requestHistory,
  RequestHistoryManager,
  type RequestHistoryItem,
  type RequestHistoryFilter,
} from './history';

// HTTP Utilities
export {
  formatResponseTime,
  formatResponseSize,
  getStatusColor,
  getStatusBadgeVariant,
  prettyPrintJson,
  formatResponseBody,
  parseHeaders,
  headersToObject,
  isValidUrl,
  getMethodColor,
  getMethodBadgeVariant,
  extractDomain,
  copyToClipboard,
  downloadResponse,
  generateCurlCommand,
} from './utils/http-utils';
