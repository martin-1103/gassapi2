/**
 * MCP Session Management System
 * Handles persistent state across multiple MCP tool calls
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';

export interface SessionState {
  // Authentication state
  jwtToken?: string;

  // Environment variables
  environment: Record<string, string>;

  // Flow inputs
  flowInputs: Record<string, any>;

  // Step execution outputs
  stepOutputs: Record<string, any>;

  // Runtime variables
  runtimeVars: Record<string, any>;

  // Configuration
  config: Record<string, any>;

  // Session metadata
  sessionId: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface McpResponse {
  success: boolean;
  data?: any;
  error?: string;
  content?: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
}

/**
 * MCP Session Class
 * Manages persistent MCP server connection and state
 */
export class McpSession extends EventEmitter {
  private serverProcess: ChildProcess | null = null;
  private state: SessionState;
  private initialized = false;
  private requestId = 1;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor() {
    super();

    this.state = {
      environment: {},
      flowInputs: {},
      stepOutputs: {},
      runtimeVars: {},
      config: {
        timeout: 30000,
        retryCount: 1,
        debugMode: false
      },
      sessionId: this.generateSessionId(),
      createdAt: new Date(),
      lastActivity: new Date()
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize MCP server connection
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      throw new Error('Session already initialized');
    }

    console.error(`[McpSession] Initializing session ${this.state.sessionId}`);

    return new Promise((resolve, reject) => {
      this.serverProcess = spawn('node', ['dist/index.js'], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let stdout = '';
      let stderr = '';

      const timeout = setTimeout(() => {
        this.cleanup();
        reject(new Error('Session initialization timeout'));
      }, 10000);

      this.serverProcess?.stdout?.on('data', (data) => {
        stdout += data.toString();
        this.processResponse(stdout);
      });

      this.serverProcess?.stderr?.on('data', (data) => {
        stderr += data.toString();
        console.error('[McpSession Server]', data.toString().trim());

        // Check for server ready signal - wait specifically for tools registration
        if (stderr.includes('MCP Server connected and ready')) {
          // First signal received, but wait for tools registration
          console.error(`[McpSession] Server ready, waiting for tool registration...`);
          // Set a fallback timeout to initialize after 2 seconds if tools don't register
          setTimeout(() => {
            if (!this.initialized) {
              clearTimeout(timeout);
              this.initialized = true;
              console.error(`[McpSession] Session ${this.state.sessionId} initialized with fallback timeout`);
              resolve();
            }
          }, 2000);
        } else if (stderr.includes('Registered') &&
                   (stderr.includes('tools') || stderr.includes('tool'))) {
          clearTimeout(timeout);
          this.initialized = true;
          console.error(`[McpSession] Session ${this.state.sessionId} initialized successfully with tools registered`);
          resolve();
        }
      });

      this.serverProcess?.on('close', (code) => {
        clearTimeout(timeout);
        if (code !== 0 && !this.initialized) {
          reject(new Error(`MCP server exited with code ${code}`));
        }
      });

      this.serverProcess?.on('error', (error) => {
        clearTimeout(timeout);
        reject(new Error(`Failed to start MCP server: ${error.message}`));
      });

      // Send initialization request
      const initRequest = {
        jsonrpc: "2.0",
        id: this.requestId++,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "mcp-session-client",
            version: "1.0.0"
          }
        }
      };

      this.sendRequest(initRequest);
    });
  }

  /**
   * Process server response
   */
  private processResponse(stdout: string): void {
    const lines = stdout.trim().split('\n');
    const lastLine = lines[lines.length - 1];

    if (!lastLine) return;

    try {
      const response = JSON.parse(lastLine);

      if (response.id && this.pendingRequests.has(response.id)) {
        const { resolve, reject, timeout } = this.pendingRequests.get(response.id)!;
        clearTimeout(timeout);
        this.pendingRequests.delete(response.id);

        if (response.error) {
          reject(new Error(response.error.message || 'Unknown MCP error'));
        } else if (response.result && response.result.content) {
          resolve(response.result.content[0]?.text || 'No content');
        } else {
          resolve('Response received');
        }
      }
    } catch (error) {
      console.error('[McpSession] Failed to parse response:', error);
    }
  }

  /**
   * Send request to MCP server
   */
  private sendRequest(request: any): void {
    if (!this.serverProcess) {
      throw new Error('MCP server not initialized');
    }

    const requestJson = JSON.stringify(request) + '\n';
    if (this.serverProcess?.stdin?.writable) {
      this.serverProcess.stdin.write(requestJson);
    } else {
      throw new Error('MCP server process not available for writing');
    }
  }

  /**
   * Call MCP tool with state injection
   */
  async call(toolName: string, args: Record<string, any> = {}): Promise<string> {
    if (!this.initialized) {
      throw new Error('Session not initialized. Call initialize() first.');
    }

    // Update last activity
    this.state.lastActivity = new Date();

    // Inject session state into arguments
    const enhancedArgs = {
      ...args,
      __sessionState: this.getState()
    };

    console.error(`[McpSession] Calling ${toolName} with args:`,
      Object.keys(args).length > 0 ? Object.keys(args) : 'no args');

    return new Promise((resolve, reject) => {
      const requestId = this.requestId++;

      const request = {
        jsonrpc: "2.0",
        id: requestId,
        method: "tools/call",
        params: {
          name: toolName,
          arguments: enhancedArgs
        }
      };

      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Tool call timeout: ${toolName}`));
      }, this.state.config.timeout || 30000);

      this.pendingRequests.set(requestId, { resolve, reject, timeout });

      try {
        this.sendRequest(request);
      } catch (error) {
        clearTimeout(timeout);
        this.pendingRequests.delete(requestId);
        reject(error);
      }
    });
  }

  /**
   * Set environment variables
   */
  setEnvironment(variables: Record<string, string>): void {
    this.state.environment = { ...this.state.environment, ...variables };
    console.error(`[McpSession] Set ${Object.keys(variables).length} environment variables`);
  }

  /**
   * Set flow inputs
   */
  setFlowInputs(inputs: Record<string, any>): void {
    this.state.flowInputs = { ...this.state.flowInputs, ...inputs };
    console.error(`[McpSession] Set ${Object.keys(inputs).length} flow inputs`);
  }

  /**
   * Set step output
   */
  setStepOutput(stepId: string, outputs: Record<string, any>): void {
    this.state.stepOutputs[stepId] = { ...this.state.stepOutputs[stepId], ...outputs };
    console.error(`[McpSession] Set ${Object.keys(outputs).length} outputs for step ${stepId}`);
  }

  /**
   * Set runtime variables
   */
  setRuntimeVar(name: string, value: any): void {
    this.state.runtimeVars[name] = value;
    console.error(`[McpSession] Set runtime variable ${name}`);
  }

  /**
   * Set configuration
   */
  setConfig(config: Record<string, any>): void {
    this.state.config = { ...this.state.config, ...config };
    console.error(`[McpSession] Updated configuration`);
  }

  /**
   * Get complete session state
   */
  getState(): SessionState {
    return { ...this.state };
  }

  /**
   * Get session info
   */
  getSessionInfo(): {
    sessionId: string;
    createdAt: Date;
    lastActivity: Date;
    uptime: number;
    stateCounts: {
      environment: number;
      flowInputs: number;
      stepOutputs: number;
      runtimeVars: number;
    };
  } {
    return {
      sessionId: this.state.sessionId,
      createdAt: this.state.createdAt,
      lastActivity: this.state.lastActivity,
      uptime: Date.now() - this.state.createdAt.getTime(),
      stateCounts: {
        environment: Object.keys(this.state.environment).length,
        flowInputs: Object.keys(this.state.flowInputs).length,
        stepOutputs: Object.keys(this.state.stepOutputs).length,
        runtimeVars: Object.keys(this.state.runtimeVars).length
      }
    };
  }

  /**
   * Clear specific state type
   */
  clearState(stateType: 'environment' | 'flowInputs' | 'stepOutputs' | 'runtimeVars'): void {
    switch (stateType) {
      case 'environment':
        this.state.environment = {};
        break;
      case 'flowInputs':
        this.state.flowInputs = {};
        break;
      case 'stepOutputs':
        this.state.stepOutputs = {};
        break;
      case 'runtimeVars':
        this.state.runtimeVars = {};
        break;
    }
    console.error(`[McpSession] Cleared ${stateType} state`);
  }

  /**
   * Reset all state
   */
  resetState(): void {
    this.state.environment = {};
    this.state.flowInputs = {};
    this.state.stepOutputs = {};
    this.state.runtimeVars = {};
    this.state.lastActivity = new Date();
    console.error(`[McpSession] Reset all state`);
  }

  /**
   * Close session and cleanup
   */
  async close(): Promise<void> {
    console.error(`[McpSession] Closing session ${this.state.sessionId}`);

    // Clear pending requests
    for (const [requestId, { reject, timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
      reject(new Error('Session closed'));
    }
    this.pendingRequests.clear();

    // Kill server process
    if (this.serverProcess) {
      this.serverProcess.kill('SIGTERM');

      // Force kill if it doesn't exit gracefully
      setTimeout(() => {
        if (this.serverProcess && !this.serverProcess.killed) {
          this.serverProcess.kill('SIGKILL');
        }
      }, 5000);
    }

    this.initialized = false;
    this.serverProcess = null;

    console.error(`[McpSession] Session ${this.state.sessionId} closed`);
  }

  /**
   * Force cleanup
   */
  private cleanup(): void {
    for (const [, { timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
    }
    this.pendingRequests.clear();

    if (this.serverProcess) {
      this.serverProcess.kill('SIGKILL');
    }
  }
}