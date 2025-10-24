#!/usr/bin/env node

/**
 * GASSAPI MCP Client Entry Point
 * Titik awal aplikasi MCP Client
 */

import { GassapiMcpServer } from './server/McpServer.js';
import { config } from './config.js';
import { logger } from './utils/Logger.js';
import * as readlineSync from 'readline-sync';

/**
 * Main MCP Client Application
 * Aplikasi utama untuk mengelola MCP Client
 */
class GassapiMcpClient {
  private server: GassapiMcpServer;

  constructor() {
    this.server = new GassapiMcpServer();
  }

  /**
   * Initialize MCP client
   * Inisialisasi client dan validasi konfigurasi
   */
  async initialize(): Promise<void> {
    try {
      // Ganti console.log dengan logger yang proper biar lebih rapih
      logger.cli('Initializing GASSAPI MCP Client v1.0.0', 'info');

      // Load project configuration
      await config.loadProjectConfig();

      if (config.hasProjectConfig()) {
        logger.cli('Project configuration loaded', 'success');
        logger.cli(`Project: ${config.getProjectName()}`, 'info');
        logger.cli(`ID: ${config.getProjectId()}`, 'info');
        logger.cli(`Server: ${config.getServerURL()}`, 'info');
        logger.cli(`Environment: ${config.getActiveEnvironment()}`, 'info');
      } else {
        logger.cli('No project configuration found', 'warning');
        logger.cli('Create gassapi.json in your project root', 'info');
        logger.cli('Use "gassapi-mcp init" to create sample configuration', 'info');
      }

      // Validate configuration if available
      if (config.hasProjectConfig()) {
        const validation = await config.validateConfiguration();
        if (!validation.isValid) {
          logger.cli('Configuration validation failed:', 'error');
          validation.errors.forEach(error => logger.cli(`  - ${error}`, 'error'));
          if (validation.warnings.length > 0) {
            logger.cli('Warnings:', 'warning');
            validation.warnings.forEach(warning => logger.cli(`  - ${warning}`, 'warning'));
          }
        } else {
          logger.cli('Configuration is valid', 'success');
          if (validation.warnings.length > 0) {
            logger.cli('Warnings:', 'warning');
            validation.warnings.forEach(warning => logger.cli(`  - ${warning}`, 'warning'));
          }
        }
      }

    } catch (error) {
      logger.error('Initialization failed', {
        error: error instanceof Error ? error.message : String(error)
      }, 'GassapiMcpClient');
      throw error;
    }
  }

  /**
   * Start MCP server
   * Menjalankan MCP server
   */
  async start(): Promise<void> {
    try {
      await this.initialize();
      await this.server.start();
    } catch (error) {
      // Pake logger.error biar error loggingnya lebih konsisten
      logger.error('Failed to start MCP server', {
        error: error instanceof Error ? error.message : String(error)
      }, 'GassapiMcpClient');
      process.exit(1);
    }
  }

  /**
   * Handle graceful shutdown
   * Menangani shutdown dengan aman
   */
  async shutdown(): Promise<void> {
    try {
      // Logger buat shutdown biar lebih terstruktur
      logger.cli('Shutting down GASSAPI MCP Client...', 'info');
      await this.server.shutdown();
      logger.cli('MCP server shut down gracefully', 'success');
    } catch (error) {
      logger.error('Error during shutdown', {
        error: error instanceof Error ? error.message : String(error)
      }, 'GassapiMcpClient');
    }
  }

  /**
   * Get client status
   * Menampilkan status client
   */
  async status(): Promise<void> {
    try {
      // Status info dengan logger yang lebih terorganisir
      logger.cli('GASSAPI MCP Client Status', 'info');
      logger.info('='.repeat(40), {}, 'status');

      // Configuration status
      if (config.hasProjectConfig()) {
        logger.cli('Configuration: ✅ Loaded', 'success');
        logger.cli(`  Project: ${config.getProjectName()} (${config.getProjectId()})`, 'info');
        logger.cli(`  Environment: ${config.getActiveEnvironment()}`, 'info');
        logger.cli(`  Variables: ${Object.keys(config.getEnvironmentVariables()).length} configured`, 'info');
      } else {
        logger.cli('Configuration: ❌ Not found', 'error');
        logger.cli('  gassapi.json: Missing in project directory', 'warning');
      }

      // Server status
      const serverStatus = await this.server.healthCheck();
      logger.cli(`Server Status: ${serverStatus.status.toUpperCase()}`,
                  serverStatus.status === 'ok' ? 'success' : 'error');
      if (serverStatus.status === 'ok') {
        logger.cli(`  Timestamp: ${new Date(serverStatus.timestamp).toISOString()}`, 'info');
      } else {
        logger.cli(`  Error: ${serverStatus.error || 'Unknown error'}`, 'error');
      }

      logger.info('='.repeat(40), {}, 'status');

    } catch (error) {
      logger.error('Failed to get status', {
        error: error instanceof Error ? error.message : String(error)
      }, 'GassapiMcpClient');
      process.exit(1);
    }
  }

