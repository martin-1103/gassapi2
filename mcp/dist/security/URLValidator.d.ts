import { ValidationResult } from '../types/execution.types.js';
/**
 * URL Validator
 * Validates URLs for security and correctness
 */
export declare class URLValidator {
    private static readonly ALLOWED_PROTOCOLS;
    private static readonly LOCALHOST_PATTERNS;
    private static readonly PRIVATE_IP_RANGES;
    /**
     * Validate URL for security and correctness
     */
    static validate(url: string, options?: {
        allowLocalhost?: boolean;
        allowPrivateIPs?: boolean;
        allowedDomains?: string[];
        blockedDomains?: string[];
    }): ValidationResult;
    /**
     * Check if URL points to localhost
     */
    static isLocalhost(url: URL): boolean;
    /**
     * Check if URL points to private IP
     */
    static isPrivateIP(url: URL): boolean;
    /**
     * Check for suspicious URL patterns
     */
    private static hasSuspiciousPatterns;
    /**
     * Check if string is IPv4 address
     */
    private static isIPv4;
    /**
     * Check if string is IPv6 address
     */
    private static isIPv6;
    /**
     * Sanitize URL for logging
     */
    static sanitizeForLogging(url: string): string;
    /**
     * Extract domain from URL
     */
    static extractDomain(url: string): string | null;
    /**
     * Check if URL is secure (HTTPS)
     */
    static isSecure(url: string): boolean;
}
//# sourceMappingURL=URLValidator.d.ts.map