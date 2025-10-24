import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TestingTools } from '../testing.js';
import { ConfigLoader } from '../../discovery/ConfigLoader.js';
import { BackendClient } from '../../client/BackendClient.js';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');
jest.mock('../../utils/Logger');

describe('TestingTools - 100% Coverage', () => {
  let testingTools: TestingTools;
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
      getEnvironmentVariables: jest.fn(),
      testEndpoint: jest.fn(),
      getProjectContext: jest.fn(),
      getEndpoints: jest.fn(),
    } as any;

    (ConfigLoader as jest.MockedClass<typeof ConfigLoader>).mockImplementation(() => mockConfigLoader);
    (BackendClient as jest.MockedClass<typeof BackendClient>).mockImplementation(() => mockBackendClient);

    testingTools = new TestingTools();
  });

  describe('testEndpoint - safeApiCall error scenarios', () => {
    it('harus handle 404 error dari API call', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('404 not found'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('tidak ditemukan');
    });

    it('harus handle 401 unauthorized error dari API', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('401 unauthorized'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Akses ditolak');
    });

    it('harus handle 403 forbidden error dari API', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('403 forbidden'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('forbidden');
    });

    it('harus handle 500 server error dari API', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('500 server error'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Server error');
    });

    it('harus handle network error dari API', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('network connection failed'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Koneksi error');
    });

    it('harus handle timeout error dari API', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockRejectedValue(new Error('request timeout'));

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Timeout');
    });
  });

  describe('testEndpoint - transformEnvironmentVariables edge cases', () => {
    it('harus handle variable dengan key kosong (trimmed)', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      // Variable dengan key yang empty setelah trim
      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: [
          { id: 'var-1', key: '   ', value: 'value1', enabled: true }
        ]
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      // Harusnya success meskipun ada variable invalid (cuma di-skip)
      expect(result.isError).toBeUndefined();
    });

    it('harus handle variable dengan value null', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: [
          { id: 'var-1', key: 'NULL_VAR', value: null, enabled: true }
        ]
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBeUndefined();
    });

    it('harus handle variable yang disabled', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: [
          { id: 'var-1', key: 'DISABLED_VAR', value: 'test', enabled: false }
        ]
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBeUndefined();
    });

    it('harus handle variable dengan invalid object', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: [
          null, // Invalid variable
          { id: 'var-1', key: 'VALID_VAR', value: 'test', enabled: true }
        ]
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBeUndefined();
    });

    it('harus handle environment variables bukan array', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: 'not-an-array' as any
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('environment variables');
    });
  });

  describe('testEndpoint - formatTestResult edge cases', () => {
    it('harus handle test result dengan invalid status type', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      // Status sebagai string bukan number
      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 'invalid' as any,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      // Harusnya tetap berhasil format, status diubah ke 500
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('500');
    });

    it('harus handle test result dengan invalid timestamp', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: 'invalid-date'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBeUndefined();
      // Harusnya tetap ada timestamp, meski invalid (akan jadi "Invalid Date")
      expect(result.content[0].text).toContain('Invalid Date');
    });

    it('harus handle response body terlalu besar', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      // Response body besar banget (>1000 karakter)
      const largeBody = 'x'.repeat(2000);
      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z',
        response_body: largeBody
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('terlalu besar');
    });
  });

  describe('quickTest - edge cases', () => {
    it('harus handle project dengan collections tapi tidak ada endpoints', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: { id: 'proj-1', name: 'Test Project' },
        collections: [
          { id: 'col-1', name: 'Empty Collection', endpoints: [] }
        ],
        environments: [
          { id: 'env-1', name: 'Development', is_default: true }
        ]
      } as any);

      mockBackendClient.getEndpoints.mockResolvedValue({ endpoints: [] } as any);

      const result = await testingTools.quickTest({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Tidak Ada Endpoint');
    });

    it('harus handle error saat getEndpoints', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: { id: 'proj-1', name: 'Test Project' },
        collections: [
          { id: 'col-1', name: 'Collection' }
        ],
        environments: [
          { id: 'env-1', name: 'Development', is_default: true }
        ]
      } as any);

      mockBackendClient.getEndpoints.mockRejectedValue(new Error('Failed to get endpoints'));

      const result = await testingTools.quickTest({});

      expect(result.isError).toBe(true);
    });

    it('harus handle project context error', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockRejectedValue(new Error('Failed to get context'));

      const result = await testingTools.quickTest({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Quick Test Gagal');
    });
  });

  describe('batchTest - uncovered scenarios', () => {
    it('harus handle invalid project config', async () => {
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      const result = await testingTools.batchTest({
        endpointIds: ['12345678-1234-5678-9abc-123456789def'],
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Konfigurasi');
    });

    it('harus handle sequential test dengan delay', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.batchTest({
        endpointIds: ['12345678-1234-5678-9abc-123456789def', '22345678-1234-5678-9abc-123456789def'],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        parallel: false,
        delay: 50
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Sequential');
    });

    it('harus handle sequential test failure', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.testEndpoint.mockRejectedValue(new Error('Test failed'));

      const result = await testingTools.batchTest({
        endpointIds: ['12345678-1234-5678-9abc-123456789def'],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        parallel: false
      });

      // Harusnya tetap return result dengan fallback
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Batch Test');
    });
  });

  describe('getBackendClient - error scenarios', () => {
    it('harus handle missing project ID di config', async () => {
      const mockConfig = {
        project: {}, // No ID
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('project ID');
    });

    it('harus handle missing server URL di config', async () => {
      const mockConfig = {
        project: { id: 'proj-1' },
        mcpClient: { token: 'token' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getServerURL.mockReturnValue('');

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('server URL');
    });

    it('harus handle missing MCP token di config', async () => {
      const mockConfig = {
        project: { id: 'proj-1' },
        mcpClient: { serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');
      mockConfigLoader.getMcpToken.mockReturnValue('');

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('MCP token');
    });
  });

  describe('quickTest - successful endpoint execution', () => {
    it('harus berhasil execute endpoint dengan environment default', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: { id: 'proj-1', name: 'Test Project' },
        collections: [
          { id: 'col-1', name: 'API Collection' }
        ],
        environments: [
          { id: 'env-1', name: 'Development', is_default: true }
        ]
      } as any);

      mockBackendClient.getEndpoints.mockResolvedValue({
        endpoints: [
          { id: 'ep-1', name: 'Get Users', method: 'GET', url: '/api/users' }
        ]
      } as any);

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        collection: { id: 'col-1', name: 'API Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.quickTest({});

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Quick Test');
      expect(result.content[0].text).toContain('Get Users');
    });

    it('harus handle project dengan no default environment', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: { id: 'proj-1', name: 'Test Project' },
        collections: [
          { id: 'col-1', name: 'API Collection' }
        ],
        environments: [
          { id: 'env-1', name: 'Staging', is_default: false },
          { id: 'env-2', name: 'Production', is_default: false }
        ]
      } as any);

      mockBackendClient.getEndpoints.mockResolvedValue({
        endpoints: [
          { id: 'ep-1', name: 'Get Users', method: 'GET', url: '/api/users' }
        ]
      } as any);

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'ep-1',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        collection: { id: 'col-1', name: 'API Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Staging' },
        variables: []
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.quickTest({});

      // Should succeed - will use first environment since no default
      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Quick Test');
    });
  });

  describe('batchTest - parallel and sequential execution', () => {
    it('harus berhasil parallel batch test', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.batchTest({
        endpointIds: [
          '12345678-1234-5678-9abc-123456789def',
          '22345678-1234-5678-9abc-123456789def',
          '32345678-1234-5678-9abc-123456789def'
        ],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        parallel: true,
        delay: 0
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Parallel');
      expect(result.content[0].text).toContain('Total Tests: 3');
    });

    it('harus handle batch test dengan mixed success dan failure', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      let callCount = 0;
      mockBackendClient.testEndpoint.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            id: 'test-1',
            status: 200,
            response_time: 100,
            created_at: '2025-10-23T10:00:00Z'
          } as any);
        } else {
          return Promise.reject(new Error('Test failed'));
        }
      });

      const result = await testingTools.batchTest({
        endpointIds: [
          '12345678-1234-5678-9abc-123456789def',
          '22345678-1234-5678-9abc-123456789def'
        ],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        parallel: true
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Successful: 1');
      expect(result.content[0].text).toContain('Failed: 1');
    });
  });

  describe('testEndpoint - validation API response', () => {
    it('harus handle invalid endpoint details response', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      // Return null sebagai endpoint details
      mockBackendClient.getEndpointDetails.mockResolvedValue(null as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('endpoint details tidak valid');
    });

    it('harus handle invalid environment variables response', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      // Return object tanpa variables array
      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' }
        // missing variables
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('environment variables tidak valid');
    });

    it('harus handle invalid test result response', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      // Return null sebagai test result
      mockBackendClient.testEndpoint.mockResolvedValue(null as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Hasil test tidak valid');
    });
  });
});