  /**
   * Create sample configuration
   * Membuat file konfigurasi contoh
   */
  async init(projectName?: string, projectId?: string): Promise<void> {
    try {
      // Buat konfigurasi sample dengan logging yang jelas
      logger.cli('Creating GASSAPI sample configuration...', 'info');

      const name = projectName || readlineSync.question('Enter project name:') || 'My GASSAPI Project';
      const id = projectId || readlineSync.question('Enter project ID:') || 'proj_' + Date.now();

      await config.createSampleConfig(name, id);

      logger.cli('Sample configuration created successfully!', 'success');
      logger.cli('File: ./gassapi.json', 'info');
      logger.cli('Next steps:', 'info');
      logger.cli('  1. Edit gassapi.json with your actual project details', 'info');
      logger.cli('  2. Replace YOUR_MCP_TOKEN_HERE with your actual MCP token', 'warning');
      logger.cli('  3. Configure your environment variables', 'info');
      logger.cli('  4. Start MCP client: gassapi-mcp', 'info');

    } catch (error) {
      logger.error('Failed to create sample configuration', {
        error: error instanceof Error ? error.message : String(error)
      }, 'GassapiMcpClient');
      process.exit(1);
    }
  }

  /**
   * Show help information
   * Menampilkan informasi bantuan
   */
  help(): void {
    // Gunakan logger.cli untuk output CLI yang konsisten
    const helpContent = [
      '🚀 GASSAPI MCP Client v1.0.0',
      '',
      'USAGE:',
      '  gassapi-mcp [command] [options]',
      '',
      'COMMANDS:',
      '  start       Start MCP server (default)',
      '  init        Create sample gassapi.json',
      '  status      Show configuration and server status',
      '  help        Show this help message',
      '  version     Show version information',
      '',
      'OPTIONS:',
      '  --debug     Enable debug logging',
      '  --config     Path to gassapi.json (default: auto-detect)',
      '  --port       Override server port',
      '',
      'EXAMPLES:',
      '  gassapi-mcp start                    # Start with auto-detected config',
      '  gassapi-mcp start --config ./config.json # Start with specific config',
      '  gassapi-mcp init "My API Project"     # Create sample config',
      '  gassapi-mcp status                    # Show current status',
      '',
      'DOCUMENTATION:',
      '  📖 README.md - Complete documentation',
      '  🔧 MCP Tools - Available tools and usage',
      '  ⚙️ Configuration - Configuration options',
      '',
      'SUPPORT:',
      '  🐛 Issues: https://github.com/gassapi/mcp-client/issues',
      '  📚 Docs: https://docs.gassapi.com/mcp-client',
      '  💬 Discord: https://discord.gg/gassapi'
    ];

    helpContent.forEach(line => logger.cli(line));

    // Log ke file juga pake logger
    logger.info('Help command executed', {}, 'GassapiMcpClient');
  }

  /**
   * Show version information
   * Menampilkan informasi versi
   */
  version(): void {
    // Gunakan logger.cli untuk output CLI yang konsisten
    logger.cli('🚀 GASSAPI MCP Client v1.0.0');
    logger.cli(`📅 Built: ${new Date().toISOString().split('T')[0]}`);
    logger.cli('🔗 Repository: https://github.com/gassapi/mcp-client');
    logger.cli('');
    logger.cli('License: MIT');
    logger.cli('Author: GASSAPI Team');

    // Log ke file juga pake logger
    logger.info('Version command executed', {}, 'GassapiMcpClient');
  }

  /**
   * Parse command line arguments
   * Parsing argumen command line
   */
  parseArguments(args: string[]): {
    command: string;
    options: Record<string, string>;
  } {
    const options: Record<string, string> = {};
    let command = 'start'; // default command

    // Parse arguments
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith('--')) {
        // Parse option
        const [key, value] = arg.substring(2).split('=');
        options[key] = value || 'true';
      } else if (!arg.includes('-')) {
        // Parse command
        command = arg;
      }
    }

    // Log parsing argumen buat debugging
    logger.debug('Arguments parsed', { command, options }, 'GassapiMcpClient');
    return { command, options };
  }
}

// Main execution function
// Fungsi utama untuk eksekusi
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const client = new GassapiMcpClient();

  if (args.length === 0) {
    // Default: start MCP server
    await client.start();
    return;
  }

  const { command, options } = client.parseArguments(args);

  switch (command) {
    case 'start':
      logger.cli('Starting GASSAPI MCP Server...', 'info');
      await client.start();
      break;

    case 'init': {
      const projectName = args[1];
      const projectId = options.project;
      await client.init(projectName, projectId);
      break;
    }

    case 'status':
      await client.status();
      break;

    case 'help':
    case '--help':
    case '-h':
      client.help();
      break;

    case 'version':
    case '--version':
    case '-v':
      client.version();
      break;

    default:
      logger.error(`Unknown command: ${command}`, { command }, 'main');
      logger.cli('Use "gassapi-mcp help" for usage information', 'error');
      process.exit(1);
  }
}

// Handle process signals for graceful shutdown
// Menangani sinyal proses untuk shutdown yang aman
process.on('SIGINT', async () => {
  logger.warn('Received SIGINT, shutting down gracefully...', {}, 'Process');
  const client = new GassapiMcpClient();
  await client.shutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.warn('Received SIGTERM, shutting down gracefully...', {}, 'Process');
  const client = new GassapiMcpClient();
  await client.shutdown();
  process.exit(0);
});

// Handle uncaught exceptions
// Menangani exception yang tidak ter-catch
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  }, 'Process');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection', {
    reason: String(reason),
    promise: promise.toString()
  }, 'Process');
  process.exit(1);
});

// Export for external usage
export { GassapiMcpClient, GassapiMcpServer, config };

// Run if called directly
// Jalankan jika dipanggil langsung
if (import.meta.url === `file://${process.argv[1]}`) {
  console.error('DEBUG: Starting GASSAPI MCP Server...');
  main().catch(error => {
    logger.error('Fatal error in main', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Main');
    console.error('DEBUG: Fatal error:', error);
    process.exit(1);
  });
}