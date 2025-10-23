import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CollectionTools } from '../collection';
import { ConfigLoader } from '../../discovery/ConfigLoader';
import { BackendClient } from '../../client/BackendClient';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');

describe('CollectionTools', () => {
  let collectionTools: CollectionTools;
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
      getCollections: jest.fn(),
      createCollection: jest.fn(),
      moveCollection: jest.fn(),
      deleteCollection: jest.fn(),
    } as any;

    (ConfigLoader as jest.MockedClass<typeof ConfigLoader>).mockImplementation(() => mockConfigLoader);
    (BackendClient as jest.MockedClass<typeof BackendClient>).mockImplementation(() => mockBackendClient);

    collectionTools = new CollectionTools();
  });

  describe('getCollections', () => {
    it('harus return list collections', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getCollections.mockResolvedValue({
        collections: [
          { id: 'col-1', name: 'API Collection', endpoint_count: 5, parent_id: null },
          { id: 'col-2', name: 'Auth API', endpoint_count: 3, parent_id: 'col-1' }
        ]
      } as any);

      const result = await collectionTools.getCollections({ projectId: 'proj-1' });

      expect(result.content[0].text).toContain('📚 Koleksi Project');
      expect(result.content[0].text).toContain('API Collection');
      expect(result.content[0].text).toContain('Auth API');
    });

    it('harus return flattened list kalo flatten = true', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getCollections.mockResolvedValue({
        collections: [
          { id: 'col-1', name: 'Collection 1', endpoint_count: 2, parent_id: null }
        ]
      } as any);

      const result = await collectionTools.getCollections({ 
        projectId: 'proj-1',
        flatten: true 
      });

      expect(result.content[0].text).toContain('📁 Collection 1');
      expect(result.content[0].text).toContain('[2 endpoints]');
    });

    it('harus handle empty collections', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockBackendClient.getCollections.mockResolvedValue({ collections: [] } as any);

      const result = await collectionTools.getCollections({});

      expect(result.content[0].text).toContain('Tidak ada koleksi ditemukan');
    });
  });

  describe('createCollection', () => {
    it('harus create collection baru', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createCollection.mockResolvedValue({
        id: 'col-new',
        name: 'New Collection'
      } as any);

      const result = await collectionTools.createCollection({
        name: 'New Collection',
        projectId: 'proj-1',
        description: 'Test collection'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dibuat');
      expect(result.content[0].text).toContain('New Collection');
      expect(result.content[0].text).toContain('col-new');
    });

    it('harus handle nested collection', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createCollection.mockResolvedValue({
        id: 'col-nested',
        name: 'Nested Collection'
      } as any);

      const result = await collectionTools.createCollection({
        name: 'Nested Collection',
        projectId: 'proj-1',
        parentId: 'col-parent'
      });

      expect(result.content[0].text).toContain('Parent: col-parent');
    });

    it('harus handle error saat create', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createCollection.mockRejectedValue(new Error('Creation failed'));

      const result = await collectionTools.createCollection({
        name: 'Failed Collection',
        projectId: 'proj-1'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Membuat Koleksi');
    });
  });

  describe('moveCollection', () => {
    it('harus move collection ke parent baru', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveCollection.mockResolvedValue({ success: true } as any);

      const result = await collectionTools.moveCollection({
        collectionId: 'col-1',
        newParentId: 'col-parent'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Dipindahkan');
      expect(result.content[0].text).toContain('col-parent');
    });

    it('harus handle error saat move', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveCollection.mockRejectedValue(new Error('Move failed'));

      const result = await collectionTools.moveCollection({
        collectionId: 'col-1',
        newParentId: 'col-parent'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Memindahkan Koleksi');
    });
  });

  describe('deleteCollection', () => {
    it('harus delete collection dengan force', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.deleteCollection.mockResolvedValue({ success: true } as any);

      const result = await collectionTools.deleteCollection({
        collectionId: 'col-1',
        force: true
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dihapus');
      expect(result.content[0].text).toContain('Force Delete: Ya');
    });

    it('harus handle error saat delete', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.deleteCollection.mockRejectedValue(new Error('Delete failed'));

      const result = await collectionTools.deleteCollection({
        collectionId: 'col-1',
        force: true
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Menghapus Koleksi');
    });
  });

  describe('getTools', () => {
    it('harus return array of collection tools', () => {
      const tools = collectionTools.getTools();

      expect(tools).toHaveLength(4);
      expect(tools.map(t => t.name)).toEqual([
        'get_collections',
        'create_collection',
        'move_collection',
        'delete_collection'
      ]);
    });
  });

  describe('handleToolCall', () => {
    it('harus handle get_collections', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockBackendClient.getCollections.mockResolvedValue({ collections: [] } as any);

      const result = await collectionTools.handleToolCall('get_collections', {});
      expect(result).toBeDefined();
    });

    it('harus throw error untuk unknown tool', async () => {
      await expect(collectionTools.handleToolCall('unknown_tool', {}))
        .rejects.toThrow('Unknown collection tool: unknown_tool');
    });
  });

  describe('Additional coverage tests', () => {
    it('harus handle create collection dengan valid data', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createCollection.mockResolvedValue({
        id: 'col-new',
        name: 'New Collection',
        project_id: 'proj-1'
      } as any);

      const result = await collectionTools.createCollection({
        name: 'New Collection',
        projectId: 'proj-1',
        description: 'Test description'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dibuat');
    });

    it('harus handle move collection dengan valid data', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveCollection.mockResolvedValue({
        success: true
      } as any);

      const result = await collectionTools.moveCollection({
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        newParentId: 'bbbbbbbb-cccc-4ddd-9eee-ffffffffffff'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Dipindahkan');
    });

    it('harus handle safety check untuk collection dengan endpoints', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      // Mock collection dengan endpoints
      mockBackendClient.getCollections.mockResolvedValue({
        collections: [{
          id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
          name: 'Collection with endpoints',
          endpoint_count: 5
        }]
      } as any);

      const result = await collectionTools.deleteCollection({
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
      });

      expect(result.content[0].text).toContain('⚠️ Peringatan Hapus Koleksi');
      expect(result.content[0].text).toContain('5 endpoint');
    });

    it('harus handle safety check error', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getCollections.mockRejectedValue(
        new Error('Safety check failed')
      );

      const result = await collectionTools.deleteCollection({
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dihapus');
    });

    it('harus handle force delete tanpa safety check', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.deleteCollection.mockResolvedValue({
        success: true
      } as any);

      const result = await collectionTools.deleteCollection({
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        force: true
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dihapus');
    });

    it('harus handle collection dengan parent ID', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.createCollection.mockResolvedValue({
        id: 'col-child',
        name: 'Child Collection',
        project_id: 'proj-1',
        parent_id: 'col-parent'
      } as any);

      const result = await collectionTools.createCollection({
        name: 'Child Collection',
        projectId: 'proj-1',
        parentId: 'col-parent',
        description: 'Nested collection'
      });

      expect(result.content[0].text).toContain('✅ Koleksi Berhasil Dibuat');
    });

    it('harus handle getCollections dengan pagination options', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getCollections.mockResolvedValue({
        collections: [{
          id: 'col-1',
          name: 'Collection 1',
          endpoint_count: 5
        }]
      } as any);

      const result = await collectionTools.getCollections({
        projectId: 'proj-1',
        includeEndpointCount: true,
        flatten: true
      });

      expect(result.content[0].text).toContain('📚 Koleksi');
    });

    it('harus handle handleToolCall untuk move_collection', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.moveCollection.mockResolvedValue({
        success: true
      } as any);

      const result = await collectionTools.handleToolCall('move_collection', {
        collectionId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        newParentId: 'bbbbbbbb-cccc-4ddd-9eee-ffffffffffff'
      });

      expect(result).toBeDefined();
    });
  });
});
