/**
 * Type definitions untuk Direct HTTP Client
 * Mendukung testing API secara langsung tanpa melalui backend proxy
 */

export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

export type ContentType =
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'application/xml'
  | 'text/html'
  | 'application/octet-stream';

export type BodyType =
  | 'none'
  | 'json'
  | 'form-data'
  | 'x-www-form-urlencoded'
  | 'raw'
  | 'binary';

export interface HttpHeader {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface HttpQueryParam {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface FormDataField {
  key: string;
  value: string | File;
  type: 'text' | 'file';
  enabled: boolean;
  description?: string;
}

export interface HttpRequestBody {
  type: BodyType;
  raw?: string;
  json?: any;
  formData?: FormDataField[];
  urlEncoded?: Array<{ key: string; value: string; enabled: boolean }>;
  binary?: File;
}

export interface HttpRequestConfig {
  url: string;
  method: HttpMethod;
  headers?: HttpHeader[];
  queryParams?: HttpQueryParam[];
  body?: HttpRequestBody;
  timeout?: number;
  followRedirects?: boolean;
  validateSSL?: boolean;
  proxyUrl?: string;
  environment?: Record<string, string>;
}

export interface HttpResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number; // dalam milliseconds
  size: number; // dalam bytes
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
}

export interface HttpError {
  type: 'network' | 'timeout' | 'cors' | 'ssl' | 'proxy' | 'unknown';
  message: string;
  originalError?: Error;
  response?: {
    status?: number;
    statusText?: string;
    data?: any;
  };
}

export interface RequestHistoryItem {
  id: string;
  timestamp: number;
  request: HttpRequestConfig;
  response?: HttpResponseData;
  error?: HttpError;
  duration: number;
  collectionId?: string;
  endpointId?: string;
  environmentId?: string;
}

export interface RequestHistoryFilter {
  method?: HttpMethod;
  status?: number;
  search?: string;
  dateFrom?: number;
  dateTo?: number;
  collectionId?: string;
  endpointId?: string;
}

export interface EnvironmentContext {
  id: string;
  name: string;
  variables: Record<string, string>;
  isActive: boolean;
}

export interface VariableContext {
  environment?: EnvironmentContext;
  collection?: Record<string, string>;
  global?: Record<string, string>;
}

export interface InterpolationResult {
  value: string;
  variables: Array<{
    name: string;
    value: string;
    source: 'environment' | 'collection' | 'global';
  }>;
  errors: Array<{
    variable: string;
    message: string;
  }>;
}

export interface CorsProxyConfig {
  enabled: boolean;
  url: string;
  bypassDomains?: string[];
}

export interface RuntimeEnvironment {
  type: 'web' | 'electron';
  corsMode: 'direct' | 'proxy' | 'electron-bypass';
  corsProxyConfig?: CorsProxyConfig;
}
