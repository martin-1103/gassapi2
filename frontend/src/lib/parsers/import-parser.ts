import { ImportResult } from '@/types/import-types';

export const importPostmanCollection = async (content: string): Promise<ImportResult> => {
  try {
    const parsed = JSON.parse(content);
    
    // Validate Postman schema
    if (!parsed.info || !parsed.info.name) {
      throw new Error('Invalid Postman collection format');
    }

    const collections = parsed.item || [];
    const environments = parsed.variable || [];

    // Mock parsing logic - in real implementation, this would be more sophisticated
    const mockData = {
      type: 'postman',
      name: parsed.info.name,
      description: parsed.info.description,
      collections: collections.map((item: any) => ({
        id: `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: item.name,
        description: item.description,
        endpoints: item.item 
          ? item.item
              .filter((subItem: any) => subItem.request)
              .map((endpoint: any) => ({
                id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: endpoint.name || item.name,
                method: endpoint.request?.method || 'GET',
                url: endpoint.request?.url?.raw || '',
                headers: endpoint.request?.header?.reduce((acc: any, header: any) => {
                  if (header.key && header.value && !header.disabled) {
                    acc[header.key] = header.value;
                  }
                  return acc;
                }, {}) || {},
                body: endpoint.request?.body?.raw || '',
                description: endpoint.request?.description
              }))
          : []
      }))
    };
    
    return {
      success: true,
      message: `Imported "${parsed.info.name}" with ${collections.length} collections`,
      data: mockData,
      importedCount: collections.length
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to parse Postman collection: ${error.message}`
    };
  }
};

export const importOpenAPISpec = async (content: string): Promise<ImportResult> => {
  try {
    const parsed = JSON.parse(content);
    
    // Validate OpenAPI schema
    if (!parsed.openapi && !parsed.swagger) {
      throw new Error('Invalid OpenAPI/Swagger specification');
    }

    const paths = parsed.paths || {};
    const info = parsed.info || {};

    // Mock parsing logic for OpenAPI
    const endpoints = Object.entries(paths).flatMap(([path, pathItem]: [string, any]) => {
      return Object.entries(pathItem).map(([method, operation]: [string, any]) => ({
        id: `endpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`,
        method: method.toUpperCase(),
        url: path,
        description: operation.description,
        headers: operation.parameters
          ?.filter((p: any) => p.in === 'header')
          .reduce((acc: any, p: any) => {
            acc[p.name] = p.schema?.example || '';
            return acc;
          }, {}) || {},
        body: operation.requestBody?.content?.['application/json']?.schema?.example || '',
        tags: operation.tags || []
      }));
    });
    
    return {
      success: true,
      message: `Imported OpenAPI spec "${info.title || 'API'}" with ${endpoints.length} endpoints`,
      data: {
        type: 'openapi',
        name: info.title || 'API',
        description: info.description,
        version: info.version,
        endpoints
      },
      importedCount: endpoints.length
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to parse OpenAPI spec: ${error.message}`
    };
  }
};

export const importCurlCommand = async (content: string): Promise<ImportResult> => {
  try {
    // Simple cURL parsing - in real implementation, this would be more sophisticated
    const methodMatch = content.match(/-X\s+([A-Z]+)/i);
    const urlMatch = content.match(/'([^\']+)'/) || content.match(/"([^\"]+)"/) || content.match(/(\S+)\s/);
    
    if (!methodMatch || !urlMatch) {
      throw new Error('Invalid cURL command format');
    }

    const method = methodMatch[1].toUpperCase();
    const url = urlMatch[1] || urlMatch[2] || urlMatch[3];

    // Extract headers (simplified)
    const headerMatches = content.match(/-H\s+'([^\']+):?\s*([^\']*)'?|-H\s+"([^\"]+):?\s*([^\"]*)"?/gi);
    const headers: Record<string, string> = {};
    if (headerMatches) {
      headerMatches.forEach((match: any) => {
        const parts = match.trim().split(/\s+/);
        if (parts.length >= 2) {
          const headerPart = parts.slice(1).join(' '); // Get everything after -H
          const separatorIndex = headerPart.indexOf(':');
          if (separatorIndex !== -1) {
            const key = headerPart.substring(0, separatorIndex).trim().replace(/['"]/g, '');
            const value = headerPart.substring(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
            if (key && value) {
              headers[key] = value;
            }
          }
        }
      });
    }

    // Extract body (simplified)
    let body = '';
    const bodyMatch = content.match(/-d\s+'([^\']*)'|-d\s+"([^\"]*)"/i);
    if (bodyMatch) {
      body = bodyMatch[1] || bodyMatch[2] || '';
    }

    return {
      success: true,
      message: `Parsed cURL command: ${method} ${url}`,
      data: {
        type: 'curl',
        method,
        url,
        headers,
        body
      }
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Failed to parse cURL command: ${error.message}`
    };
  }
};

export const parseImportContent = async (
  content: string, 
  importType: 'postman' | 'openapi' | 'curl'
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