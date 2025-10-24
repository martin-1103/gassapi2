import { ValidationResult } from '../types/execution.types.js';
import { logger } from '../utils/Logger.js';

/**
 * URL Validator
 * Validates URLs for security and correctness
 */
export class URLValidator {
  private static readonly ALLOWED_PROTOCOLS = ['http:', 'https:'];
  private static readonly LOCALHOST_PATTERNS = [
    'localhost',
    '127.0.0.1',
    '::1',
    '0.0.0.0'
  ];

  private static readonly PRIVATE_IP_RANGES = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,             // 192.168.0.0/16
    /^169\.254\./,             // Link-local
    /^fc00:/,                  // IPv6 private
    /^fe80:/,                  // IPv6 link-local
  ];

  /**
   * Validate URL for security and correctness
   */
  static validate(url: string, options: {
    allowLocalhost?: boolean;
    allowPrivateIPs?: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
  } = {}): ValidationResult {
    const errors: string[] = [];

    try {
      const parsedUrl = new URL(url);

      // Check protocol
      if (!this.ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
        errors.push(`Protocol '${parsedUrl.protocol}' is not allowed. Only HTTP and HTTPS are supported.`);
      }

      // Check localhost access
      if (this.isLocalhost(parsedUrl) && !options.allowLocalhost) {
        errors.push('Localhost access is not allowed');
      }

      // Check private IP access
      if (this.isPrivateIP(parsedUrl) && !options.allowPrivateIPs) {
        errors.push('Private IP access is not allowed');
      }

      // Check domain restrictions
      if (options.allowedDomains && options.allowedDomains.length > 0) {
        const isAllowed = options.allowedDomains.some(domain =>
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );
        if (!isAllowed) {
          errors.push(`Domain '${parsedUrl.hostname}' is not in allowed domains list`);
        }
      }

      // Check blocked domains
      if (options.blockedDomains && options.blockedDomains.length > 0) {
        const isBlocked = options.blockedDomains.some(domain =>
          parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );
        if (isBlocked) {
          errors.push(`Domain '${parsedUrl.hostname}' is blocked`);
        }
      }

      // Check for suspicious patterns
      if (this.hasSuspiciousPatterns(parsedUrl)) {
        errors.push('URL contains suspicious patterns');
      }

    } catch (error) {
      errors.push('Invalid URL format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if URL points to localhost
   */
  static isLocalhost(url: URL): boolean {
    return this.LOCALHOST_PATTERNS.includes(url.hostname) ||
           url.hostname.endsWith('.local');
  }

  /**
   * Check if URL points to private IP
   */
  static isPrivateIP(url: URL): boolean {
    // Check IPv4
    if (this.isIPv4(url.hostname)) {
      return this.PRIVATE_IP_RANGES.some(range => range.test(url.hostname));
    }

    // Check IPv6
    if (this.isIPv6(url.hostname)) {
      return url.hostname.toLowerCase().startsWith('fc') ||
             url.hostname.toLowerCase().startsWith('fe80');
    }

    return false;
  }

  /**
   * Check for suspicious URL patterns
   */
  private static hasSuspiciousPatterns(url: URL): boolean {
    const suspiciousPatterns = [
      /\.\./,                    // Directory traversal
      /[<>'"]/i,                 // HTML injection
      /javascript:/i,           // JavaScript URLs
      /data:/i,                  // Data URLs
      /vbscript:/i,              // VBScript URLs
      /file:/i,                  // File URLs
      /\\\\|\//,                 // Path separators in unusual places
    ];

    const urlString = url.toString();
    return suspiciousPatterns.some(pattern => pattern.test(urlString));
  }

  /**
   * Check if string is IPv4 address
   */
  private static isIPv4(hostname: string): boolean {
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (!match) return false;

    // Check if each octet is valid (0-255)
    return match.slice(1).every(octet => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  /**
   * Check if string is IPv6 address
   */
  private static isIPv6(hostname: string): boolean {
    // Basic IPv6 regex - simplified
    return hostname.includes(':') && !hostname.includes('.');
  }

  /**
   * Sanitize URL for logging
   */
  static sanitizeForLogging(url: string): string {
    try {
      const parsedUrl = new URL(url);

      // Remove sensitive information from query parameters
      const sensitiveParams = ['password', 'token', 'key', 'secret', 'auth'];
      const params = new URLSearchParams(parsedUrl.search);

      sensitiveParams.forEach(param => {
        if (params.has(param)) {
          params.set(param, '***');
        }
      });

      parsedUrl.search = params.toString();
      return parsedUrl.toString();
    } catch {
      return url; // Return original if parsing fails
    }
  }

  /**
   * Extract domain from URL
   */
  static extractDomain(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch {
      return null;
    }
  }

  /**
   * Check if URL is secure (HTTPS)
   */
  static isSecure(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }
}