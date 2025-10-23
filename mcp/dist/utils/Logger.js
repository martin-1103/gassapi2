"use strict";
/**
 * Logger Utility for MCP Client
 *
 * A centralized logging system that replaces console.log statements
 * with proper logging infrastructure for production readiness.
 */
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
exports.logger = exports.ChildLogger = exports.Logger = exports.LogLevel = void 0;
exports.configureLoggerFromEnv = configureLoggerFromEnv;
exports.initializeLogger = initializeLogger;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Centralized logger class with multiple output formats and log levels
 */
class Logger {
    static instance;
    config;
    logFile;
    constructor(config) {
        this.config = {
            level: LogLevel.INFO,
            enableFileLogging: false,
            enableConsoleLogging: true,
            enableStructuredOutput: false,
            ...config
        };
        if (this.config.enableFileLogging) {
            this.initializeFileLogging();
        }
    }
    /**
     * Get singleton logger instance
     */
    static getInstance(config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    }
    /**
     * Initialize file logging
     */
    initializeFileLogging() {
        try {
            const logDir = this.config.logDirectory || path.join(process.cwd(), 'logs');
            // Create logs directory if it doesn't exist
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const today = new Date().toISOString().split('T')[0];
            this.logFile = path.join(logDir, `gassapi-mcp-${today}.log`);
        }
        catch (error) {
            console.error('Failed to initialize file logging:', error);
            this.config.enableFileLogging = false;
        }
    }
    /**
     * Check if log level should be output
     */
    shouldLog(level) {
        return level >= this.config.level;
    }
    /**
     * Format log message
     */
    formatMessage(entry) {
        if (this.config.enableStructuredOutput) {
            return JSON.stringify(entry);
        }
        const levelName = LogLevel[entry.level];
        const module = entry.module ? `[${entry.module}] ` : '';
        const metadata = entry.metadata ? ` ${JSON.stringify(entry.metadata)}` : '';
        return `${entry.timestamp} ${levelName} ${module}${entry.message}${metadata}`;
    }
    /**
     * Write log entry to outputs
     */
    writeLog(entry) {
        const formattedMessage = this.formatMessage(entry);
        // Console output
        if (this.config.enableConsoleLogging) {
            switch (entry.level) {
                case LogLevel.DEBUG:
                    console.debug(formattedMessage);
                    break;
                case LogLevel.INFO:
                    console.info(formattedMessage);
                    break;
                case LogLevel.WARN:
                    console.warn(formattedMessage);
                    break;
                case LogLevel.ERROR:
                    console.error(formattedMessage);
                    break;
            }
        }
        // File output
        if (this.config.enableFileLogging && this.logFile) {
            try {
                fs.appendFileSync(this.logFile, formattedMessage + '\n');
            }
            catch (error) {
                console.error('Failed to write to log file:', error);
            }
        }
    }
    /**
     * Create log entry
     */
    createLogEntry(level, message, metadata, module) {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            metadata,
            module,
        };
    }
    /**
     * Debug level logging
     */
    debug(message, metadata, module) {
        if (!this.shouldLog(LogLevel.DEBUG))
            return;
        const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata, module);
        this.writeLog(entry);
    }
    /**
     * Info level logging
     */
    info(message, metadata, module) {
        if (!this.shouldLog(LogLevel.INFO))
            return;
        const entry = this.createLogEntry(LogLevel.INFO, message, metadata, module);
        this.writeLog(entry);
    }
    /**
     * Warning level logging
     */
    warn(message, metadata, module) {
        if (!this.shouldLog(LogLevel.WARN))
            return;
        const entry = this.createLogEntry(LogLevel.WARN, message, metadata, module);
        this.writeLog(entry);
    }
    /**
     * Error level logging
     */
    error(message, metadata, module) {
        if (!this.shouldLog(LogLevel.ERROR))
            return;
        const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, module);
        this.writeLog(entry);
    }
    /**
     * CLI-specific logging (user-friendly output)
     */
    cli(message, type = 'info') {
        const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
        switch (type) {
            case 'success':
                console.log(`✅ ${message}`);
                break;
            case 'warning':
                console.warn(`⚠️  ${message}`);
                break;
            case 'error':
                console.error(`❌ ${message}`);
                break;
            default:
                console.log(`${message}`);
        }
    }
    /**
     * Update logger configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        if (config.enableFileLogging && !this.logFile) {
            this.initializeFileLogging();
        }
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Set log level from environment or string
     */
    setLevelFromString(level) {
        const normalizedLevel = level.toUpperCase();
        switch (normalizedLevel) {
            case 'DEBUG':
                this.config.level = LogLevel.DEBUG;
                break;
            case 'INFO':
                this.config.level = LogLevel.INFO;
                break;
            case 'WARN':
            case 'WARNING':
                this.config.level = LogLevel.WARN;
                break;
            case 'ERROR':
                this.config.level = LogLevel.ERROR;
                break;
            default:
                this.warn(`Unknown log level: ${level}, using INFO`, { requestedLevel: level }, 'Logger');
                this.config.level = LogLevel.INFO;
        }
    }
    /**
     * Create child logger with module name
     */
    child(moduleName) {
        return new ChildLogger(this, moduleName);
    }
}
exports.Logger = Logger;
/**
 * Child logger with predefined module name
 */
class ChildLogger {
    parent;
    moduleName;
    constructor(parent, moduleName) {
        this.parent = parent;
        this.moduleName = moduleName;
    }
    debug(message, metadata) {
        this.parent.debug(message, metadata, this.moduleName);
    }
    info(message, metadata) {
        this.parent.info(message, metadata, this.moduleName);
    }
    warn(message, metadata) {
        this.parent.warn(message, metadata, this.moduleName);
    }
    error(message, metadata) {
        this.parent.error(message, metadata, this.moduleName);
    }
    cli(message, type = 'info') {
        this.parent.cli(message, type);
    }
}
exports.ChildLogger = ChildLogger;
/**
 * Default logger instance
 */
exports.logger = Logger.getInstance();
/**
 * Configure logger from environment variables
 */
function configureLoggerFromEnv() {
    const logLevel = process.env.GASSAPI_LOG_LEVEL || 'INFO';
    const enableFileLogging = process.env.GASSAPI_LOG_FILE === 'true';
    const logDirectory = process.env.GASSAPI_LOG_DIR;
    const enableStructuredOutput = process.env.GASSAPI_LOG_STRUCTURED === 'true';
    const enableConsoleLogging = process.env.GASSAPI_LOG_CONSOLE !== 'false';
    exports.logger.updateConfig({
        level: LogLevel.INFO, // Will be set by setLevelFromString
        enableFileLogging,
        logDirectory,
        enableStructuredOutput,
        enableConsoleLogging,
    });
    exports.logger.setLevelFromString(logLevel);
}
/**
 * Initialize logger with default configuration for MCP client
 */
function initializeLogger() {
    // Configure from environment if available
    if (process.env.GASSAPI_LOG_LEVEL || process.env.GASSAPI_LOG_FILE) {
        configureLoggerFromEnv();
        return;
    }
    // Default configuration for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    exports.logger.updateConfig({
        level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
        enableFileLogging: !isDevelopment,
        enableConsoleLogging: true,
        enableStructuredOutput: false,
    });
    if (isDevelopment) {
        exports.logger.debug('Logger initialized in development mode', { isDevelopment }, 'Logger');
    }
}
//# sourceMappingURL=Logger.js.map