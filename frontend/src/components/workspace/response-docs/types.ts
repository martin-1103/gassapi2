// Type definitions untuk response documentation components

import { SchemaProperty } from './utils/schema-utils';

export interface SchemaPropertyExtended extends SchemaProperty {
  description?: string;
  example?: unknown;
}

export interface ApiEndpoint {
  method: string;
  url: string;
  description?: string;
  parameters?: Array<{
    name: string;
    in: 'query' | 'path' | 'header';
    required: boolean;
    type: string;
    description?: string;
    schema?: SchemaProperty;
  }>;
  requestBody?: {
    description?: string;
    required: boolean;
    content: Record<
      string,
      {
        schema: SchemaProperty;
      }
    >;
  };
  responses: Record<
    string,
    {
      description?: string;
      content: Record<
        string,
        {
          schema: SchemaProperty;
        }
      >;
    }
  >;
  security?: Array<{
    type: string;
    scheme: string;
    description?: string;
    name: string;
    in: string;
  }>;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time?: number;
  size?: number;
}

export interface RequestInfo {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ResponseDocsTabProps {
  response: ApiResponse;
  requestInfo?: RequestInfo;
}

export interface DocumentationViewerProps {
  endpoint: ApiEndpoint;
  response: ApiResponse;
  showSchema: boolean;
  onToggleSchema: () => void;
  onCopySchema: () => void;
  onCopyDocs: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
}

export interface SchemaGeneratorProps {
  endpoint: ApiEndpoint;
  showSchema: boolean;
  onCopySchema: () => void;
}

export interface ExportManagerProps {
  endpoint: ApiEndpoint;
  response: ApiResponse;
  requestInfo?: RequestInfo;
  onCopyDocumentation: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
}
