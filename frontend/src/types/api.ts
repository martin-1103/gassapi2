// API Response types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message?: string;
  duration?: number;
}

export interface ConsoleEntry {
  level: 'info' | 'warn' | 'error' | 'debug' | 'log';
  message: string;
  timestamp: number;
  source?: string;
  data?: unknown;
  duration?: number;
  stackTrace?: string;
}

export interface CookieData {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
  redirected?: boolean;
  redirectUrl?: string;
  cookies?: Record<string, CookieData>;
  testResults?: TestResult[];
  console?: ConsoleEntry[];
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
  };
}

export interface EndpointResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth request types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectListResponse {
  data: Project[];
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

// Endpoint types
export interface Endpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: Array<{ key: string; value: string; enabled: boolean }>;
  params?: Array<{ key: string; value: string; enabled: boolean }>;
  body?: unknown;
  auth?: AuthData;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Authentication types
export interface AuthData {
  type: 'noauth' | 'bearer' | 'basic' | 'apikey' | 'oauth2';
  bearer?: {
    token: string;
  };
  basic?: {
    username: string;
    password: string;
  };
  apikey?: {
    key: string;
    value: string;
    addTo: 'header' | 'query';
  };
  oauth2?: {
    grantType: 'authorization_code' | 'client_credentials' | 'password';
    clientId: string;
    clientSecret: string;
    scope?: string;
    redirectUri?: string;
    authUrl?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

// Request body types
export type RequestBody = string | Record<string, unknown> | unknown;

// Error types
export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}
