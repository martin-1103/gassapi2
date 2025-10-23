import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { AuthTools } from '../auth';
import { ConfigLoader } from '../../discovery/ConfigLoader';
import { BackendClient } from '../../client/BackendClient';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');

describe('AuthTools', () => {
  let authTools: AuthTools;
  let mockConfigLoader: jest.Mocked<ConfigLoader>;
  let mockBackendClient: jest.Mocked<BackendClient>;

  beforeEach(() => {
    // Clear all mocks sebelum tiap test
    jest.clearAllMocks();

    // Setup mock config loader
    mockConfigLoader = {
      detectProjectConfig: jest.fn(),
      getMcpToken: jest.fn(),
      getServerURL: jest.fn(),
      clearCache: jest.fn(),
    } as any;

    // Setup mock backend client
    mockBackendClient = {
      validateToken: jest.fn(),
      getProjectContext: jest.fn(),
    } as any;

    // Mock constructors
    (ConfigLoader as jest.MockedClass<typeof ConfigLoader>).mockImplementation(() => mockConfigLoader);
    (BackendClient as jest.MockedClass<typeof BackendClient>).mockImplementation(() => mockBackendClient);

    authTools = new AuthTools();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('validateMcpToken', () => {
    it('harus return success response kalo token valid', async () => {
      // Setup mock config
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      // Setup mock validation response
      mockBackendClient.validateToken.mockResolvedValue({
        valid: true,
        project: {
          id: 'project-123',
          name: 'Test Project'
        },
        environment: {
          name: 'Development',
          variables: { API_KEY: 'test-key' }
        },
        lastValidatedAt: '2025-10-23T10:00:00Z'
      } as any);

      // Execute
      const result = await authTools.validateMcpToken({ token: 'valid-token' });

      // Verify
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('✅ Token MCP Valid');
      expect(result.content[0].text).toContain('Test Project');
      expect(result.isError).toBeUndefined();
    });

    it('harus return error response kalo token invalid', async () => {
      // Setup mock config
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'invalid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('invalid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      // Mock validation failure
      mockBackendClient.validateToken.mockRejectedValue(new Error('Token tidak valid'));

      // Execute
      const result = await authTools.validateMcpToken({ token: 'invalid-token' });

      // Verify
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('❌ Validasi Token MCP Gagal');
      expect(result.content[0].text).toContain('Token tidak valid');
      expect(result.isError).toBe(true);
    });

    it('harus throw error kalo config ga ketemu', async () => {
      // Mock config not found
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      // Execute
      const result = await authTools.validateMcpToken({});

      // Verify
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Validasi Token MCP Gagal');
      expect(result.content[0].text).toContain('Konfigurasi GASSAPI ga ketemu');
    });

    it('harus throw error kalo token ga ada', async () => {
      // Setup mock config tanpa token
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: '',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('');

      // Execute
      const result = await authTools.validateMcpToken({});

      // Verify
      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('Token MCP ga ada');
    });
  });

  describe('getAuthStatus', () => {
    it('harus return status authenticated kalo config dan token valid', async () => {
      // Setup mock config
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.validateToken.mockResolvedValue({
        valid: true,
        lastValidatedAt: '2025-10-23T10:00:00Z'
      } as any);

      // Execute
      const result = await authTools.getAuthStatus();

      // Verify
      expect(result.content[0].text).toContain('📋 Status Autentikasi');
      expect(result.content[0].text).toContain('✅ Ketemu');
      expect(result.content[0].text).toContain('Test Project');
      expect(result.content[0].text).toContain('🟢 Siap untuk operasi GASSAPI');
      expect(result.isError).toBeUndefined();
    });

    it('harus return status kalo config ga ada', async () => {
      // Mock config not found
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      // Execute
      const result = await authTools.getAuthStatus();

      // Verify
      expect(result.content[0].text).toContain('📋 Status Autentikasi');
      expect(result.content[0].text).toContain('❌ Ketemu');
      expect(result.content[0].text).toContain('Ga ada di direktori parent');
    });

    it('harus return invalid token status kalo token ga valid', async () => {
      // Setup mock config
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'invalid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('invalid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.validateToken.mockRejectedValue(new Error('Token expired'));

      // Execute
      const result = await authTools.getAuthStatus();

      // Verify
      expect(result.content[0].text).toContain('Token: ❌ Invalid');
      expect(result.content[0].text).toContain('Token expired');
      expect(result.isError).toBe(true);
    });
  });

  describe('getProjectContext', () => {
    it('harus return project context dengan environments dan collections', async () => {
      // Setup mocks
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockResolvedValue({
        project: {
          id: 'project-123',
          name: 'Test Project',
          description: 'Test project description'
        },
        environments: [
          { id: 'env-1', name: 'Development', is_default: true },
          { id: 'env-2', name: 'Production', is_default: false }
        ],
        collections: [
          { id: 'col-1', name: 'API Collection', endpoint_count: 5 }
        ]
      } as any);

      // Execute
      const result = await authTools.getProjectContext({ project_id: 'project-123' });

      // Verify
      expect(result.content[0].text).toContain('📋 Konteks Proyek');
      expect(result.content[0].text).toContain('Test Project');
      expect(result.content[0].text).toContain('Development');
      expect(result.content[0].text).toContain('API Collection');
      expect(result.isError).toBeUndefined();
    });

    it('harus handle error kalo project ga ada', async () => {
      // Setup mocks
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getProjectContext.mockRejectedValue(new Error('Project not found'));

      // Execute
      const result = await authTools.getProjectContext({ project_id: 'invalid-id' });

      // Verify
      expect(result.content[0].text).toContain('❌ Gagal Muat Konteks Proyek');
      expect(result.content[0].text).toContain('Project not found');
      expect(result.isError).toBe(true);
    });
  });

  describe('refreshAuth', () => {
    it('harus clear cache dan validasi ulang token', async () => {
      // Setup mocks
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.validateToken.mockResolvedValue({
        valid: true,
        project: { id: 'project-123', name: 'Test Project' },
        environment: { name: 'Development', variables: {} },
        lastValidatedAt: '2025-10-23T10:00:00Z'
      } as any);

      // Execute
      const result = await authTools.refreshAuth();

      // Verify
      expect(mockConfigLoader.clearCache).toHaveBeenCalled();
      expect(result.content[0].text).toContain('🔄 Autentikasi Di-refresh');
      expect(result.content[0].text).toContain('✅ Dibersihin');
      expect(result.content[0].text).toContain('✅ Di-validasi ulang');
      expect(result.isError).toBeUndefined();
    });

    it('harus return error status kalo validasi gagal setelah refresh', async () => {
      // Setup mocks
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.validateToken.mockRejectedValue(new Error('Token expired'));

      // Execute
      const result = await authTools.refreshAuth();

      // Verify
      expect(mockConfigLoader.clearCache).toHaveBeenCalled();
      expect(result.content[0].text).toContain('⚠️ Refresh Autentikasi Selesai');
      expect(result.content[0].text).toContain('❌ Validasi gagal');
      expect(result.isError).toBe(true);
    });
  });

  describe('getTools', () => {
    it('harus return array of auth tools', () => {
      const tools = authTools.getTools();

      expect(tools).toHaveLength(1);
      expect(tools[0].name).toBe('validate_mcp_token');
      expect(tools[0].description).toContain('Validasi token MCP');
    });
  });

  describe('handleToolCall', () => {
    it('harus handle validate_mcp_token tool call', async () => {
      // Setup mocks
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { 
          token: 'valid-token',
          serverURL: 'https://api.test.com'
        }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.validateToken.mockResolvedValue({
        valid: true,
        project: { id: 'project-123', name: 'Test Project' },
        environment: { name: 'Development', variables: {} },
        lastValidatedAt: '2025-10-23T10:00:00Z'
      } as any);

      // Execute
      const result = await authTools.handleToolCall('validate_mcp_token', { token: 'valid-token' });

      // Verify
      expect(result).toBeDefined();
      expect((result as any).content[0].text).toContain('✅ Token MCP Valid');
    });

    it('harus throw error untuk unknown tool name', async () => {
      await expect(authTools.handleToolCall('unknown_tool', {}))
        .rejects.toThrow('Tool autentikasi tidak diketahui: unknown_tool');
    });
  });
});
