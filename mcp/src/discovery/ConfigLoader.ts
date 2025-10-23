import * as fs from 'fs/promises';
import * as path from 'path';
import { CacheManager } from '../cache/CacheManager';
import { GassapiConfig } from '../types/config.types';

/**
 * Loader untuk konfigurasi GASSAPI
 * Otomatis deteksi dan parsing file konfigurasi gassapi.json
 */
export class ConfigLoader {
  private cacheManager: CacheManager;
  private configCache: Map<string, GassapiConfig> = new Map();

  constructor() {
    this.cacheManager = new CacheManager();
  }

  /**
   * Deteksi otomatis file gassapi.json dengan scan parent directory
   */
  async detectProjectConfig(): Promise<GassapiConfig | null> {
    const currentDir = process.cwd();

    // Scan parent directory untuk gassapi.json
    return this.scanForConfig(currentDir);
  }

  /**
   * Scan file gassapi.json di direktori saat ini dan parent
   */
  private async scanForConfig(startDir: string): Promise<GassapiConfig | null> {
    let currentDir = path.resolve(startDir);
    const rootDir = path.parse(currentDir).root;

    while (currentDir !== rootDir && currentDir !== path.dirname(rootDir)) {
      const configPath = path.join(currentDir, 'gassapi.json');

      if (await this.fileExists(configPath)) {
        try {
          const config = await this.loadConfig(configPath);
          console.log(`Ketemu konfig GASSAPI di: ${configPath}`);
          return config;
        } catch (error) {
          console.warn(`Konfig file jelek di ${configPath}:`, error instanceof Error ? error.message : 'Error gak jelas');
        }
      }

      // Pindah ke parent directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Udah sampe root
      currentDir = parentDir;
    }

    return null;
  }

