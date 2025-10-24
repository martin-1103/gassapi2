import type {
  PathItem,
  Operation,
  Parameter,
  RequestBody,
  Components,
  YamlNode,
} from '../../../types/openapi-types';
import type { ImportResult } from '../types';

/**
 * Parser untuk OpenAPI 3.0 dan Swagger 2.0 specifications
 * Mendukung format JSON dan YAML
 */
export const parseOpenAPISpec = async (
  content: string,
): Promise<ImportResult> => {
  try {
    let parsed;

    // Coba parse JSON dulu
    try {
      parsed = JSON.parse(content);
    } catch {
      // Jika JSON gagal, coba parse YAML (basic implementation)
      parsed = parseBasicYaml(content);
    }

    // Validasi schema OpenAPI/Swagger
    if (!parsed.openapi && !parsed.swagger) {
      throw new Error(
        'Format OpenAPI/Swagger tidak valid - harus ada openapi atau swagger field',
      );
    }

    if (!parsed.paths || typeof parsed.paths !== 'object') {
      throw new Error(
        'Format OpenAPI/Swagger tidak valid - harus ada paths object',
      );
    }

    const paths = parsed.paths || {};
    const info = parsed.info || {};
    const servers = parsed.servers || [];
    const components = parsed.components || {};

    // Ekstrak endpoints dari paths
    const endpoints = Object.entries(paths).flatMap(
      ([path, pathItem]: [string, unknown]) => {
        if (!pathItem || typeof pathItem !== 'object') return [];
        const pathItemObj = pathItem as PathItem;

        return Object.entries(pathItemObj)
          .filter(([method]) =>
            [
              'get',
              'post',
              'put',
              'delete',
              'patch',
              'head',
              'options',
            ].includes(method.toLowerCase()),
          )
          .map(([method, operation]: [string, unknown]) => {
            const operationObj = operation as Operation;
            return {
              id: `endpoint_${Date.now()}_${method}_${Math.random()
                .toString(36)
                .substring(2, 8)}`,
              name:
                operationObj?.summary ||
                operationObj?.operationId ||
                `${method.toUpperCase()} ${path}`,
              method: method.toUpperCase(),
              url: path,
              description:
                operationObj?.description || operationObj?.summary || '',
              parameters: operationObj?.parameters || [],
              headers: extractHeadersFromParameters(
                operationObj?.parameters || [],
              ),
              body: extractRequestBody(operationObj?.requestBody, components),
              responses: operationObj?.responses || {},
              tags: operationObj?.tags || [],
              deprecated: operationObj?.deprecated || false,
            };
          });
      },
    );

    // Extract server info untuk base URL
    const serverUrls = servers
      .map((server: { url: string }) => server.url)
      .filter(Boolean);
    const defaultServerUrl = serverUrls[0] || '';

    const transformedData = {
      type: 'openapi' as const,
      name: info.title || 'API',
      description: info.description || '',
      version: info.version || '1.0.0',
      baseUrl: defaultServerUrl,
      servers: serverUrls,
      endpoints: endpoints.map((endpoint, index) => ({
        ...endpoint,
        fullUrl: `${defaultServerUrl}${endpoint.url}`.replace(/\/+/g, '/'),
        order: index,
      })),
      components,
      info,
    };

    return {
      success: true,
      message: `Berhasil import OpenAPI spec "${info.title || 'API'}" dengan ${endpoints.length} endpoint`,
      data: transformedData,
      importedCount: endpoints.length,
      warnings: [
        ...(serverUrls.length === 0
          ? ['Tidak ada server URL yang ditemukan']
          : []),
        ...(Object.keys(components).length > 0
          ? [
              `Ditemukan ${Object.keys(components).length} components yang diparsing`,
            ]
          : []),
      ],
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      message: `Gagal parse OpenAPI spec: ${errorMessage}`,
      warnings: [
        'Pastikan file adalah OpenAPI 3.0 atau Swagger 2.0 yang valid',
        'Support format JSON dan YAML dasar',
      ],
    };
  }
};

/**
 * Basic YAML parser - sederhana, tidak handle semua edge cases
 * Untuk production sebaiknya gunakan library seperti js-yaml
 */
function parseBasicYaml(content: string): YamlNode {
  const lines = content.split('\n');
  const result: YamlNode = {};
  const stack: YamlNode[] = [result];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const cleanLine = line.trim();

    if (cleanLine.includes(':')) {
      const [key, ...valueParts] = cleanLine.split(':');
      const value = valueParts.join(':').trim();

      if (value) {
        // Try parse as JSON if it looks like structured data
        try {
          stack[stack.length - 1][key.trim()] = JSON.parse(value);
        } catch {
          stack[stack.length - 1][key.trim()] = value.replace(
            /^["']|["']$/g,
            '',
          );
        }
      } else {
        stack[stack.length - 1][key.trim()] = {};
        const newValue = stack[stack.length - 1][key.trim()];
        if (typeof newValue === 'object' && newValue !== null) {
          stack.push(newValue as YamlNode);
        }
      }
    }
  }

  return result;
}

function extractHeadersFromParameters(
  parameters: Parameter[],
): Record<string, string> {
  return parameters
    .filter((param: Parameter) => param.in === 'header' && param.name)
    .reduce((acc: Record<string, string>, param: Parameter) => {
      acc[param.name] =
        (param.schema?.example as string) || (param.example as string) || '';
      return acc;
    }, {});
}

function extractRequestBody(
  requestBody: RequestBody | undefined,
  _components: Components,
): string {
  if (!requestBody) return '';

  const content = requestBody.content;
  if (!content) return '';

  const jsonContent = content['application/json'];
  if (jsonContent) {
    if (jsonContent.example) {
      return typeof jsonContent.example === 'string'
        ? jsonContent.example
        : JSON.stringify(jsonContent.example, null, 2);
    }
    if (jsonContent.schema?.example) {
      return typeof jsonContent.schema.example === 'string'
        ? jsonContent.schema.example
        : JSON.stringify(jsonContent.schema.example, null, 2);
    }
  }

  return '';
}
