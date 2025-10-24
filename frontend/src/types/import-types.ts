import React from 'react';

export interface ImportedItem {
  id: string;
  name: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

// Extended ImportResult with type-specific data
export interface ImportResult {
  success: boolean;
  message: string;
  data?: ImportData;
  warnings?: string[];
  importedCount?: number;
}

export interface ImportData {
  type: 'postman' | 'openapi' | 'curl';
  items?: ImportedItem[];
  collections?: PostmanCollection[];
  version?: string;
  endpoints?: OpenAPIEndpoint[];
  method?: string;
  headers?: Record<string, string>;
}

export interface PostmanCollection {
  name: string;
  item?: PostmanItem[];
}

export interface PostmanItem {
  name: string;
  request?: {
    method: string;
    url: string | { raw: string };
    header?: Array<{ key: string; value: string }>;
    body?: {
      mode?: string;
      raw?: string;
      urlencoded?: Array<{ key: string; value: string }>;
      formdata?: Array<{ key: string; value: string; type?: string }>;
    };
  };
}

export interface OpenAPIEndpoint {
  path: string;
  method: string;
  summary?: string;
  description?: string;
}

export interface ImportTypeInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  acceptedFormats: string;
  example: string;
}