  /**
   * Load file konfigurasi gassapi.json spesifik
   */
  async loadConfig(configPath: string): Promise<GassapiConfig> {
    // Cek cache dulu
    const cachedConfig = await this.cacheManager.getCachedProjectConfig(configPath);

    if (cachedConfig) {
      return cachedConfig;
    }

    // Load dari file
    if (!await this.fileExists(configPath)) {
      throw new Error(`File konfigurasi ilang: ${configPath}`);
    }

    try {
      const content = await fs.readFile(configPath, 'utf-8');
      const config = JSON.parse(content) as GassapiConfig;

      // Validasi struktur konfigurasi
      this.validateConfig(config);

      // Cache konfigurasi yang valid
      await this.cacheManager.cacheProjectConfig(configPath, config);

      return config;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`JSON-nya aneh di ${configPath}: ${error.message}`);
      } else if (error instanceof Error) {
        throw new Error(`Gagal load ${configPath}: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validasi struktur konfigurasi GASSAPI
   */
  public validateConfig(config: any): asserts config is GassapiConfig {
    // Validasi field wajib
    if (!config.project || typeof config.project !== 'object') {
      throw new Error('Konfigurasi project-nya ilang atau salah format');
    }

    if (!config.project.id || typeof config.project.id !== 'string') {
      throw new Error('project.id-nya ilang atau salah format');
    }

    if (!config.project.name || typeof config.project.name !== 'string') {
      throw new Error('project.name-nya ilang atau salah format');
    }

    if (!config.mcpClient || typeof config.mcpClient !== 'object') {
      throw new Error('Konfigurasi mcpClient-nya ilang atau salah format');
    }

    if (!config.mcpClient.token || typeof config.mcpClient.token !== 'string') {
      throw new Error('mcpClient.token-nya ilang atau salah format');
    }

    if (!config.mcpClient.serverURL || typeof config.mcpClient.serverURL !== 'string') {
      throw new Error('mcpClient.serverURL-nya ilang atau salah format');
    }

    // Validasi field opsional
    if (config.environment && typeof config.environment !== 'object') {
      if (config.environment.active && typeof config.environment.active !== 'string') {
        throw new Error('environment.active harus string');
      }

      if (config.environment.variables && typeof config.environment.variables !== 'object') {
        throw new Error('environment.variables harus object');
      }
    }

    // Validasi konfigurasi API
    if (config.api && typeof config.api === 'object') {
      if (config.api.baseURL && typeof config.api.baseURL !== 'string') {
        throw new Error('api.baseURL harus string');
      }

      if (config.api.port && typeof config.api.port !== 'number') {
        throw new Error('api.port harus angka');
      }

      if (config.api.paths && !Array.isArray(config.api.paths)) {
        throw new Error('api.paths harus array');
      }
    }

    // Validasi konfigurasi discovery
    if (config.discovery && typeof config.discovery === 'object') {
      if (config.discovery.autoScan && typeof config.discovery.autoScan !== 'boolean') {
        throw new Error('discovery.autoScan harus boolean');
      }

      if (config.discovery.ports && !Array.isArray(config.discovery.ports)) {
        throw new Error('discovery.ports harus array');
      }
    }

    // Validasi format token
    if (config.mcpClient.token.length < 10) {
      throw new Error('Token mcpClient-nya terlalu pendek (minimal 10 karakter)');
    }

    // Validasi URL server
    try {
      new URL(config.mcpClient.serverURL);
    } catch {
      throw new Error('URL server mcpClient-nya nggak valid');
    }
  }

  /**
   * Dapatkan template konfigurasi default
   */
  static getDefaultConfig(): Partial<GassapiConfig> {
    return {
      project: {
        id: '',
        name: ''
      },
      mcpClient: {
        token: '',
        serverURL: 'http://localhost:3000'
      },
      environment: {
        active: 'development',
        variables: {}
      },
      api: {
        baseURL: 'http://localhost:3000',
        port: 3000,
        paths: ['/api', '/v1']
      },
      discovery: {
        autoScan: true,
        ports: [3000, 8000, 8080, 5000]
      }
    };
  }

  /**
   * Bikin file konfigurasi sample
   */
  static async createSampleConfig(projectDir: string, projectId: string, projectName: string): Promise<void> {
    const config: GassapiConfig = {
      project: {
        id: projectId,
        name: projectName,
        description: `Project GASSAPI: ${projectName}`
      },
      mcpClient: {
        token: 'TOKEN_MCP_LO_DISINI',
        serverURL: 'http://localhost:3000'
      },
      environment: {
        active: 'development',
        variables: {
          'API_BASE_URL': 'http://localhost:3000',
          'NODE_ENV': 'development'
        }
      },
      api: {
        baseURL: 'http://localhost:3000',
        port: 3000,
        paths: ['/api', '/v1']
      },
      discovery: {
        autoScan: true,
        ports: [3000, 8000, 8080, 5000]
      }
    };

    const configPath = path.join(projectDir, 'gassapi.json');
    const content = JSON.stringify(config, null, 2);

    await fs.writeFile(configPath, content, 'utf-8');
    console.log(`Sample konfigurasi dibuat: ${configPath}`);
    console.log('Jangan lupa update mcpClient.token dengan token asli MCP lo');
  }

  /**
   * Reload konfigurasi (clear cache dan reload)
   */
  async reloadConfig(configPath: string): Promise<GassapiConfig> {
    // Clear cache untuk konfig ini
    await this.cacheManager.clearProjectCache('all');

    // Clear cache in-memory untuk konfig spesifik ini
    this.configCache.delete(configPath);

    // Load konfigurasi fresh
    return this.loadConfig(configPath);
  }

  /**
   * Dapatkan konfigurasi dengan cache
   */
  async getCachedConfig(configPath: string): Promise<GassapiConfig | null> {
    // Cek cache in-memory dulu
    if (this.configCache.has(configPath)) {
      return this.configCache.get(configPath)!;
    }

    // Load dari file system
    try {
      const config = await this.loadConfig(configPath);

      // Cache di memory untuk akses berikutnya lebih cepet
      this.configCache.set(configPath, config);

      return config;
    } catch (error) {
      console.warn(`Gagal load config ${configPath}:`, error instanceof Error ? error.message : 'Error gak jelas');
      return null;
    }
  }

  /**
   * Clear semua cache konfigurasi
   */
  clearCache(): void {
    this.configCache.clear();
  }

  /**
   * Validasi keberadaan file konfigurasi
   */
  async configExists(configPath?: string): Promise<boolean> {
    const configFilePath = configPath || path.join(process.cwd(), 'gassapi.json');
    return this.fileExists(configFilePath);
  }

  /**
   * Dapatkan direktori project dari konfigurasi
   */
  async getProjectDirectory(configPath?: string): Promise<string | null> {
    if (configPath) {
      // Kalau configPath diberikan, gunakan itu langsung
      return path.dirname(configPath);
    }

    // Kalau nggak, coba deteksi konfigurasi otomatis
    const config = await this.detectProjectConfig();
    if (!config) return null;

    // Balikin direktori current karena konfig ditemukan di sini
    return process.cwd();
  }

  /**
   * Cek apakah file ada
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalisasi variabel environment
   */
  normalizeEnvironmentVariables(variables: Record<string, any>): Record<string, string> {
    const normalized: Record<string, string> = {};

    for (const [key, value] of Object.entries(variables)) {
      if (value === null || value === undefined) {
        continue;
      }

      normalized[key] = String(value);
    }

    return normalized;
  }

  /**
   * Ambil variabel environment untuk environment tertentu
   */
  extractEnvironmentVariables(config: GassapiConfig, environmentName?: string): Record<string, string> {
    const targetEnv = environmentName || config.environment?.active || 'development';
    const variables = { ...config.environment?.variables };

    return this.normalizeEnvironmentVariables(variables);
  }

  /**
   * Dapatkan nama environment yang aktif
   */
  getActiveEnvironment(config: GassapiConfig): string {
    return config.environment?.active || 'development';
  }

  /**
   * Dapatkan informasi project
   */
  getProjectInfo(config: GassapiConfig): { id: string; name: string; description?: string } {
    return {
      id: config.project.id,
      name: config.project.name,
      description: config.project.description
    };
  }

  /**
   * Dapatkan URL server
   */
  getServerURL(config: GassapiConfig): string {
    return config.mcpClient.serverURL;
  }

  /**
   * Dapatkan token MCP
   */
  getMcpToken(config: GassapiConfig): string {
    return config.mcpClient.token;
  }

  /**
   * Dapatkan base URL API
   */
  getApiBaseUrl(config: GassapiConfig): string {
    return config.api?.baseURL || config.mcpClient.serverURL;
  }

  /**
   * Dapatkan port discovery
   */
  getDiscoveryPorts(config: GassapiConfig): number[] {
    return config.discovery?.ports || [3000, 8000, 8080, 5000];
  }

  /**
   * Apakah harus auto-scan API
   */
  shouldAutoScan(config: GassapiConfig): boolean {
    return config.discovery?.autoScan !== false; // Default ke true
  }
}