"use strict";
/**
 * Logger Utility for MCP Client
 *
 * A centralized logging system that replaces console.log statements
 * with proper logging infrastructure for production readiness.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.ChildLogger = exports.Logger = exports.LogLevel = void 0;
exports.configureLoggerFromEnv = configureLoggerFromEnv;
exports.initializeLogger = initializeLogger;
var fs = require("fs");
var path = require("path");
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
var Logger = /** @class */ (function () {
    function Logger(config) {
        this.config = __assign({ level: LogLevel.INFO, enableFileLogging: false, enableConsoleLogging: true, enableStructuredOutput: false }, config);
        if (this.config.enableFileLogging) {
            this.initializeFileLogging();
        }
    }
    /**
     * Get singleton logger instance
     */
    Logger.getInstance = function (config) {
        if (!Logger.instance) {
            Logger.instance = new Logger(config);
        }
        return Logger.instance;
    };
    /**
     * Initialize file logging
     */
    Logger.prototype.initializeFileLogging = function () {
        try {
            var logDir = this.config.logDirectory || path.join(process.cwd(), 'logs');
            // Create logs directory if it doesn't exist
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            var today = new Date().toISOString().split('T')[0];
            this.logFile = path.join(logDir, "gassapi-mcp-".concat(today, ".log"));
        }
        catch (error) {
            console.error('Failed to initialize file logging:', error);
            this.config.enableFileLogging = false;
        }
    };
    /**
     * Check if log level should be output
     */
    Logger.prototype.shouldLog = function (level) {
        return level >= this.config.level;
    };
    /**
     * Format log message
     */
    Logger.prototype.formatMessage = function (entry) {
        if (this.config.enableStructuredOutput) {
            return JSON.stringify(entry);
        }
        var levelName = LogLevel[entry.level];
        var module = entry.module ? "[".concat(entry.module, "] ") : '';
        var metadata = entry.metadata ? " ".concat(JSON.stringify(entry.metadata)) : '';
        return "".concat(entry.timestamp, " ").concat(levelName, " ").concat(module).concat(entry.message).concat(metadata);
    };
    /**
     * Write log entry to outputs
     */
    Logger.prototype.writeLog = function (entry) {
        var formattedMessage = this.formatMessage(entry);
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
    };
    /**
     * Create log entry
     */
    Logger.prototype.createLogEntry = function (level, message, metadata, module) {
        return {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            metadata: metadata,
            module: module,
        };
    };
    /**
     * Debug level logging
     */
    Logger.prototype.debug = function (message, metadata, module) {
        if (!this.shouldLog(LogLevel.DEBUG))
            return;
        var entry = this.createLogEntry(LogLevel.DEBUG, message, metadata, module);
        this.writeLog(entry);
    };
    /**
     * Info level logging
     */
    Logger.prototype.info = function (message, metadata, module) {
        if (!this.shouldLog(LogLevel.INFO))
            return;
        var entry = this.createLogEntry(LogLevel.INFO, message, metadata, module);
        this.writeLog(entry);
    };
    /**
     * Warning level logging
     */
    Logger.prototype.warn = function (message, metadata, module) {
        if (!this.shouldLog(LogLevel.WARN))
            return;
        var entry = this.createLogEntry(LogLevel.WARN, message, metadata, module);
        this.writeLog(entry);
    };
    /**
     * Error level logging
     */
    Logger.prototype.error = function (message, metadata, module) {
        if (!this.shouldLog(LogLevel.ERROR))
            return;
        var entry = this.createLogEntry(LogLevel.ERROR, message, metadata, module);
        this.writeLog(entry);
    };
    /**
     * CLI-specific logging (user-friendly output)
     */
    Logger.prototype.cli = function (message, type) {
        if (type === void 0) { type = 'info'; }
        switch (type) {
            case 'success':
                console.log("\u2705 ".concat(message));
                break;
            case 'warning':
                console.warn("\u26A0\uFE0F  ".concat(message));
                break;
            case 'error':
                console.error("\u274C ".concat(message));
                break;
            default:
                console.log("".concat(message));
        }
    };
    /**
     * Update logger configuration
     */
    Logger.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        if (config.enableFileLogging && !this.logFile) {
            this.initializeFileLogging();
        }
    };
    /**
     * Get current configuration
     */
    Logger.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Set log level from environment or string
     */
    Logger.prototype.setLevelFromString = function (level) {
        var normalizedLevel = level.toUpperCase();
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
                this.warn("Unknown log level: ".concat(level, ", using INFO"), { requestedLevel: level }, 'Logger');
                this.config.level = LogLevel.INFO;
        }
    };
    /**
     * Create child logger with module name
     */
    Logger.prototype.child = function (moduleName) {
        return new ChildLogger(this, moduleName);
    };
    return Logger;
}());
exports.Logger = Logger;
/**
 * Child logger with predefined module name
 */
var ChildLogger = /** @class */ (function () {
    function ChildLogger(parent, moduleName) {
        this.parent = parent;
        this.moduleName = moduleName;
    }
    ChildLogger.prototype.debug = function (message, metadata) {
        this.parent.debug(message, metadata, this.moduleName);
    };
    ChildLogger.prototype.info = function (message, metadata) {
        this.parent.info(message, metadata, this.moduleName);
    };
    ChildLogger.prototype.warn = function (message, metadata) {
        this.parent.warn(message, metadata, this.moduleName);
    };
    ChildLogger.prototype.error = function (message, metadata) {
        this.parent.error(message, metadata, this.moduleName);
    };
    ChildLogger.prototype.cli = function (message, type) {
        if (type === void 0) { type = 'info'; }
        this.parent.cli(message, type);
    };
    return ChildLogger;
}());
exports.ChildLogger = ChildLogger;
/**
 * Default logger instance
 */
exports.logger = Logger.getInstance();
/**
 * Configure logger from environment variables
 */
function configureLoggerFromEnv() {
    var logLevel = process.env.GASSAPI_LOG_LEVEL || 'INFO';
    var enableFileLogging = process.env.GASSAPI_LOG_FILE === 'true';
    var logDirectory = process.env.GASSAPI_LOG_DIR;
    var enableStructuredOutput = process.env.GASSAPI_LOG_STRUCTURED === 'true';
    var enableConsoleLogging = process.env.GASSAPI_LOG_CONSOLE !== 'false';
    exports.logger.updateConfig({
        level: LogLevel.INFO, // Will be set by setLevelFromString
        enableFileLogging: enableFileLogging,
        logDirectory: logDirectory,
        enableStructuredOutput: enableStructuredOutput,
        enableConsoleLogging: enableConsoleLogging,
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
    var isDevelopment = process.env.NODE_ENV !== 'production';
    exports.logger.updateConfig({
        level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
        enableFileLogging: !isDevelopment,
        enableConsoleLogging: true,
        enableStructuredOutput: false,
    });
    if (isDevelopment) {
        exports.logger.debug('Logger initialized in development mode', { isDevelopment: isDevelopment }, 'Logger');
    }
}
