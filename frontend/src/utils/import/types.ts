import * as React from 'react';

export interface ImportResult {
  success: boolean;
  message: string;
  data?: ImportedData;
  warnings?: string[];
  importedCount?: number;
}

export interface ImportedData {
  type: 'postman' | 'openapi' | 'curl';
  name: string;
  description: string;
  version?: string;
  baseUrl?: string;
  servers?: string[];
  endpoints?: ImportedEndpoint[];
  collections?: ImportedCollection[];
  components?: Record<string, unknown>;
  info?: Record<string, unknown>;
}

export interface ImportedEndpoint {
  id: string;
  name: string;
  method: string;
  url: string;
  fullUrl?: string;
  description?: string;
  parameters?: unknown[];
  headers?: Record<string, string>;
  body?: string;
  responses?: Record<string, unknown>;
  tags?: string[];
  deprecated?: boolean;
  order?: number;
}

export interface ImportedCollection {
  id: string;
  name: string;
  description: string;
  request?: unknown;
  item?: ImportedEndpoint[];
}

export interface ImportTypeInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFormats: string;
  example: string;
}

export type ImportType = 'postman' | 'openapi' | 'curl';
export type ImportMethod = 'file' | 'url';

export interface Parser {
  parse(content: string): Promise<ImportResult>;
}

export interface ImportValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
