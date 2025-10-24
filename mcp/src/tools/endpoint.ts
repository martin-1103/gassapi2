import { McpTool, GassapiEndpoint } from '../types/mcp.types.js';
import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { BackendClient } from '../client/BackendClient.js';
import { HttpMethod, EndpointCreateRequest, EndpointUpdateRequest } from '../types/api.types.js';

/**
 * Tools untuk mengelola endpoint API
 * Handle operasi konfigurasi endpoint API
 */

const get_endpoint_details: McpTool = {
  name: 'get_endpoint_details',
  description: 'Get detailed endpoint configuration with collection information',
  inputSchema: {
    type: 'object',
    properties: {
      endpointId: {
        type: 'string',
        description: 'Endpoint UUID to get details for'
      },
      includeCollection: {
        type: 'boolean',
        description: 'Include collection information in response',
        default: true
      }
    },
    required: ['endpointId']
  }
};

const create_endpoint: McpTool = {
  name: 'create_endpoint',
  description: 'Create new endpoint in collection',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Endpoint display name'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        description: 'HTTP method'
      },
      url: {
        type: 'string',
        description: 'Endpoint URL (relative or absolute)'
      },
      headers: {
        type: 'object',
        description: 'Default request headers',
        default: {}
      },
      body: {
        type: 'object',
        description: 'Default request body (for POST/PUT/PATCH)'
      },
      collectionId: {
        type: 'string',
        description: 'Collection UUID to add endpoint to'
      },
      description: {
        type: 'string',
        description: 'Endpoint description'
      }
    },
    required: ['name', 'method', 'url', 'collectionId']
  }
};

const update_endpoint: McpTool = {
  name: 'update_endpoint',
  description: 'Update existing endpoint configuration',
  inputSchema: {
    type: 'object',
    properties: {
      endpointId: {
        type: 'string',
        description: 'Endpoint UUID to update'
      },
      name: {
        type: 'string',
        description: 'New endpoint name'
      },
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
        description: 'New HTTP method'
      },
      url: {
        type: 'string',
        description: 'New endpoint URL'
      },
      headers: {
        type: 'object',
        description: 'New request headers'
      },
      body: {
        type: 'object',
        description: 'New default request body'
      },
      description: {
        type: 'string',
        description: 'New endpoint description'
      }
    },
    required: ['endpointId']
  }
};

const move_endpoint: McpTool = {
  name: 'move_endpoint',
  description: 'Move endpoint to different collection',
  inputSchema: {
    type: 'object',
    properties: {
      endpointId: {
        type: 'string',
        description: 'Endpoint UUID to move'
      },
      newCollectionId: {
        type: 'string',
        description: 'Target collection UUID'
      }
    },
    required: ['endpointId', 'newCollectionId']
  }
};

const list_endpoints: McpTool = {
  name: 'list_endpoints',
  description: 'List all endpoints with optional filtering',
  inputSchema: {
    type: 'object',
    properties: {
      collectionId: {
        type: 'string',
        description: 'Filter by collection UUID'
      },
      projectId: {
        type: 'string',
        description: 'Filter by project UUID'
      }
    }
  }
};

