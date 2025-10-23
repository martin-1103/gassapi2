"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const CacheManager_1 = require("../cache/CacheManager");
/**
 * GASSAPI Configuration Loader
 * Auto-detects and parses gassapi.json configuration files
 */
class ConfigLoader {
    cacheManager;
    configCache = new Map();
    constructor() {
        this.cacheManager = new CacheManager_1.CacheManager();
    }
    /**
     * Auto-detect gassapi.json file by scanning parent directories
     */
    async detectProjectConfig() {
        const currentDir = process.cwd();
        // Scan parent directories for gassapi.json
        return this.scanForConfig(currentDir);
    }
    /**
     * Scan for gassapi.json in current and parent directories
     */
    async scanForConfig(startDir) {
        let currentDir = path.resolve(startDir);
        const rootDir = path.parse(currentDir).root;
        while (currentDir !== rootDir && currentDir !== path.dirname(rootDir)) {
            const configPath = path.join(currentDir, 'gassapi.json');
            if (await this.fileExists(configPath)) {
                try {
                    const config = await this.loadConfig(configPath);
                    console.log(`Found GASSAPI config at: ${configPath}`);
                    return config;
                }
                catch (error) {
                    console.warn(`Invalid config file at ${configPath}:`, error.message);
                }
            }
            // Move up to parent directory
            const parentDir = path.dirname(currentDir);
            if (parentDir === currentDir)
                break; // Reached root
            currentDir = parentDir;
        }
        return null;
    }
    /**
     * Load specific gassapi.json configuration file
     */
    async loadConfig(configPath) {
        // Check cache first
        const cachedConfig = await this.cacheManager.getCachedProjectConfig(configPath);
        if (cachedConfig) {
            return cachedConfig;
        }
        // Load from file
        if (!await this.fileExists(configPath)) {
            throw new Error(`Configuration file not found: ${configPath}`);
        }
        try {
            const content = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(content);
            // Validate configuration structure
            this.validateConfig(config);
            // Cache the valid configuration
            await this.cacheManager.cacheProjectConfig(configPath, config);
            return config;
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error(`Invalid JSON in ${configPath}: ${error.message}`);
            }
            else if (error instanceof Error) {
                throw new Error(`Failed to load ${configPath}: ${error.message}`);
            }
            throw error;
        }
    }
    /**
     * Validate GASSAPI configuration structure
     */
    validateConfig(config) {
        // Required fields validation
        if (!config.project || typeof config.project !== 'object') {
            throw new Error('Missing or invalid project configuration');
        }
        if (!config.project.id || typeof config.project.id !== 'string') {
            throw new Error('Missing or invalid project.id');
        }
        if (!config.project.name || typeof config.project.name !== 'string') {
            throw new Error('Missing or invalid project.name');
        }
        if (!config.mcpClient || typeof config.mcpClient !== 'object') {
            throw new Error('Missing or invalid mcpClient configuration');
        }
        if (!config.mcpClient.token || typeof config.mcpClient.token !== 'string') {
            throw new Error('Missing or invalid mcpClient.token');
        }
        if (!config.mcpClient.serverURL || typeof config.mcpClient.serverURL !== 'string') {
            throw new Error('Missing or invalid mcpClient.serverURL');
        }
        // Optional fields validation
        if (config.environment && typeof config.environment !== 'object') {
            if (config.environment.active && typeof config.environment.active !== 'string') {
                throw new Error('Invalid environment.active (must be string)');
            }
            if (config.environment.variables && typeof config.environment.variables !== 'object') {
                throw new Error('Invalid environment.variables (must be object)');
            }
        }
        // API configuration validation
        if (config.api && typeof config.api === 'object') {
            if (config.api.baseURL && typeof config.api.baseURL !== 'string') {
                throw new Error('Invalid api.baseURL (must be string)');
            }
            if (config.api.port && typeof config.api.port !== 'number') {
                throw new Error('Invalid api.port (must be number)');
            }
            if (config.api.paths && !Array.isArray(config.api.paths)) {
                throw new Error('Invalid api.paths (must be array)');
            }
        }
        // Discovery configuration validation
        if (config.discovery && typeof config.discovery === 'object') {
            if (config.discovery.autoScan && typeof config.discovery.autoScan !== 'boolean') {
                throw new Error('Invalid discovery.autoScan (must be boolean)');
            }
            if (config.discovery.ports && !Array.isArray(config.discovery.ports)) {
                throw new Error('Invalid discovery.ports (must be array)');
            }
        }
        // Validate token format
        if (config.mcpClient.token.length < 10) {
            throw new Error('mcpClient.token seems too short (minimum 10 characters)');
        }
        // Validate server URL
        try {
            new URL(config.mcpClient.serverURL);
        }
        catch {
            throw new Error('mcpClient.serverURL is not a valid URL');
        }
    }
    /**
     * Get default configuration template
     */
    static getDefaultConfig() {
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
     * Create sample configuration file
     */
    static async createSampleConfig(projectDir, projectId, projectName) {
        const config = {
            project: {
                id: projectId,
                name: projectName,
                description: `GASSAPI project: ${projectName}`
            },
            mcpClient: {
                token: 'YOUR_MCP_TOKEN_HERE',
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
        console.log(`Sample configuration created: ${configPath}`);
        console.log('Please update the mcpClient.token with your actual MCP token');
    }
    /**
     * Reload configuration (clear cache and reload)
     */
    async reloadConfig(configPath) {
        // Clear cache for this config
        await this.cacheManager.clearProjectCache('all');
        // Clear the in-memory cache for this specific config
        this.configCache.delete(configPath);
        // Load fresh configuration
        return this.loadConfig(configPath);
    }
    /**
     * Get configuration with caching
     */
    async getCachedConfig(configPath) {
        // Check in-memory cache first
        if (this.configCache.has(configPath)) {
            return this.configCache.get(configPath);
        }
        // Load from file system
        try {
            const config = await this.loadConfig(configPath);
            // Cache in memory for faster subsequent access
            this.configCache.set(configPath, config);
            return config;
        }
        catch (error) {
            console.warn(`Failed to load config ${configPath}:`, error.message);
            return null;
        }
    }
    /**
     * Clear all configuration caches
     */
    clearCache() {
        this.configCache.clear();
    }
    /**
     * Validate configuration file exists
     */
    async configExists(configPath) {
        const path = configPath || path.join(process.cwd(), 'gassapi.json');
        return this.fileExists(path);
    }
    /**
     * Get project directory from configuration
     */
    async getProjectDirectory(configPath) {
        const path = configPath || await this.detectProjectConfig();
        if (!path)
            return null;
        return path.dirname(configPath || path);
    }
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Normalize environment variables
     */
    normalizeEnvironmentVariables(variables) {
        const normalized = {};
        for (const [key, value] of Object.entries(variables)) {
            if (value === null || value === undefined) {
                continue;
            }
            normalized[key] = String(value);
        }
        return normalized;
    }
    /**
     * Extract environment variables for a specific environment
     */
    extractEnvironmentVariables(config, environmentName) {
        const targetEnv = environmentName || config.environment?.active || 'development';
        const variables = { ...config.environment?.variables };
        // Override with environment-specific variables if they exist
        if (config.environment?.variables) {
            Object.assign(variables, config.environment.variables);
        }
        return this.normalizeEnvironmentVariables(variables);
    }
    /**
     * Get active environment name
     */
    getActiveEnvironment(config) {
        return config.environment?.active || 'development';
    }
    /**
     * Get project information
     */
    getProjectInfo(config) {
        return {
            id: config.project.id,
            name: config.project.name,
            description: config.project.description
        };
    }
    /**
     * Get server URL
     */
    getServerURL(config) {
        return config.mcpClient.serverURL;
    }
    /**
     * Get MCP token
     */
    getMcpToken(config) {
        return config.mcpClient.token;
    }
    /**
     * Get API base URL
     */
    getApiBaseUrl(config) {
        return config.api?.baseURL || config.mcpClient.serverURL;
    }
    /**
     * Get discovery ports
     */
    getDiscoveryPorts(config) {
        return config.discovery?.ports || [3000, 8000, 8080, 5000];
    }
    /**
     * Should auto-scan for APIs
     */
    shouldAutoScan(config) {
        return config.discovery?.autoScan !== false; // Default to true
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=ConfigLoader.js.map