// Simple MCP client for testing
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

// Use node-fetch for better HTTP client support
const fetch = require('node-fetch').default || require('node-fetch');

/**
 * Simple MCP client for testing
 */
export class SimpleMcpClient {
  private config: Config | null = null;

  constructor() {
    this.loadConfig();
  }

  /**
   * Load configuration from gassapi.json
   */
  private loadConfig(): void {
    try {
      const fs = require('fs');
      const path = require('path');

      // Look for gassapi.json in current and parent directories
      let currentDir = process.cwd();
      const rootDir = path.parse(currentDir).root;

      while (currentDir !== rootDir) {
        const configPath = path.join(currentDir, 'gassapi.json');

        if (fs.existsSync(configPath)) {
          const content = fs.readFileSync(configPath, 'utf-8');
          this.config = JSON.parse(content);

          console.log('✅ Loaded configuration from:', configPath);
          console.log('📋 Project:', this.config.project?.name || 'N/A');
          console.log('🔗 Server:', this.config.mcpClient?.serverURL || 'N/A');

          return;
        }

        // Move up to parent directory
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) break; // Reached root
        currentDir = parentDir;
      }

      console.log('⚠️ No gassapi.json found in parent directories');
      console.log('💡 Create gassapi.json in your project root');

    } catch (error) {
      console.error('❌ Failed to load configuration:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Test basic functionality
   */
  async testBasicFunctionality(): Promise<void> {
    console.log('🧪 Testing basic functionality...');

    if (!this.config) {
      console.log('❌ No configuration loaded');
      return;
    }

    // Test configuration values
    console.log('✅ Configuration loaded:');
    console.log('  Project:', this.config.project?.name || 'N/A');
    console.log('  Server:', this.config.mcpClient?.serverURL || 'N/A');
    console.log('  Token:', this.config.mcpClient?.token ? '***' + this.config.mcpClient.token.slice(-4) : 'N/A');

    // Test basic HTTP request if server URL is provided
    if (this.config?.mcpClient?.serverURL) {
      try {
        console.log('🌐 Testing HTTP request to:', this.config.mcpClient.serverURL);

        const startTime = Date.now();

        // Use node-fetch for better HTTP client support
        const response = await fetch(this.config.mcpClient.serverURL + '/health', {
          method: 'GET',
          headers: {
            'User-Agent': 'gassapi-mcp-client/1.0.0',
            'Content-Type': 'application/json'
          },
          timeout: 5000
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
            console.log('  Response: Unable to parse JSON:', e instanceof Error ? e.message : 'Unknown error');
          }
        } else {
          console.log(`  Error: ${response.statusText || 'Unknown error'}`);
        }

      } catch (error) {
        console.log(`  ❌ Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else {
      console.log('⚠️ No server URL configured');
    }

    console.log('✅ Basic functionality test completed');
  }

  /**
   * Show status
   */
  showStatus(): void {
    console.log('📊 Simple MCP Client Status');
    console.log('='.repeat(40));

    if (this.config) {
      console.log('✅ Configuration: Loaded');
      console.log(`  Project: ${this.config.project?.name || 'N/A'}`);
      console.log(`  Server: ${this.config.mcpClient?.serverURL || 'N/A'}`);
      console.log(`  Token: ${this.config.mcpClient?.token ? 'Configured' : 'Missing'}`);
    } else {
      console.log('❌ Configuration: Not found');
      console.log('  gassapi.json: Missing');
    }

    console.log('='.repeat(40));
  }

  /**
   * Create sample configuration
   */
  createSampleConfig(): void {
    const fs = require('fs');
    const path = require('path');

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
      fs.writeFileSync(configPath, JSON.stringify(sampleConfig, null, 2), 'utf-8');
      console.log('✅ Sample configuration created:', configPath);
      console.log('📝 Please edit to file and:');
      console.log('  1. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token');
      console.log('  2. Update project details');
      console.log('  3. Configure server URL');
    } catch (error) {
      console.error('❌ Failed to create sample configuration:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

// Export for simple testing without full MCP server
// SimpleMcpClient is already exported at class declaration