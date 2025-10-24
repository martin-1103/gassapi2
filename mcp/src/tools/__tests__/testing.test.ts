import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TestingTools } from '../testing.js';
import { ConfigLoader } from '../../discovery/ConfigLoader.js';
import { BackendClient } from '../../client/BackendClient.js';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');
jest.mock('../../utils/Logger');

describe('TestingTools', () => {
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

  describe('testEndpoint', () => {
    it('harus execute endpoint test dengan sukses', async () => {
      const mockConfig = {
        project: { id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      // Mock endpoint details
      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        collection: { id: 'bbbbbbbb-cccc-4ddd-9eee-ffffffffffff', name: 'API Collection' }
      } as any);

      // Mock environment variables
      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'cccccccc-dddd-4eee-afff-aaaaaaaaaaaa', name: 'Development' },
        variables: [
          { id: 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb', key: 'API_KEY', value: 'test-key', enabled: true },
          { id: 'eeeeeeee-ffff-4aaa-8bbb-cccccccccccc', key: 'BASE_URL', value: 'https://api.test.com', enabled: true }
        ]
      } as any);

      // Mock test execution
      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'ffffffff-aaaa-4bbb-9ccc-dddddddddddd',
        status: 200,
        response_time: 150,
        created_at: '2025-10-23T10:00:00Z',
        response_headers: { 'Content-Type': 'application/json' },
        response_body: { users: [] }
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        environmentId: 'cccccccc-dddd-4eee-afff-aaaaaaaaaaaa'
      });

      expect(result.content[0].text).toContain('🧪 Hasil Test Endpoint');
      expect(result.content[0].text).toContain('🟢');
      expect(result.content[0].text).toContain('200');
      expect(result.content[0].text).toContain('150ms');
      expect(result.content[0].text).toContain('Get Users');
      expect(result.isError).toBeUndefined();
    });

    it('harus handle failed test dengan status error', async () => {
      const mockConfig = {
        project: { id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        name: 'Get Users',
        method: 'GET',
        url: '/api/users',
        collection: { id: 'bbbbbbbb-cccc-4ddd-9eee-ffffffffffff', name: 'API' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'cccccccc-dddd-4eee-afff-aaaaaaaaaaaa', name: 'Development' },
        variables: []
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'dddddddd-eeee-4fff-8aaa-bbbbbbbbbbbb',
        status: 500,
        response_time: 250,
        created_at: '2025-10-23T10:00:00Z',
        error: 'Internal server error'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        environmentId: 'cccccccc-dddd-4eee-afff-aaaaaaaaaaaa'
      });

      expect(result.content[0].text).toContain('🔴');
      expect(result.content[0].text).toContain('500');
      expect(result.content[0].text).toContain('Internal server error');
    });

    it('harus validate UUID format', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: 'invalid-uuid',
        environmentId: 'env-1'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Gagal Test Endpoint');
      expect(result.content[0].text).toContain('UUID');
    });

    it('harus handle override variables', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test Endpoint',
        method: 'GET',
        url: '/test',
        collection: { id: 'col-1', name: 'Collection' }
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: [
          { id: 'var-1', key: 'VAR1', value: 'original', enabled: true }
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
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { VAR1: 'overridden' }
      });

      
      expect(result.isError).toBeUndefined();
      expect(mockBackendClient.testEndpoint).toHaveBeenCalledWith(
        '12345678-1234-5678-9abc-123456789def',
        '12345678-1234-5678-9abc-123456789def',
        { VAR1: 'overridden' }
      );
    });

    it('harus handle missing config', async () => {
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      const result = await testingTools.testEndpoint({
        endpointId: 'aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee',
        environmentId: 'bbbbbbbb-cccc-2ddd-9eee-ffffffffffff'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Konfigurasi');
    });

    it('harus validate override variables format', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: 'aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee',
        environmentId: 'bbbbbbbb-cccc-2ddd-9eee-ffffffffffff',
        overrideVariables: 'invalid' as any
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Override variables');
    });
  });

  describe('quickTest', () => {
    it('harus handle missing config dengan graceful message', async () => {
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      const result = await testingTools.quickTest({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('🧪 Quick Test');
      expect(result.content[0].text).toContain('Konfigurasi Dibutuhkan');
    });

    it('harus handle project tanpa collections', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: { id: 'proj-1', name: 'Test Project' },
        collections: [],
        environments: []
      } as any);

      const result = await testingTools.quickTest({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Tidak Ada Endpoint');
    });

    it('harus validate URL format kalo disediakan', async () => {
      const result = await testingTools.quickTest({
        url: 123 as any
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('URL harus berupa string');
    });
  });

  describe('batchTest', () => {
    it('harus validate endpoint IDs array', async () => {
      const result = await testingTools.batchTest({
        endpointIds: 'not-an-array' as any,
        environmentId: 'env-1'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('array yang tidak kosong');
    });

    it('harus validate max 50 endpoints', async () => {
      const tooManyIds = Array(51).fill('aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee');

      const result = await testingTools.batchTest({
        endpointIds: tooManyIds,
        environmentId: 'bbbbbbbb-cccc-2ddd-9eee-ffffffffffff'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Terlalu banyak endpoints');
    });

    it('harus validate environment ID format', async () => {
      const result = await testingTools.batchTest({
        endpointIds: ['aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee'],
        environmentId: 'invalid-uuid'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Environment ID format tidak valid');
    });

    it('harus validate delay range', async () => {
      const result = await testingTools.batchTest({
        endpointIds: ['aaaaaaaa-bbbb-1ccc-8ddd-eeeeeeeeeeee'],
        environmentId: 'bbbbbbbb-cccc-2ddd-9eee-ffffffffffff',
        delay: 20000
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Delay');
    });
  });

  describe('getTools', () => {
    it('harus return array of testing tools', () => {
      const tools = testingTools.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('test_endpoint');
    });
  });

  describe('handleToolCall', () => {
    it('harus validate tool name', async () => {
      await expect(testingTools.handleToolCall('', {}))
        .rejects.toThrow('Tool name harus valid');
    });

    it('harus validate args object', async () => {
      await expect(testingTools.handleToolCall('test_endpoint', null as any))
        .rejects.toThrow('Arguments harus berupa object yang valid');
    });

    it('harus throw error untuk unknown tool', async () => {
      await expect(testingTools.handleToolCall('unknown_tool', {}))
        .rejects.toThrow('Testing tool tidak dikenal: unknown_tool');
    });

    it('harus handle test_endpoint tool call', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test Endpoint',
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
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.handleToolCall('test_endpoint', {
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result).toBeDefined();
    });
  });

  describe('testEndpoint - additional scenarios', () => {
    it('harus handle test dengan saveResult false', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test Endpoint',
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
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        saveResult: false
      });

      expect(result.isError).toBeUndefined();
    });

    it('harus handle test dengan response headers dan body', async () => {
      const mockConfig = {
        project: { id: 'proj-1', name: 'Test Project' },
        mcpClient: { token: 'token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEndpointDetails.mockResolvedValue({
        id: '12345678-1234-5678-9abc-123456789def',
        name: 'Test Endpoint',
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
        created_at: '2025-10-23T10:00:00Z',
        response_headers: {
          'Content-Type': 'application/json',
          'X-Custom': 'test-header'
        },
        response_body: {
          success: true,
          data: { id: 1, name: 'Test' }
        }
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.content[0].text).toContain('Response Headers');
      expect(result.content[0].text).toContain('Content-Type');
      expect(result.content[0].text).toContain('Response Body');
    });

    it('harus handle invalid endpointId format', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Endpoint ID');
    });

    it('harus handle invalid environmentId format', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: ''
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Environment ID');
    });

    it('harus handle invalid saveResult type', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        saveResult: 'true' as any
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('SaveResult');
    });

    it('harus handle override variables dengan value panjang', async () => {
      const longValue = 'x'.repeat(15000);
      
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { LONG_VAR: longValue }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('terlalu panjang');
    });

    it('harus handle override variables dengan key panjang', async () => {
      const longKey = 'K'.repeat(300);
      
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { [longKey]: 'value' }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('terlalu panjang');
    });

    it('harus handle override variables dengan empty key', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { '  ': 'value' }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('tidak kosong');
    });

    it('harus handle override variables dengan non-string value', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { NUM: 123 as any }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('harus berupa string');
    });
  });
});
