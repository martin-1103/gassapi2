// Simple MCP client for testing
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from './utils/Logger';

interface Config {
  project?: {
    id: string;
    name: string;
  };
  mcpClient?: {
    token: string;
    serverURL: string;
  };
}

/**
 * Type guards for configuration validation
 */

// Type guard untuk string
function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

// Type guard untuk URL validation
function isValidURL(value: unknown): value is string {
  if (!isValidString(value)) return false;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

// Type guard untuk project configuration
function isValidProject(project: unknown): project is { id: string; name: string } {
  if (!project || typeof project !== 'object') {
    return false;
  }

  const proj = project as Record<string, unknown>;
  return isValidString(proj.id) && isValidString(proj.name);
}

// Type guard untuk MCP client configuration
function isValidMcpClient(mcpClient: unknown): mcpClient is { token: string; serverURL: string } {
  if (!mcpClient || typeof mcpClient !== 'object') {
    return false;
  }

  const client = mcpClient as Record<string, unknown>;
  return isValidString(client.token) && isValidURL(client.serverURL);
}

// Type guard untuk complete configuration
function isValidConfig(config: unknown): config is Config {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const cfg = config as Record<string, unknown>;

  // Validate project jika ada
  if (cfg.project !== undefined && !isValidProject(cfg.project)) {
    return false;
  }

  // Validate mcpClient jika ada
  if (cfg.mcpClient !== undefined && !isValidMcpClient(cfg.mcpClient)) {
    return false;
  }

  return true;
}

/**
 * Simple MCP client for testing
 */
export class SimpleMcpClient {
  private config: Config | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from gassapi.json dengan type guards
   */
  private loadConfig(): void {
    try {
      // fs and path already imported above

      // Look for gassapi.json in current and parent directories
      let currentDir = process.cwd();
      const rootDir = path.parse(currentDir).root;

      while (currentDir !== rootDir) {
        const configPath = path.join(currentDir, 'gassapi.json');

        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf-8');

          try {
            const parsedConfig = JSON.parse(content);

            // Validasi dengan type guard
            if (!isValidConfig(parsedConfig)) {
              logger.error('Konfigurasi tidak valid', { configPath }, 'SimpleMcpClient');

              // Berikan feedback spesifik tentang kesalahan
              const cfg = parsedConfig as Record<string, unknown>;

              if (cfg.project && !isValidProject(cfg.project)) {
                logger.error('Project validation failed', {
                  issue: 'pastikan ada id dan name (string tidak kosong)'
                }, 'SimpleMcpClient');
              }

              if (cfg.mcpClient && !isValidMcpClient(cfg.mcpClient)) {
                logger.error('MCP Client validation failed', {
                  issue: 'pastikan ada token (string) dan serverURL (URL valid)'
                }, 'SimpleMcpClient');
              }

              return;
            }

            this.config = parsedConfig;

            logger.info('Konfigurasi berhasil dimuat', {
              configPath,
              project: this.config?.project?.name || 'N/A',
              server: this.config?.mcpClient?.serverURL || 'N/A'
            }, 'SimpleMcpClient');

            return;

          } catch (parseError) {
            logger.error('Gagal parsing JSON', {
              configPath,
              error: parseError instanceof Error ? parseError.message : 'Unknown error'
            }, 'SimpleMcpClient');
            return;
          }
        }

        // Move up to parent directory
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached root
        currentDir = parentDir;
      }

      logger.warn('Tidak ada gassapi.json ditemukan di direktori induk', {}, 'SimpleMcpClient');

    } catch (error) {
      logger.error('Gagal memuat konfigurasi', {
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'SimpleMcpClient');
    }
  }

  /**
   * Test basic functionality dengan validasi tambahan
   */
  async testBasicFunctionality(): Promise<void> {
    logger.info('Testing basic functionality...', {}, 'SimpleMcpClient');

    if (!this.config) {
      logger.error('Tidak ada konfigurasi yang dimuat', {}, 'SimpleMcpClient');
      return;
    }

    // Test configuration values dengan type guards
    logger.info('Konfigurasi dimuat', {}, 'SimpleMcpClient');

    if (this.config.project) {
      logger.debug('Project configuration', {
        name: this.config.project.name,
        id: this.config.project.id
      }, 'SimpleMcpClient');
    } else {
      logger.warn('Project tidak dikonfigurasi', {}, 'SimpleMcpClient');
    }

    if (this.config.mcpClient) {
      logger.debug('MCP Client configuration', {
        server: this.config.mcpClient.serverURL,
        token: '***' + this.config.mcpClient.token.slice(-4)
      }, 'SimpleMcpClient');

      // Validasi URL sebelum membuat request
      if (!isValidURL(this.config.mcpClient.serverURL)) {
        logger.error('Server URL tidak valid', {
          serverURL: this.config.mcpClient.serverURL
        }, 'SimpleMcpClient');
        return;
      }
    } else {
      logger.warn('MCP Client tidak dikonfigurasi', {}, 'SimpleMcpClient');
    }

    // Test basic HTTP request jika server URL valid
    if (this.config?.mcpClient?.serverURL && isValidURL(this.config.mcpClient.serverURL)) {
      try {
        logger.info('Testing HTTP request', {
          serverURL: this.config.mcpClient.serverURL
        }, 'SimpleMcpClient');

        const startTime = Date.now();

        // Gunakan node-fetch untuk HTTP client yang lebih baik
        const response = await fetch(this.config.mcpClient.serverURL + '/health', {
          method: 'GET',
          headers: {
            'User-Agent': 'gassapi-mcp-client/1.0.0',
            'Content-Type': 'application/json'
          }
        });

        const responseTime = Date.now() - startTime;
        const status = response.ok ? '✅ Success' : '❌ Failed';

        logger.cli(`  ${status} - ${response.status}`);
        logger.cli(`  Response Time: ${responseTime}ms`);

        if (response.ok) {
          try {
            const data = await response.json();
            logger.cli('  Server Response:', 'info');
            logger.cli(JSON.stringify(data, null, 2), 'info');
          } catch (e) {
            logger.cli(`  Response: Tidak bisa parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`, 'warning');
          }
        } else {
          logger.cli(`  Error: ${response.statusText || 'Unknown error'}`, 'error');
        }

      } catch (error) {
        logger.cli(`  ❌ Request gagal: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    } else if (this.config?.mcpClient?.serverURL) {
      logger.cli('⚠️ Server URL tidak valid, tidak bisa testing request', 'warning');
    } else {
      logger.cli('⚠️ Tidak ada server URL yang dikonfigurasi', 'warning');
    }

    logger.cli('✅ Basic functionality test selesai', 'success');
  }

  /**
   * Show status dengan validasi
   */
  showStatus(): void {
    logger.cli('📊 Status Simple MCP Client');
    logger.cli('='.repeat(40));

    if (this.config) {
      logger.cli('✅ Konfigurasi: Dimuat', 'success');

      if (this.config.project) {
        logger.cli(`  Project: ${this.config.project.name} (ID: ${this.config.project.id})`);
      } else {
        logger.cli('  Project: Tidak dikonfigurasi', 'warning');
      }

      if (this.config.mcpClient) {
        logger.cli(`  Server: ${this.config.mcpClient.serverURL}`);
        logger.cli(`  Token: ${isValidString(this.config.mcpClient.token) ? 'Tersedia' : 'Invalid'}`);

        // Validasi tambahan
        if (!isValidURL(this.config.mcpClient.serverURL)) {
          logger.cli('  ⚠️ Server URL tidak valid', 'warning');
        }
      } else {
        logger.cli('  Server: Tidak dikonfigurasi', 'warning');
        logger.cli('  Token: Tidak ada', 'warning');
      }
    } else {
      logger.cli('❌ Konfigurasi: Tidak ditemukan', 'error');
      logger.cli('  gassapi.json: Hilang atau tidak valid', 'error');
    }

    logger.cli('='.repeat(40));
  }

  /**
   * Create sample configuration dengan validasi struktur
   */
  createSampleConfig(): void {
    // fs and path already imported above

    const sampleConfig = {
      project: {
        id: 'proj_sample_123',
        name: 'Sample GASSAPI Project',
        description: 'Sample project for testing MCP client'
      },
      mcpClient: {
        token: 'YOUR_MCP_TOKEN_HERE',
        serverURL: 'http://localhost:3000'
      }
    };

    const configPath = path.join(process.cwd(), 'gassapi.json');

    try {
      // Validasi config sebelum ditulis
      if (!isValidConfig(sampleConfig)) {
        logger.error('Internal error: sample config tidak valid', {}, 'SimpleMcpClient');
        return;
      }

      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8');
      logger.cli('✅ Sample configuration dibuat:', 'success');
      logger.cli(`📝 ${configPath}`, 'info');
      logger.cli('Silakan edit file dan:', 'info');
      logger.cli('  1. Ganti YOUR_MCP_TOKEN_HERE dengan token MCP asli kamu', 'info');
      logger.cli('  2. Update detail project', 'info');
      logger.cli('  3. Konfigurasi server URL', 'info');
    } catch (error) {
      logger.error('Gagal membuat sample configuration', {
        error: error instanceof Error ? error.message : 'Unknown error',
        configPath
      }, 'SimpleMcpClient');
    }
  }

  /**
   * Get config dengan type guard
   */
  getConfig(): Config | null {
    return this.config;
  }

  /**
   * Cek apakah konfigurasi valid
   */
  isConfigValid(): boolean {
    return this.config !== null && isValidConfig(this.config);
  }

  /**
   * Validasi ulang konfigurasi
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    if (!this.config) {
      return {
        isValid: false,
        errors: ['Tidak ada konfigurasi yang dimuat']
      };
    }

    const errors: string[] = [];

    if (this.config.project && !isValidProject(this.config.project)) {
      errors.push('Project tidak valid: pastikan ada id dan name (string tidak kosong)');
    }

    if (this.config.mcpClient && !isValidMcpClient(this.config.mcpClient)) {
      errors.push('MCP Client tidak valid: pastikan ada token (string) dan serverURL (URL valid)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export untuk simple testing tanpa MCP server penuh
// SimpleMcpClient sudah diexport di deklarasi class