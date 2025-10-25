/**
 * MCP Test Client
 * Reusable MCP client for testing with proper error handling and response parsing
 */

const { spawn } = require('child_process');
const path = require('path');

class McpTestClient {
  constructor(options = {}) {
    this.serverProcess = null;
    this.isInitialized = false;
    this.requestId = 1;
    this.pendingRequests = new Map();
    this.options = {
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
      debug: options.debug || false
    };
  }

  /**
   * Initialize MCP server connection
   */
  async initialize() {
    return new Promise((resolve, reject) => {
      if (this.isInitialized) {
        resolve(true);
        return;
      }

      this.log('Initializing MCP server...');

      // Use full path to dist/index.js
      const serverPath = path.join(__dirname, '../../dist/index.js');
      this.serverProcess = spawn('node', [serverPath], {
        cwd: path.join(process.cwd(), '..'),
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let initTimeout = setTimeout(() => {
        reject(new Error('MCP server initialization timeout'));
      }, 10000);

      this.serverProcess.on('error', (error) => {
        clearTimeout(initTimeout);
        reject(new Error(`Failed to start MCP server: ${error.message}`));
      });

        this.serverProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        this.log(`Server stderr: ${output}`);

        // Check for successful initialization - wait for tools to be registered
        if (output.includes('GASSAPI MCP Server connected and ready')) {
          // Wait a moment for tools to be registered
          setTimeout(() => {
            clearTimeout(initTimeout);
            this.isInitialized = true;
            this.setupMessageHandling();
            resolve(true);
          }, 1000);
        }
      });

      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        this.log(`Server stdout: ${output}`);
      });

      this.serverProcess.on('close', (code) => {
        clearTimeout(initTimeout);
        if (code !== 0) {
          reject(new Error(`MCP server exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Setup message handling for JSON-RPC communication
   */
  setupMessageHandling() {
    if (!this.serverProcess) return;

    // For JSON-RPC communication, we need to listen to stdout
    // MCP servers typically send JSON-RPC responses to stdout
    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      this.log(`Server stdout: ${output}`);

      try {
        const lines = output.split('\n').filter(line => line.trim());
        for (const line of lines) {
          // Skip non-JSON lines (like log messages)
          if (line.startsWith('{') && line.endsWith('}')) {
            const response = JSON.parse(line);
            this.handleResponse(response);
          }
        }
      } catch (error) {
        this.log(`Failed to parse server response: ${error.message}`);
      }
    });
  }

  /**
   * Handle JSON-RPC response
   */
  handleResponse(response) {
    const { id, result, error } = response;

    if (this.pendingRequests.has(id)) {
      const { resolve, reject, timeout } = this.pendingRequests.get(id);
      this.pendingRequests.delete(id);
      clearTimeout(timeout);

      if (error) {
        reject(new Error(`MCP Error: ${error.message || 'Unknown error'}`));
      } else {
        // Handle tools/list response format
        if (result && result.content && Array.isArray(result.content) && result.content[0]?.type === 'text') {
          try {
            // Try to parse if it's a JSON string inside content
            const contentText = result.content[0].text;
            if (contentText.includes('"tools"')) {
              const parsedContent = JSON.parse(contentText);
              resolve({ tools: parsedContent.tools });
            } else {
              resolve(result);
            }
          } catch (e) {
            resolve(result);
          }
        } else {
          resolve(result);
        }
      }
    }
  }

  /**
   * Call MCP tool with retry logic
   */
  async call(toolName, args = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const requestId = this.requestId++;

    return new Promise((resolve, reject) => {
      // Handle special MCP protocol commands
      let request;
      if (toolName === 'tools/list') {
        request = {
          jsonrpc: "2.0",
          id: requestId,
          method: "tools/list",
          params: {}
        };
      } else {
        request = {
          jsonrpc: "2.0",
          id: requestId,
          method: "tools/call",
          params: {
            name: toolName,
            arguments: args
          }
        };
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout for ${toolName}`));
      }, this.options.timeout);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      const message = JSON.stringify(request) + '\n';
      this.serverProcess.stdin.write(message);

      this.log(`Sent request: ${toolName} with args: ${JSON.stringify(args)}`);
    });
  }

  /**
   * Batch call multiple tools
   */
  async batchCall(calls) {
    const results = [];
    for (const call of calls) {
      try {
        const result = await this.call(call.toolName, call.args);
        results.push({ success: true, result, ...call });
      } catch (error) {
        results.push({ success: false, error: error.message, ...call });
      }
    }
    return results;
  }

  /**
   * Get available tools
   */
  async getAvailableTools() {
    const result = await this.call('tools/list');
    this.log(`Tools list raw response: ${JSON.stringify(result, null, 2)}`);

    // Check different response formats
    if (result && result.content) {
      this.log(`Tools list content: ${JSON.stringify(result.content, null, 2)}`);
    }
    if (result && result.tools) {
      this.log(`Tools list tools: ${JSON.stringify(result.tools, null, 2)}`);
    }

    return result;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const result = await this.call('health_check');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log debug messages
   */
  log(message) {
    if (this.options.debug || process.env.DEBUG === 'true') {
      console.error(`[McpTestClient] ${message}`);
    }
  }

  /**
   * Close connection
   */
  async close() {
    return new Promise((resolve) => {
      if (this.serverProcess) {
        this.serverProcess.on('close', () => {
          this.isInitialized = false;
          resolve();
        });
        this.serverProcess.kill();
      } else {
        resolve();
      }
    });
  }
}

/**
 * Create a test client instance with default options
 */
function createTestClient(options = {}) {
  return new McpTestClient({
    timeout: 30000,
    retries: 3,
    debug: process.env.DEBUG === 'true',
    ...options
  });
}

/**
 * Test helper to run client with auto cleanup
 */
async function withTestClient(options, callback) {
  const client = createTestClient(options);
  try {
    await client.initialize();
    return await callback(client);
  } finally {
    await client.close();
  }
}

module.exports = {
  McpTestClient,
  createTestClient,
  withTestClient
};