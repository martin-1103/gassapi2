/**
 * Type definitions untuk OpenAPI 3.0 dan Swagger 2.0 specifications
 */

// OpenAPI/Swagger base types
export interface OpenAPIDocument {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    description?: string;
    version: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
    variables?: Record<string, unknown>;
  }>;
  paths: Record<string, PathItem>;
  components?: Components;
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
  head?: Operation;
  options?: Operation;
  parameters?: Parameter[];
  summary?: string;
  description?: string;
}

export interface Operation {
  operationId?: string;
  summary?: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  tags?: string[];
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: {
    type?: string;
    example?: unknown;
  };
  example?: unknown;
}

export interface RequestBody {
  description?: string;
  content?: {
    'application/json'?: MediaType;
    'application/xml'?: MediaType;
    'text/plain'?: MediaType;
    'application/x-www-form-urlencoded'?: MediaType;
    'multipart/form-data'?: MediaType;
  };
}

export interface MediaType {
  schema?: {
    type?: string;
    example?: unknown;
  };
  example?: unknown;
}

export interface Response {
  description: string;
  content?: Record<string, MediaType>;
}

export interface Components {
  schemas?: Record<string, unknown>;
  responses?: Record<string, Response>;
  parameters?: Record<string, Parameter>;
  requestBodies?: Record<string, RequestBody>;
  securitySchemes?: Record<string, unknown>;
}

// YAML Parser types
export interface YamlNode {
  [key: string]: YamlValue;
}

export type YamlValue = string | number | boolean | YamlNode | YamlNode[];
