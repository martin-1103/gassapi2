import { ImportResult } from '@/types/import-types';

// Type definitions for better type safety
interface PostmanHeader {
  key?: string;
  value?: string;
  disabled?: boolean;
}

interface PostmanRequest {
  method?: string;
  url?: {
    raw?: string;
  };
  header?: PostmanHeader[];
  body?: {
    raw?: string;
  };
  description?: string;
}

interface PostmanItem {
  name?: string;
  description?: string;
  request?: PostmanRequest;
  item?: PostmanItem[];
}

interface OpenAPIParameter {
  in?: string;
  name?: string;
  schema?: {
    example?: string;
  };
}

interface OpenAPIRequestBody {
  content?: {
    'application/json'?: {
      schema?: {
        example?: string;
      };
    };
  };
}

interface OpenAPIOperation {
  summary?: string;
  operationId?: string;
  description?: string;
  tags?: string[];
  parameters?: OpenAPIParameter[];
  requestBody?: OpenAPIRequestBody;
}

interface PathItem {
  [method: string]: OpenAPIOperation;
}

interface ParsedPostmanCollection {
  info?: {
    name?: string;
    description?: string;
  };
  item?: PostmanItem[];
  auth?: unknown;
}

interface ParsedOpenAPISpec {
  openapi?: string;
  swagger?: string;
  paths?: Record<string, PathItem>;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
}

export const importPostmanCollection = async (
  content: string,
): Promise<ImportResult> => {
  try {
    const parsed: ParsedPostmanCollection = JSON.parse(content);

    // Validate Postman schema
    if (!parsed.info || !parsed.info.name) {
      throw new Error('Invalid Postman collection format');
    }

    const collections: PostmanItem[] = parsed.item || [];
    // Removed unused environments variable

    // Mock parsing logic - in real implementation, this would be more sophisticated
    const mockData = {
      type: 'postman' as const,
      name: parsed.info.name,
      description: parsed.info.description,
      collections: collections.map((item: PostmanItem) => ({
        id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        description: item.description,
        endpoints: item.item
          ? item.item
              .filter((subItem: PostmanItem) => subItem.request)
              .map((endpoint: PostmanItem) => ({
                id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: endpoint.name || item.name,
                method: endpoint.request?.method || 'GET',
                url: endpoint.request?.url?.raw || '',
                headers:
                  endpoint.request?.header?.reduce(
                    (acc: Record<string, string>, header: PostmanHeader) => {
                      if (header.key && header.value && !header.disabled) {
                        acc[header.key] = header.value;
                      }
                      return acc;
                    },
                    {},
                  ) || {},
                body: endpoint.request?.body?.raw || '',
                description: endpoint.request?.description,
              }))
          : [],
      })),
    };

    return {
      success: true,
      message: `Imported "${parsed.info.name}" with ${collections.length} collections`,
      data: mockData,
      importedCount: collections.length,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to parse Postman collection: ${errorMessage}`,
    };
  }
};

export const importOpenAPISpec = async (
  content: string,
): Promise<ImportResult> => {
  try {
    const parsed: ParsedOpenAPISpec = JSON.parse(content);

    // Validate OpenAPI schema
    if (!parsed.openapi && !parsed.swagger) {
      throw new Error('Invalid OpenAPI/Swagger specification');
    }

    const paths: Record<string, PathItem> = parsed.paths || {};
    const info = parsed.info || {};

    // Mock parsing logic for OpenAPI
    const endpoints = Object.entries(paths).flatMap(
      ([path, pathItem]: [string, PathItem]) => {
        return Object.entries(pathItem).map(
          ([method, operation]: [string, OpenAPIOperation]) => ({
            id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name:
              operation.summary ||
              operation.operationId ||
              `${method.toUpperCase()} ${path}`,
            method: method.toUpperCase(),
            url: path,
            description: operation.description,
            headers:
              operation.parameters
                ?.filter((p: OpenAPIParameter) => p.in === 'header')
                .reduce((acc: Record<string, string>, p: OpenAPIParameter) => {
                  if (p.name) {
                    acc[p.name] = p.schema?.example || '';
                  }
                  return acc;
                }, {}) || {},
            body:
              operation.requestBody?.content?.['application/json']?.schema
                ?.example || '',
            tags: operation.tags || [],
          }),
        );
      },
    );

    return {
      success: true,
      message: `Imported OpenAPI spec "${info.title || 'API'}" with ${endpoints.length} endpoints`,
      data: {
        type: 'openapi' as const,
        name: info.title || 'API',
        description: info.description,
        version: info.version,
        endpoints,
      },
      importedCount: endpoints.length,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to parse OpenAPI spec: ${errorMessage}`,
    };
  }
};

export const importCurlCommand = async (
  content: string,
): Promise<ImportResult> => {
  try {
    // Simple cURL parsing - in real implementation, this would be more sophisticated
    const methodMatch = content.match(/-X\s+([A-Z]+)/i);
    const urlMatch =
      content.match(/'([^']+)'/) ||
      content.match(/"([^"]+)"/) ||
      content.match(/(\S+)\s/);

    if (!methodMatch || !urlMatch) {
      throw new Error('Invalid cURL command format');
    }

    const method = methodMatch[1].toUpperCase();
    const url = urlMatch[1] || urlMatch[2] || urlMatch[3];

    // Extract headers (simplified)
    const headerMatches = content.match(
      /-H\s+'([^']+):?\s*([^']*)'?|-H\s+"([^"]+):?\s*([^"]*)"?/gi,
    );
    const headers: Record<string, string> = {};
    if (headerMatches) {
      headerMatches.forEach((match: string) => {
        const parts = match.trim().split(/\s+/);
        if (parts.length >= 2) {
          const headerPart = parts.slice(1).join(' '); // Get everything after -H
          const separatorIndex = headerPart.indexOf(':');
          if (separatorIndex !== -1) {
            const key = headerPart
              .substring(0, separatorIndex)
              .trim()
              .replace(/['"]/g, '');
            const value = headerPart
              .substring(separatorIndex + 1)
              .trim()
              .replace(/^['"]|['"]$/g, '');
            if (key && value) {
              headers[key] = value;
            }
          }
        }
      });
    }

    // Extract body (simplified)
    let body = '';
    const bodyMatch = content.match(/-d\s+'([^']*)'|-d\s+"([^"]*)"/i);
    if (bodyMatch) {
      body = bodyMatch[1] || bodyMatch[2] || '';
    }

    return {
      success: true,
      message: `Parsed cURL command: ${method} ${url}`,
      data: {
        type: 'curl' as const,
        method,
        url,
        headers,
        body,
      },
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Failed to parse cURL command: ${errorMessage}`,
    };
  }
};

export const parseImportContent = async (
  content: string,
  importType: 'postman' | 'openapi' | 'curl',
): Promise<ImportResult> => {
  switch (importType) {
    case 'postman':
      return await importPostmanCollection(content);
    case 'openapi':
      return await importOpenAPISpec(content);
    case 'curl':
      return await importCurlCommand(content);
    default:
      throw new Error('Unsupported import type');
  }
};
