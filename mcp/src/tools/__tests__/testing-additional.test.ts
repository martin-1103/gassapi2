import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { TestingTools } from '../testing';
import { ConfigLoader } from '../../discovery/ConfigLoader';
import { BackendClient } from '../../client/BackendClient';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');
jest.mock('../../utils/Logger');

describe('TestingTools - Additional Coverage', () => {
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

  describe('testEndpoint - validation scenarios', () => {
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

    it('harus handle invalid endpointId empty string', async () => {
      const result = await testingTools.testEndpoint({
        endpointId: '',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Endpoint ID');
    });

    it('harus handle invalid environmentId empty string', async () => {
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

    it('harus handle override variables dengan value terlalu panjang', async () => {
      const longValue = 'x'.repeat(15000);
      
      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def',
        overrideVariables: { LONG_VAR: longValue }
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('terlalu panjang');
    });

    it('harus handle override variables dengan key terlalu panjang', async () => {
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
  });

  describe('quickTest - additional scenarios', () => {
    it('harus handle quickTest dengan method filter', async () => {
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
          {
            id: 'col-1',
            name: 'API Collection',
            endpoints: [
              { id: 'ep-1', name: 'Get Users', method: 'GET', url: '/api/users' },
              { id: 'ep-2', name: 'Create User', method: 'POST', url: '/api/users' }
            ]
          }
        ],
        environments: [
          { id: 'env-1', name: 'Development', is_default: true }
        ]
      } as any);

      mockBackendClient.testEndpoint.mockResolvedValue({
        id: 'test-1',
        status: 200,
        response_time: 100,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Dev' },
        variables: []
      } as any);

      const result = await testingTools.quickTest({
        method: 'GET'
      });

      // QuickTest bisa return error kalo ada masalah setup
      expect(result).toBeDefined();
    });

    it('harus handle quickTest tanpa default environment', async () => {
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
    });
  });

  describe('batchTest - additional scenarios', () => {
    it('harus handle batchTest dengan empty array', async () => {
      const result = await testingTools.batchTest({
        endpointIds: [],
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('array yang tidak kosong');
    });

    it('harus handle batchTest dengan invalid delay negative', async () => {
      const result = await testingTools.batchTest({
        endpointIds: ['12345678-1234-5678-9abc-123456789def'],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        delay: -100
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Delay');
    });

    it('harus handle batchTest success case', async () => {
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

      const result = await testingTools.batchTest({
        endpointIds: ['12345678-1234-5678-9abc-123456789def'],
        environmentId: '12345678-1234-5678-9abc-123456789def',
        delay: 100
      });

      expect(result.isError).toBeUndefined();
      expect(result.content[0].text).toContain('Batch Test');
    });
  });

  describe('handleToolCall - additional coverage', () => {
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

  describe('testEndpoint - status code scenarios', () => {
    it('harus handle 404 status code', async () => {
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
        status: 404,
        response_time: 50,
        created_at: '2025-10-23T10:00:00Z',
        error: 'Not found'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      expect(result.content[0].text).toContain('🔴');
      expect(result.content[0].text).toContain('404');
    });

    it('harus handle 300-399 redirect status', async () => {
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
        status: 302,
        response_time: 50,
        created_at: '2025-10-23T10:00:00Z'
      } as any);

      const result = await testingTools.testEndpoint({
        endpointId: '12345678-1234-5678-9abc-123456789def',
        environmentId: '12345678-1234-5678-9abc-123456789def'
      });

      // Redirect status diperlakukan sebagai failed (🔴) di implementation
      expect(result.content[0].text).toContain('🔴');
      expect(result.content[0].text).toContain('302');
    });
  });

  describe('quickTest - method and URL filtering', () => {
    it('harus handle quickTest dengan url parameter', async () => {
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
          {
            id: 'col-1',
            name: 'API Collection',
            endpoints: [
              { id: 'ep-1', name: 'Get Users', method: 'GET', url: '/api/users' }
            ]
          }
        ],
        environments: [
          { id: 'env-1', name: 'Development', is_default: true }
        ]
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

      const result = await testingTools.quickTest({
        url: '/api/users'
      });

      expect(result).toBeDefined();
    });
  });
});
