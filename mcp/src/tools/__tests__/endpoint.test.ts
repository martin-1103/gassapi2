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

      expect(tools).toHaveLength(4);
      expect(tools.map(t => t.name)).toEqual([
        'get_endpoint_details',
        'create_endpoint',
        'update_endpoint',
        'move_endpoint'
      ]);
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
});
