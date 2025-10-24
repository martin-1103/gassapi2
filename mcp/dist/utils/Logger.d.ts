/**
 * Logger Utility for MCP Client
 *
 * A centralized logging system that replaces console.log statements
 * with proper logging infrastructure for production readiness.
 */
import { LogMetadata } from '../types/mcp.types.js';
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    metadata?: LogMetadata;
    module?: string;
}
export interface LoggerConfig {
    level: LogLevel;
    enableFileLogging: boolean;
    logDirectory?: string;
    enableConsoleLogging: boolean;
    enableStructuredOutput: boolean;
}
/**
 * Centralized logger class with multiple output formats and log levels
 */
export declare class Logger {
    private static instance;
    private config;
    private logFile?;
    private constructor();
    /**
     * Get singleton logger instance
     */
    static getInstance(config?: Partial<LoggerConfig>): Logger;
    /**
     * Initialize file logging
     */
    private initializeFileLogging;
    /**
     * Check if log level should be output
     */
    private shouldLog;
    /**
     * Format log message
     */
    private formatMessage;
    /**
     * Write log entry to outputs
     */
    private writeLog;
    /**
     * Create log entry
     */
    private createLogEntry;
    /**
     * Debug level logging
     */
    debug(message: string, metadata?: LogMetadata, module?: string): void;
    /**
     * Info level logging
     */
    info(message: string, metadata?: LogMetadata, module?: string): void;
    /**
     * Warning level logging
     */
    warn(message: string, metadata?: LogMetadata, module?: string): void;
    /**
     * Error level logging
     */
    error(message: string, metadata?: LogMetadata, module?: string): void;
    /**
     * CLI-specific logging (user-friendly output)
     */
    cli(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
    /**
     * Update logger configuration
     */
    updateConfig(config: Partial<LoggerConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): LoggerConfig;
    /**
     * Set log level from environment or string
     */
    setLevelFromString(level: string): void;
    /**
     * Create child logger with module name
     */
    child(moduleName: string): ChildLogger;
}
/**
 * Child logger with predefined module name
 */
export declare class ChildLogger {
    private parent;
    private moduleName;
    constructor(parent: Logger, moduleName: string);
    debug(message: string, metadata?: LogMetadata): void;
    info(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    error(message: string, metadata?: LogMetadata): void;
    cli(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void;
}
/**
 * Default logger instance
 */
export declare const logger: Logger;
/**
 * Configure logger from environment variables
 */
export declare function configureLoggerFromEnv(): void;
/**
 * Initialize logger with default configuration for MCP client
 */
export declare function initializeLogger(): void;
//# sourceMappingURL=Logger.d.ts.map