import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { EnvironmentTools } from '../environment';
import { ConfigLoader } from '../../discovery/ConfigLoader';
import { BackendClient } from '../../client/BackendClient';

// Mock dependencies
jest.mock('../../discovery/ConfigLoader');
jest.mock('../../client/BackendClient');

describe('EnvironmentTools', () => {
  let environmentTools: EnvironmentTools;
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
      getEnvironments: jest.fn(),
      getEnvironmentVariables: jest.fn(),
      setEnvironmentVariable: jest.fn(),
      exportEnvironment: jest.fn(),
      importEnvironment: jest.fn(),
    } as any;

    (ConfigLoader as jest.MockedClass<typeof ConfigLoader>).mockImplementation(() => mockConfigLoader);
    (BackendClient as jest.MockedClass<typeof BackendClient>).mockImplementation(() => mockBackendClient);

    environmentTools = new EnvironmentTools();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('listEnvironments', () => {
    it('harus return list environments dari project', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironments.mockResolvedValue({
        environments: [
          { id: 'env-1', name: 'Development', is_default: true },
          { id: 'env-2', name: 'Production', is_default: false }
        ]
      } as any);

      const result = await environmentTools.listEnvironments({ projectId: 'project-123' });

      expect(result.content[0].text).toContain('📋 Project Environments');
      expect(result.content[0].text).toContain('Development');
      expect(result.content[0].text).toContain('Production');
      expect(result.content[0].text).toContain('🟢'); // Default marker
      expect(result.isError).toBeUndefined();
    });

    it('harus return message kalo ga ada environments', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironments.mockResolvedValue({ environments: [] } as any);

      const result = await environmentTools.listEnvironments({});

      expect(result.content[0].text).toContain('No environments found');
    });

    it('harus handle error kalo config ga ketemu', async () => {
      mockConfigLoader.detectProjectConfig.mockResolvedValue(null);

      const result = await environmentTools.listEnvironments({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Failed to List Environments');
    });
  });

  describe('getEnvironmentVariables', () => {
    it('harus return environment variables yang enabled', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Development' },
        variables: [
          { id: 'var-1', key: 'API_KEY', value: 'test-key', enabled: true, description: 'API key' },
          { id: 'var-2', key: 'DB_HOST', value: 'localhost', enabled: true }
        ]
      } as any);

      const result = await environmentTools.getEnvironmentVariables({ 
        environmentId: 'env-1' 
      });

      expect(result.content[0].text).toContain('🔧 Environment Variables');
      expect(result.content[0].text).toContain('API_KEY');
      expect(result.content[0].text).toContain('test-key');
      expect(result.content[0].text).toContain('API key');
      expect(result.isError).toBeUndefined();
    });

    it('harus include disabled variables kalo includeDisabled = true', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Development' },
        variables: [
          { id: 'var-1', key: 'API_KEY', value: 'test-key', enabled: true },
          { id: 'var-2', key: 'OLD_KEY', value: 'old-value', enabled: false }
        ]
      } as any);

      const result = await environmentTools.getEnvironmentVariables({ 
        environmentId: 'env-1',
        includeDisabled: true 
      });

      expect(result.content[0].text).toContain('API_KEY');
      expect(result.content[0].text).toContain('OLD_KEY');
      expect(result.content[0].text).toContain('Disabled Variables');
    });

    it('harus return message kalo ga ada variables', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironmentVariables.mockResolvedValue({
        environment: { id: 'env-1', name: 'Development' },
        variables: []
      } as any);

      const result = await environmentTools.getEnvironmentVariables({ 
        environmentId: 'env-1' 
      });

      expect(result.content[0].text).toContain('No variables found');
    });
  });

  describe('setEnvironmentVariable', () => {
    it('harus set variable baru dengan sukses', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.setEnvironmentVariable.mockResolvedValue({
        success: true
      } as any);

      const result = await environmentTools.setEnvironmentVariable({
        environmentId: 'env-1',
        key: 'NEW_VAR',
        value: 'new-value',
        description: 'Test variable',
        enabled: true
      });

      expect(result.content[0].text).toContain('✅ Environment Variable Set');
      expect(result.content[0].text).toContain('NEW_VAR');
      expect(result.content[0].text).toContain('new-value');
      expect(result.content[0].text).toContain('🟢 Enabled');
      expect(result.isError).toBeUndefined();
    });

    it('harus handle disabled variable', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.setEnvironmentVariable.mockResolvedValue({
        success: true
      } as any);

      const result = await environmentTools.setEnvironmentVariable({
        environmentId: 'env-1',
        key: 'DISABLED_VAR',
        value: 'value',
        enabled: false
      });

      expect(result.content[0].text).toContain('🔴 Disabled');
    });

    it('harus handle error saat set variable', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.setEnvironmentVariable.mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await environmentTools.setEnvironmentVariable({
        environmentId: 'env-1',
        key: 'VAR',
        value: 'value'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Failed to Set Environment Variable');
      expect(result.content[0].text).toContain('Permission denied');
    });
  });

  describe('exportEnvironment', () => {
    it('harus export environment dalam format JSON', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.exportEnvironment.mockResolvedValue({
        content: { API_KEY: 'test-key', DB_HOST: 'localhost' }
      } as any);

      const result = await environmentTools.exportEnvironment({
        environmentId: 'env-1',
        format: 'json'
      });

      expect(result.content[0].text).toContain('📤 Environment Exported');
      expect(result.content[0].text).toContain('JSON');
      expect(result.content[0].text).toContain('API_KEY');
      expect(result.isError).toBeUndefined();
    });

    it('harus handle string format export', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.exportEnvironment.mockResolvedValue({
        content: 'API_KEY=test-key\nDB_HOST=localhost'
      } as any);

      const result = await environmentTools.exportEnvironment({
        environmentId: 'env-1',
        format: 'env'
      });

      expect(result.content[0].text).toContain('📤 Environment Exported');
      expect(result.content[0].text).toContain('ENV');
      expect(result.content[0].text).toContain('API_KEY=test-key');
    });

    it('harus handle error saat export', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.exportEnvironment.mockRejectedValue(
        new Error('Export failed')
      );

      const result = await environmentTools.exportEnvironment({
        environmentId: 'env-1'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Failed to Export Environment');
    });
  });

  describe('importEnvironment', () => {
    it('harus import variables dengan sukses', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.importEnvironment.mockResolvedValue({
        success: true,
        imported: 2
      } as any);

      const variables = [
        { key: 'API_KEY', value: 'test-key', enabled: true },
        { key: 'DB_HOST', value: 'localhost', enabled: true }
      ];

      const result = await environmentTools.importEnvironment({
        environmentId: 'env-1',
        variables,
        overwrite: false
      });

      expect(result.content[0].text).toContain('📥 Environment Imported');
      expect(result.content[0].text).toContain('Variables Imported: 2');
      expect(result.content[0].text).toContain('API_KEY');
      expect(result.content[0].text).toContain('DB_HOST');
      expect(result.isError).toBeUndefined();
    });

    it('harus handle import dengan overwrite', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.importEnvironment.mockResolvedValue({
        success: true,
        imported: 1
      } as any);

      const result = await environmentTools.importEnvironment({
        environmentId: 'env-1',
        variables: [{ key: 'VAR', value: 'val' }],
        overwrite: true
      });

      expect(result.content[0].text).toContain('Overwrite: Yes');
    });

    it('harus handle error saat import', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.importEnvironment.mockRejectedValue(
        new Error('Import conflict')
      );

      const result = await environmentTools.importEnvironment({
        environmentId: 'env-1',
        variables: []
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('❌ Failed to Import Environment');
    });
  });

  describe('getTools', () => {
    it('harus return array of environment tools', () => {
      const tools = environmentTools.getTools();

      expect(tools).toHaveLength(5);
      expect(tools[0].name).toBe('list_environments');
      expect(tools[1].name).toBe('get_environment_variables');
      expect(tools[2].name).toBe('set_environment_variable');
      expect(tools[3].name).toBe('export_environment');
      expect(tools[4].name).toBe('import_environment');
    });
  });

  describe('handleToolCall', () => {
    it('harus handle list_environments', async () => {
      const mockConfig = {
        project: { id: 'project-123', name: 'Test Project' },
        mcpClient: { token: 'valid-token', serverURL: 'https://api.test.com' }
      };

      mockConfigLoader.detectProjectConfig.mockResolvedValue(mockConfig as any);
      mockConfigLoader.getMcpToken.mockReturnValue('valid-token');
      mockConfigLoader.getServerURL.mockReturnValue('https://api.test.com');

      mockBackendClient.getEnvironments.mockResolvedValue({
        environments: []
      } as any);

      const result = await environmentTools.handleToolCall('list_environments', {});
      expect(result).toBeDefined();
    });

    it('harus throw error untuk unknown tool', async () => {
      await expect(environmentTools.handleToolCall('unknown_tool', {}))
        .rejects.toThrow('Unknown environment tool: unknown_tool');
    });
  });
});