export class EndpointTools {
  private configLoader: ConfigLoader;
  private backendClient: BackendClient | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
  }

  private async getBackendClient(): Promise<BackendClient> {
    if (this.backendClient) {
      return this.backendClient;
    }

    const config = await this.configLoader.detectProjectConfig();
    if (!config) {
      throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
    }

    this.backendClient = new BackendClient(
      this.configLoader.getServerURL(config),
      this.configLoader.getMcpToken(config)
    );

    return this.backendClient;
  }

  /**
   * Validasi HTTP method string ke HttpMethod type yang valid
   */
  private validateHttpMethod(method: string): HttpMethod {
    const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
    const upperMethod = method.toUpperCase();

    if (!validMethods.includes(upperMethod as HttpMethod)) {
      throw new Error(`HTTP method tidak valid: ${method}. Method yang didukung: ${validMethods.join(', ')}`);
    }

    return upperMethod as HttpMethod;
  }

  /**
   * Ambil detail informasi endpoint
   */
  async getEndpointDetails(args: {
    endpointId: string;
    includeCollection?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        throw new Error('Konfigurasi GASSAPI tidak ditemukan');
      }

      const client = await this.getBackendClient();
      const result = await client.getEndpointDetails(args.endpointId);

      const includeCollection = args.includeCollection !== false;

      let detailsText = `🔌 Detail Endpoint

Informasi Endpoint:
- Nama: ${result.name || 'N/A'}
- Method: ${result.method || 'N/A'}
- URL: ${result.url || 'N/A'}
- ID: ${result.id}
- Deskripsi: ${result.description || 'Tidak ada deskripsi'}
- Dibuat: ${new Date(result.created_at).toLocaleString()}
- Diupdate: ${new Date(result.updated_at).toLocaleString()}`;

      if (includeCollection && result.collection) {
        detailsText += `

Informasi Collection:
- Nama: ${result.collection.name}
- ID: ${result.collection.id}`;
        if (result.collection.parent_id) {
          detailsText += `
- Parent ID: ${result.collection.parent_id}`;
        }
      }

      if (result.headers && Object.keys(result.headers).length > 0) {
        detailsText += `

Default Headers:`;
        Object.entries(result.headers).forEach(([key, value]) => {
          detailsText += `\n- ${key}: ${value}`;
        });
      }

      if (result.body) {
        const bodyText = typeof result.body === 'string'
          ? result.body
          : JSON.stringify(result.body, null, 2);

        detailsText += `

Default Body:
\`\`\`
${bodyText}
\`\`\``;
      }

      if (result.test_results && result.test_results.length > 0) {
        detailsText += `

Hasil Test Terkini:`;
        result.test_results.slice(-3).forEach((test: any, index) => {
          const status = test.status >= 200 && test.status < 300 ? '🟢' : '🔴';
          detailsText += `\n${index + 1}. ${status} ${test.status} (${test.response_time}ms) - ${new Date(test.created_at).toLocaleString()}`;
        });
      }

      return {
        content: [
          {
            type: 'text',
            text: detailsText
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';

      return {
        content: [
          {
            type: 'text',
            text: `❌ Gagal Ambil Detail Endpoint

Error: ${errorMessage}

Silakan cek:
1. Endpoint ID sudah benar
2. Punya akses ke endpoint
3. Server backend bisa diakses`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Buat endpoint baru
   */
  async createEndpoint(args: {
    name: string;
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown> | unknown[] | string | null;
    collectionId: string;
    description?: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();

      // Validasi dan cast HttpMethod dengan proper type safety
      const validMethod = this.validateHttpMethod(args.method);

      const endpointData: EndpointCreateRequest = {
        name: args.name,
        method: validMethod,
        url: args.url,
        headers: args.headers || {},
        body: args.body || null,
        collection_id: args.collectionId,
        description: args.description || undefined
      };

      const result = await client.createEndpoint(endpointData);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Endpoint Berhasil Dibuat

Detail Endpoint:
- Nama: ${args.name}
- Method: ${args.method}
- URL: ${args.url}
- Collection ID: ${args.collectionId}
- ID: ${result.id}
- Deskripsi: ${args.description || 'Tidak ada deskripsi'}

Headers: ${args.headers ? Object.keys(args.headers).length : 0} sudah dikonfigurasi
Body: ${args.body ? 'Sudah dikonfigurasi' : 'Belum dikonfigurasi'}

Endpoint "${args.name}" berhasil dibuat!

Sekarang kamu bisa:
1. Test endpoint menggunakan tool test_endpoint
2. Tambah lebih banyak endpoint di collection yang sama
3. Buat automated test flows`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';

      return {
        content: [
          {
            type: 'text',
            text: `❌ Gagal Buat Endpoint

Error: ${errorMessage}

Silakan cek:
1. Collection ID valid
2. Format nama dan URL endpoint benar
3. HTTP method didukung
4. Punya akses tulis ke collection`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Update endpoint yang sudah ada
   */
  async updateEndpoint(args: {
    endpointId: string;
    name?: string;
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: Record<string, unknown> | unknown[] | string | null;
    description?: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const updateData: EndpointUpdateRequest = {};

      // Hanya include field yang akan diupdate dengan validasi yang proper
      if (args.name !== undefined) updateData.name = args.name;
      if (args.method !== undefined) {
        updateData.method = this.validateHttpMethod(args.method);
      }
      if (args.url !== undefined) updateData.url = args.url;
      if (args.headers !== undefined) updateData.headers = args.headers;
      if (args.body !== undefined) updateData.body = args.body;
      if (args.description !== undefined) updateData.description = args.description;

      const result = await client.updateEndpoint(args.endpointId, updateData);

      const changes = Object.keys(updateData).map(key => `- ${key}: ${updateData[key as keyof EndpointUpdateRequest]}`).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `✅ Endpoint Berhasil Diupdate

Detail Update:
- Endpoint ID: ${args.endpointId}
- Perubahan:
${changes}
- Diupdate pada: ${new Date().toLocaleString()}

Endpoint berhasil diupdate!

Perubahan sudah aktif dan akan digunakan pada test berikutnya.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';

      return {
        content: [
          {
            type: 'text',
            text: `❌ Gagal Update Endpoint

Error: ${errorMessage}

Silakan cek:
1. Endpoint ID sudah benar
2. Field yang diupdate valid
3. Punya akses tulis ke endpoint
4. Tidak ada konflik dengan endpoint lain`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Pindahkan endpoint ke collection lain
   */
  async moveEndpoint(args: {
    endpointId: string;
    newCollectionId: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const result = await client.moveEndpoint(args.endpointId, args.newCollectionId);

      return {
        content: [
          {
            type: 'text',
            text: `✅ Endpoint Berhasil Dipindah

Operasi Pindah:
- Endpoint ID: ${args.endpointId}
- Collection Baru: ${args.newCollectionId}
- Hasil: Success
- Dipindah pada: ${new Date().toLocaleString()}

Endpoint berhasil dipindahkan!

Endpoint sekarang menjadi bagian dari collection target dan akan muncul di daftar endpoint collection tersebut.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';

      return {
        content: [
          {
            type: 'text',
            text: `❌ Gagal Pindahkan Endpoint

Error: ${errorMessage}

Silakan cek:
1. Endpoint ID ada dan bisa diakses
2. ID collection target valid
3. Punya akses tulis ke kedua collection
4. Tidak ada circular reference di pemindahan`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Tampilkan semua endpoint dengan filter opsional
   */
  async listEndpoints(args: {
    collectionId?: string;
    projectId?: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const config = await this.configLoader.detectProjectConfig();
      if (!config) {
        throw new Error('Konfigurasi GASSAPI tidak ditemukan');
      }

      const client = await this.getBackendClient();
      const result = await client.getEndpoints(args.collectionId, args.projectId);

      if (!result.endpoints || result.endpoints.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: `🔌 Endpoints

${args.collectionId ? `Collection: ${args.collectionId}` : args.projectId ? `Project: ${args.projectId}` : 'Global'}
Hasil: Tidak ada endpoint ditemukan

Untuk menambah endpoint:
1. Gunakan tool create_endpoint
2. Import dari dokumentasi API
3. Clone dari endpoint yang sudah ada`
            }
          ]
        };
      }

      const endpointList = result.endpoints.map((endpoint: any, index) =>
        `${index + 1}. ${endpoint.method} ${endpoint.url} (${endpoint.name}) - Collection: ${endpoint.collection?.name || 'N/A'}`
      ).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `🔌 Endpoint Project

${args.collectionId ? `Collection: ${args.collectionId}` : args.projectId ? `Project: ${args.projectId}` : 'Global'}
Total Endpoint: ${result.endpoints.length}

Daftar Endpoint:
${endpointList}

Gunakan endpointId untuk operasi spesifik.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';

      return {
        content: [
          {
            type: 'text',
            text: `❌ Gagal Tampilkan Endpoint

Error: ${errorMessage}

Silakan cek:
1. Collection/Project ID sudah benar
2. MCP token punya akses yang proper
3. Server backend bisa diakses`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Ambil daftar tools endpoint
   */
  getTools(): McpTool[] {
    return [
      get_endpoint_details,
      create_endpoint,
      update_endpoint,
      move_endpoint,
      list_endpoints
    ];
  }

  /**
   * Handle pemanggilan tool
   */
  async handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      case 'get_endpoint_details':
        return this.getEndpointDetails(args as {
          endpointId: string;
          includeCollection?: boolean;
        });
      case 'create_endpoint':
        return this.createEndpoint(args as {
          name: string;
          method: string;
          url: string;
          headers?: Record<string, string>;
          body?: string | Record<string, unknown> | unknown[];
          collectionId: string;
          description?: string;
        });
      case 'update_endpoint':
        return this.updateEndpoint(args as {
          endpointId: string;
          name?: string;
          method?: string;
          url?: string;
          headers?: Record<string, string>;
          body?: string | Record<string, unknown> | unknown[];
          description?: string;
        });
      case 'move_endpoint':
        return this.moveEndpoint(args as {
          endpointId: string;
          newCollectionId: string;
        });
      case 'list_endpoints':
        return this.listEndpoints(args);
      default:
        throw new Error(`Tool endpoint tidak dikenal: ${toolName}`);
    }
  }
}

// Export untuk MCP server registration
export const endpointTools = new EndpointTools();
export const ENDPOINT_TOOLS = [
  get_endpoint_details,
  create_endpoint,
  update_endpoint,
  move_endpoint,
  list_endpoints
];