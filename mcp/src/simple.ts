// Simple MCP client for testing
import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

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
              console.error('❌ Konfigurasi tidak valid di:', configPath);

              // Berikan feedback spesifik tentang kesalahan
              const cfg = parsedConfig as Record<string, unknown>;

              if (cfg.project && !isValidProject(cfg.project)) {
                console.error('   💡 Project: pastikan ada id dan name (string tidak kosong)');
              }

              if (cfg.mcpClient && !isValidMcpClient(cfg.mcpClient)) {
                console.error('   💡 MCP Client: pastikan ada token (string) dan serverURL (URL valid)');
              }

              return;
            }

            this.config = parsedConfig;

            console.log('✅ Konfigurasi berhasil dimuat dari:', configPath);
            console.log('📋 Project:', this.config?.project?.name || 'N/A');
            console.log('🔗 Server:', this.config?.mcpClient?.serverURL || 'N/A');

            return;

          } catch (parseError) {
            console.error('❌ Gagal parsing JSON di:', configPath);
            console.error('   💡 Pastikan format JSON valid');
            console.error('   Error:', parseError instanceof Error ? parseError.message : 'Unknown error');
            return;
          }
        }

        // Move up to parent directory
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached root
        currentDir = parentDir;
      }

      console.log('⚠️ Tidak ada gassapi.json ditemukan di direktori induk');
      console.log('💡 Buat gassapi.json di root project kamu');

    } catch (error) {
      console.error('❌ Gagal memuat konfigurasi:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test basic functionality dengan validasi tambahan
   */
  async testBasicFunctionality(): Promise<void> {
    console.log('🧪 Testing basic functionality...');

    if (!this.config) {
      console.log('❌ Tidak ada konfigurasi yang dimuat');
      return;
    }

    // Test configuration values dengan type guards
    console.log('✅ Konfigurasi dimuat:');

    if (this.config.project) {
      console.log('  Project:', this.config.project.name);
      console.log('  Project ID:', this.config.project.id);
    } else {
      console.log('  Project: Tidak dikonfigurasi');
    }

    if (this.config.mcpClient) {
      console.log('  Server:', this.config.mcpClient.serverURL);
      console.log('  Token: ***' + this.config.mcpClient.token.slice(-4));

      // Validasi URL sebelum membuat request
      if (!isValidURL(this.config.mcpClient.serverURL)) {
        console.error('   ❌ Server URL tidak valid:', this.config.mcpClient.serverURL);
        return;
      }
    } else {
      console.log('  Server: Tidak dikonfigurasi');
      console.log('  Token: Tidak dikonfigurasi');
    }

    // Test basic HTTP request jika server URL valid
    if (this.config?.mcpClient?.serverURL && isValidURL(this.config.mcpClient.serverURL)) {
      try {
        console.log('🌐 Testing HTTP request ke:', this.config.mcpClient.serverURL);

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

        console.log(`  ${status} - ${response.status}`);
        console.log(`  Response Time: ${responseTime}ms`);

        if (response.ok) {
          try {
            const data = await response.json();
            console.log('  Server Response:', JSON.stringify(data, null, 2));
          } catch (e) {
            console.log('  Response: Tidak bisa parse JSON:', e instanceof Error ? e.message : 'Unknown error');
          }
        } else {
          console.log(`  Error: ${response.statusText || 'Unknown error'}`);
        }

      } catch (error) {
        console.log(`  ❌ Request gagal: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (this.config?.mcpClient?.serverURL) {
      console.log('⚠️ Server URL tidak valid, tidak bisa testing request');
    } else {
      console.log('⚠️ Tidak ada server URL yang dikonfigurasi');
    }

    console.log('✅ Basic functionality test selesai');
  }

  /**
   * Show status dengan validasi
   */
  showStatus(): void {
    console.log('📊 Status Simple MCP Client');
    console.log('='.repeat(40));

    if (this.config) {
      console.log('✅ Konfigurasi: Dimuat');

      if (this.config.project) {
        console.log(`  Project: ${this.config.project.name} (ID: ${this.config.project.id})`);
      } else {
        console.log('  Project: Tidak dikonfigurasi');
      }

      if (this.config.mcpClient) {
        console.log(`  Server: ${this.config.mcpClient.serverURL}`);
        console.log(`  Token: ${isValidString(this.config.mcpClient.token) ? 'Tersedia' : 'Invalid'}`);

        // Validasi tambahan
        if (!isValidURL(this.config.mcpClient.serverURL)) {
          console.log('  ⚠️ Server URL tidak valid');
        }
      } else {
        console.log('  Server: Tidak dikonfigurasi');
        console.log('  Token: Tidak ada');
      }
    } else {
      console.log('❌ Konfigurasi: Tidak ditemukan');
      console.log('  gassapi.json: Hilang atau tidak valid');
    }

    console.log('='.repeat(40));
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
        console.error('❌ Internal error: sample config tidak valid');
        return;
      }

      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8');
      console.log('✅ Sample configuration dibuat:', configPath);
      console.log('📝 Silakan edit file dan:');
      console.log('  1. Ganti YOUR_MCP_TOKEN_HERE dengan token MCP asli kamu');
      console.log('  2. Update detail project');
      console.log('  3. Konfigurasi server URL');
    } catch (error) {
      console.error('❌ Gagal membuat sample configuration:', error instanceof Error ? error.message : 'Unknown error');
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