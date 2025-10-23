import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { EndpointTools } from '../endpoint';
import { ConfigLoader } from '../../discovery/ConfigLoader';
import { BackendClient } from '../../client/BackendClient';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');

describe('EndpointTools', () => {
  let endpointTools: EndpointTools;
  let mockConfigLoader: jest.Mocked<ConfigLoader>;
  let mockBackendClient: jest.Mocked<BackendClient>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigLoader = {
      detectProjectConfig: jest.fn(),
      getMcpToken: jest.fn(),
      getServerURL: jest.fn(),
    } as any;

    mockBackendClient = {
      getEndpointDetails: jest.fn(),
      createEndpoint: jest.fn(),
      updateEndpoint: jest.fn(),
      moveEndpoint: jest.fn(),
      getEndpoints: jest.fn(),
    } as any;

    (ConfigLoader as jest.MockedClass<typeof ConfigLoader>).mockImplementation(() => mockConfigLoader);
    (BackendClient as jest.MockedClass<typeof BackendClient>).mockImplementation(() => mockBackendClient);

    endpointTools = new EndpointTools();
  });

  describe('getEndpointDetails', () => {
    it('harus return endpoint details lengkap', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        description: 'Fetch users',
        collection: { id: 'col-1', name: 'API Collection' },
        created_at: '2025-10-01T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z',
        headers: { 'Authorization': 'Bearer token' },
        body: null,
        test_results: []
      } as any);

      const result = await endpointTools.getEndpointDetails({
        endpointId: 'ep-1'
      });

      expect(result.content[0].text).toContain('🔌 Detail Endpoint');
      expect(result.content[0].text).toContain('Get Users');
      expect(result.content[0].text).toContain('GET');
      expect(result.content[0].text).toContain('/api/users');
      expect(result.content[0].text).toContain('API Collection');
    });

    it('harus include headers kalo ada', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Test Endpoint',
        method: 'POST',
        url: '/test',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token'
        },
        created_at: '2025-10-01T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z'
      } as any);

      const result = await endpointTools.getEndpointDetails({
        endpointId: 'ep-1'
      });

      expect(result.content[0].text).toContain('Default Headers:');
      expect(result.content[0].text).toContain('Content-Type');
      expect(result.content[0].text).toContain('Authorization');
    });

    it('harus handle error kalo endpoint ga ketemu', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(
        new Error('Endpoint not found')
      );

      const result = await endpointTools.getEndpointDetails({
        endpointId: 'invalid-id'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Ambil Detail Endpoint');
    });
  });

  describe('createEndpoint', () => {
    it('harus create endpoint baru', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockResolvedValue({
        id: 'ep-new',
        name: 'New Endpoint'
      } as any);

      const result = await endpointTools.createEndpoint({
        name: 'New Endpoint',
        method: 'POST',
        url: '/api/create',
        collectionId: 'col-1',
        headers: { 'Content-Type': 'application/json' },
        body: { test: 'data' },
        description: 'Create new resource'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dibuat');
      expect(result.content[0].text).toContain('New Endpoint');
      expect(result.content[0].text).toContain('POST');
      expect(result.content[0].text).toContain('/api/create');
    });

    it('harus handle error saat create', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockRejectedValue(
        new Error('Invalid collection')
      );

      const result = await endpointTools.createEndpoint({
        name: 'Failed Endpoint',
        method: 'GET',
        url: '/test',
        collectionId: 'invalid-col'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Buat Endpoint');
    });
  });

  describe('updateEndpoint', () => {
    it('harus update endpoint fields', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockResolvedValue({
        success: true
      } as any);

      const result = await endpointTools.updateEndpoint({
        endpointId: 'ep-1',
        name: 'Updated Name',
        url: '/api/v2/users'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Diupdate');
      expect(result.content[0].text).toContain('name');
      expect(result.content[0].text).toContain('url');
    });

    it('harus handle error saat update', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockRejectedValue(
        new Error('Update failed')
      );

      const result = await endpointTools.updateEndpoint({
        endpointId: 'ep-1',
        name: 'Failed Update'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Update Endpoint');
    });
  });

  describe('moveEndpoint', () => {
    it('harus move endpoint ke collection lain', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveEndpoint.mockResolvedValue({
        success: true
      } as any);

      const result = await endpointTools.moveEndpoint({
        endpointId: 'ep-1',
        newCollectionId: 'col-2'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dipindah');
      expect(result.content[0].text).toContain('col-2');
    });

    it('harus handle error saat move', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveEndpoint.mockRejectedValue(
        new Error('Move failed')
      );

      const result = await endpointTools.moveEndpoint({
        endpointId: 'ep-1',
        newCollectionId: 'col-2'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Pindahkan Endpoint');
    });
  });

  describe('getTools', () => {
    it('harus return array of endpoint tools', () => {
      const tools = endpointTools.getTools();

      // Note: endpoint.ts exports 4 tools (get_endpoint_details, create_endpoint, update_endpoint, move_endpoint)
      expect(tools.length).toBeGreaterThanOrEqual(4);
      expect(tools.map(t => t.name)).toContain('get_endpoint_details');
      expect(tools.map(t => t.name)).toContain('create_endpoint');
      expect(tools.map(t => t.name)).toContain('update_endpoint');
      expect(tools.map(t => t.name)).toContain('move_endpoint');
    });
  });

  describe('handleToolCall', () => {
    it('harus handle get_endpoint_details', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Test',
        method: 'GET',
        url: '/test',
        created_at: '2025-10-01T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z'
      } as any);

      const result = await endpointTools.handleToolCall('get_endpoint_details', {
        endpointId: 'ep-1'
      });
      expect(result).toBeDefined();
    });

    it('harus throw error untuk unknown tool', async () => {
      await expect(endpointTools.handleToolCall('unknown_tool', {}))
        .rejects.toThrow('Tool endpoint tidak dikenal: unknown_tool');
    });
  });

  describe('listEndpoints', () => {
    it('harus return list endpoints dengan collectionId', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpoints.mockResolvedValue({
        endpoints: [
          { id: 'ep-1', name: 'Get Users', method: 'GET', url: '/api/users', collection: { name: 'API' } },
          { id: 'ep-2', name: 'Create User', method: 'POST', url: '/api/users', collection: { name: 'API' } }
        ]
      } as any);

      const result = await endpointTools.listEndpoints({ collectionId: 'col-1' });

      expect(result.content[0].text).toContain('Get Users');
      expect(result.content[0].text).toContain('Create User');
      expect(result.content[0].text).toContain('Total Endpoint: 2');
    });

    it('harus return message kalo ga ada endpoints', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpoints.mockResolvedValue({ endpoints: [] } as any);

      const result = await endpointTools.listEndpoints({});

      expect(result.content[0].text).toContain('Tidak ada endpoint ditemukan');
    });

    it('harus handle error saat list endpoints', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpoints.mockRejectedValue(new Error('Network error'));

      const result = await endpointTools.listEndpoints({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Gagal');
    });
  });

  describe('getEndpointDetails with includeCollection', () => {
    it('harus include collection details kalo includeCollection true', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Test Endpoint',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Test Collection', parent_id: 'col-parent' },
        created_at: '2025-10-01T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z'
      } as any);

      const result = await endpointTools.getEndpointDetails({
        endpointId: 'ep-1',
        includeCollection: true
      });

      expect(result.content[0].text).toContain('Informasi Collection');
      expect(result.content[0].text).toContain('Test Collection');
      expect(result.content[0].text).toContain('Parent ID: col-parent');
    });

    it('harus handle endpoint dengan body object', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Test Endpoint',
        method: 'POST',
        url: '/test',
        body: { test: 'data', nested: { value: 123 } },
        created_at: '2025-10-01T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z'
      } as any);

      const result = await endpointTools.getEndpointDetails({ endpointId: 'ep-1' });

      expect(result.content[0].text).toContain('Default Body');
      expect(result.content[0].text).toContain('test');
    });
  });

  describe('Additional coverage tests', () => {
    it('harus handle create endpoint dengan valid data', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockResolvedValue({
        id: 'ep-new',
        name: 'New Endpoint',
        method: 'POST',
        url: '/api/new'
      } as any);

      const result = await endpointTools.createEndpoint({
        name: 'New Endpoint',
        method: 'POST',
        url: '/api/new',
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dibuat');
    });

    it('harus handle update endpoint dengan valid data', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockResolvedValue({
        id: 'ep-1',
        name: 'Updated Name',
        url: '/api/updated'
      } as any);

      const result = await endpointTools.updateEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        name: 'Updated Name',
        url: '/api/updated'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Diupdate');
    });

    it('harus handle move endpoint dengan valid data', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveEndpoint.mockResolvedValue({
        success: true
      } as any);

      const result = await endpointTools.moveEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        newCollectionId: 'bbbbbbbb-cccc-4ddd-9eee-ffffffffffff'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dipindah');
    });

    it('harus handle endpoint details dengan collection info', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Test Endpoint',
        method: 'GET',
        url: '/test',
        collection: {
          id: 'col-1',
          name: 'Test Collection'
        },
        created_at: '2025-10-23T00:00:00Z',
        updated_at: '2025-10-23T00:00:00Z'
      } as any);

      const result = await endpointTools.getEndpointDetails({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
      });

      expect(result.content[0].text).toContain('Test Collection');
    });

    it('harus handle create endpoint dengan array body', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockResolvedValue({
        id: 'ep-array',
        name: 'Array Body Endpoint',
        method: 'POST',
        url: '/api/array'
      } as any);

      const result = await endpointTools.createEndpoint({
        name: 'Array Body Endpoint',
        method: 'POST',
        url: '/api/array',
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        body: ['item1', 'item2', 'item3']
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dibuat');
    });

    it('harus handle create endpoint dengan string body', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockResolvedValue({
        id: 'ep-string',
        name: 'String Body Endpoint',
        method: 'POST',
        url: '/api/string'
      } as any);

      const result = await endpointTools.createEndpoint({
        name: 'String Body Endpoint',
        method: 'POST',
        url: '/api/string',
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        body: 'plain text body'
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dibuat');
    });

    it('harus handle create endpoint dengan null body', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createEndpoint.mockResolvedValue({
        id: 'ep-null',
        name: 'Null Body Endpoint',
        method: 'GET',
        url: '/api/null'
      } as any);

      const result = await endpointTools.createEndpoint({
        name: 'Null Body Endpoint',
        method: 'GET',
        url: '/api/null',
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        body: null
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Dibuat');
    });

    it('harus handle update endpoint dengan body update', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockResolvedValue({
        id: 'ep-1',
        name: 'Updated with Body',
        url: '/api/updated',
        body: { new: 'body' }
      } as any);

      const result = await endpointTools.updateEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        body: { new: 'body' }
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Diupdate');
    });

    it('harus handle update endpoint dengan headers update', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockResolvedValue({
        id: 'ep-1',
        name: 'Updated with Headers',
        headers: { 'X-New-Header': 'value' }
      } as any);

      const result = await endpointTools.updateEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        headers: { 'X-New-Header': 'value' }
      });

      expect(result.content[0].text).toContain('✅ Endpoint Berhasil Diupdate');
    });

    it('harus handle listEndpoints dengan collection filter', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpoints.mockResolvedValue({
        endpoints: [{
          id: 'ep-1',
          name: 'Filtered Endpoint',
          method: 'GET',
          url: '/api/filtered'
        }]
      } as any);

      const result = await endpointTools.listEndpoints({
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
      });

      expect(result.content[0].text).toContain('🔌 Endpoint');
      expect(result.content[0].text).toContain('Filtered Endpoint');
    });

    it('harus handle handleToolCall untuk update_endpoint', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.updateEndpoint.mockResolvedValue({
        id: 'ep-1',
        name: 'Tool Call Update'
      } as any);

      const result = await endpointTools.handleToolCall('update_endpoint', {
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        name: 'Tool Call Update'
      });

      expect(result).toBeDefined();
    });
  });
});
