/**
 * Cache Type Definitions
 */
/**
 * Generic cache entry with expiration
 * @template T - Type of cached data
 */
export interface CacheData<T> {
    /** The cached data value */
    data: T;
    /** Unix timestamp when data was cached */
    cachedAt: number;
    /** Unix timestamp when cache entry expires */
    expiresAt: number;
}
/**
 * Basic project information for caching
 */
export interface CachedProject {
    /** Project identifier */
    id: string;
    /** Project name */
    name: string;
    /** Optional project description */
    description?: string;
    /** Creator user identifier */
    created_by: string;
    /** ISO timestamp when project was created */
    created_at: string;
    /** ISO timestamp when project was last updated */
    updated_at: string;
}
/**
 * Basic collection information for caching
 */
export interface CachedCollection {
    /** Collection identifier */
    id: string;
    /** Parent project identifier */
    project_id: string;
    /** Parent collection identifier (if nested) */
    parent_id?: string;
    /** Collection name */
    name: string;
    /** Optional collection description */
    description?: string;
    /** Number of endpoints in this collection */
    endpoint_count: number;
    /** ISO timestamp when collection was created */
    created_at: string;
    /** ISO timestamp when collection was last updated */
    updated_at: string;
}
/**
 * Basic environment information for caching
 */
export interface CachedEnvironment {
    /** Environment identifier */
    id: string;
    /** Parent project identifier */
    project_id: string;
    /** Environment name */
    name: string;
    /** Whether this is the default environment */
    is_default: boolean;
    /** Number of variables in this environment */
    variable_count: number;
    /** ISO timestamp when environment was created */
    created_at: string;
    /** ISO timestamp when environment was last updated */
    updated_at: string;
}
/**
 * Complete project cache entry with related data
 */
export interface ProjectCache {
    /** Basic project information */
    project: CachedProject;
    /** Collections belonging to this project */
    collections: CachedCollection[];
    /** Environments belonging to this project */
    environments: CachedEnvironment[];
    /** Unix timestamp when cache was last synchronized */
    lastSync: number;
}
/**
 * Token validation result cache entry
 */
export interface TokenValidationCache {
    /** Whether the token is currently valid */
    isValid: boolean;
    /** Basic project context if token is valid */
    projectContext?: {
        /** Project identifier */
        id: string;
        /** Project name */
        name: string;
    };
    /** Unix timestamp when this validation expires */
    expiresAt: number;
}
/**
 * Cache performance statistics
 */
export interface CacheStats {
    /** Number of successful cache hits */
    hits: number;
    /** Number of cache misses */
    misses: number;
    /** Current number of entries in cache */
    size: number;
    /** Unix timestamp of last cache cleanup */
    lastCleanup: number;
}
/**
 * Cache key type (string-based)
 */
export type CacheKey = string;
/**
 * Generic cache value type
 */
export type CacheValue = unknown;
/**
 * Cache configuration options
 */
export interface CacheOptions {
    /** Time-to-live in milliseconds (default: 5 minutes) */
    ttlMs?: number;
    /** Whether to compress cached data (default: false) */
    compress?: boolean;
}
/**
 * Cache entry operations
 */
export type CacheOperation = 'get' | 'set' | 'delete' | 'clear' | 'cleanup';
/**
 * Cache operation result
 */
export interface CacheOperationResult {
    /** Type of operation performed */
    operation: CacheOperation;
    /** Whether operation was successful */
    success: boolean;
    /** Data value (for get operations) */
    value?: CacheValue;
    /** Error message if operation failed */
    error?: string;
    /** Unix timestamp when operation was performed */
    timestamp: number;
}
//# sourceMappingURL=cache.types.d.ts.map