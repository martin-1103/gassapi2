/**
 * Logger Utility for MCP Client
 *
 * A centralized logging system that replaces console.log statements
 * with proper logging infrastructure for production readiness.
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogMetadata } from '../types/mcp.types';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
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
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logFile?: string;

  private constructor(config?: Partial<LoggerConfig>) {
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
  public static getInstance(config?: Partial<LoggerConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Initialize file logging
   */
  private initializeFileLogging(): void {
    try {
      const logDir = this.config.logDirectory || path.join(process.cwd(), 'logs');

      // Create logs directory if it doesn't exist
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const today = new Date().toISOString().split('T')[0];
      this.logFile = path.join(logDir, `gassapi-mcp-${today}.log`);
    } catch (error) {
      console.error('Failed to initialize file logging:', error);
      this.config.enableFileLogging = false;
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Format log message
   */
  private formatMessage(entry: LogEntry): string {
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
  private writeLog(entry: LogEntry): void {
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
      } catch (error) {
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Create log entry
   */
  private createLogEntry(level: LogLevel, message: string, metadata?: LogMetadata, module?: string): LogEntry {
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
  public debug(message: string, metadata?: LogMetadata, module?: string): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, metadata, module);
    this.writeLog(entry);
  }

  /**
   * Info level logging
   */
  public info(message: string, metadata?: LogMetadata, module?: string): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, metadata, module);
    this.writeLog(entry);
  }

  /**
   * Warning level logging
   */
  public warn(message: string, metadata?: LogMetadata, module?: string): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, metadata, module);
    this.writeLog(entry);
  }

  /**
   * Error level logging
   */
  public error(message: string, metadata?: LogMetadata, module?: string): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, metadata, module);
    this.writeLog(entry);
  }

  /**
   * CLI-specific logging (user-friendly output)
   */
  public cli(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {

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
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };

    if (config.enableFileLogging && !this.logFile) {
      this.initializeFileLogging();
    }
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Set log level from environment or string
   */
  public setLevelFromString(level: string): void {
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
  public child(moduleName: string): ChildLogger {
    return new ChildLogger(this, moduleName);
  }
}

/**
 * Child logger with predefined module name
 */
export class ChildLogger {
  constructor(private parent: Logger, private moduleName: string) {}

  public debug(message: string, metadata?: LogMetadata): void {
    this.parent.debug(message, metadata, this.moduleName);
  }

  public info(message: string, metadata?: LogMetadata): void {
    this.parent.info(message, metadata, this.moduleName);
  }

  public warn(message: string, metadata?: LogMetadata): void {
    this.parent.warn(message, metadata, this.moduleName);
  }

  public error(message: string, metadata?: LogMetadata): void {
    this.parent.error(message, metadata, this.moduleName);
  }

  public cli(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    this.parent.cli(message, type);
  }
}

/**
 * Default logger instance
 */
export const logger = Logger.getInstance();

/**
 * Configure logger from environment variables
 */
export function configureLoggerFromEnv(): void {
  const logLevel = process.env.GASSAPI_LOG_LEVEL || 'INFO';
  const enableFileLogging = process.env.GASSAPI_LOG_FILE === 'true';
  const logDirectory = process.env.GASSAPI_LOG_DIR;
  const enableStructuredOutput = process.env.GASSAPI_LOG_STRUCTURED === 'true';
  const enableConsoleLogging = process.env.GASSAPI_LOG_CONSOLE !== 'false';

  logger.updateConfig({
    level: LogLevel.INFO, // Will be set by setLevelFromString
    enableFileLogging,
    logDirectory,
    enableStructuredOutput,
    enableConsoleLogging,
  });

  logger.setLevelFromString(logLevel);
}

/**
 * Initialize logger with default configuration for MCP client
 */
export function initializeLogger(): void {
  // Configure from environment if available
  if (process.env.GASSAPI_LOG_LEVEL || process.env.GASSAPI_LOG_FILE) {
    configureLoggerFromEnv();
    return;
  }

  // Default configuration for development
  const isDevelopment = process.env.NODE_ENV !== 'production';

  logger.updateConfig({
    level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
    enableFileLogging: !isDevelopment,
    enableConsoleLogging: true,
    enableStructuredOutput: false,
  });

  if (isDevelopment) {
    logger.debug('Logger initialized in development mode', { isDevelopment }, 'Logger');
  }
}