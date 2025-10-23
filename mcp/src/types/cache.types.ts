/**
 * Cache Type Definitions
 */

export interface CacheData<T> {
  data: T;
  cachedAt: number;
  expiresAt: number;
}

export interface ProjectCache {
  project: any;
  collections: any[];
  environments: any[];
  lastSync: number;
}

export interface TokenValidationCache {
  isValid: boolean;
  projectContext?: any;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  lastCleanup: number;
}

export type CacheKey = string;
export type CacheValue = any;

export interface CacheOptions {
  ttlMs?: number;
  compress?: boolean;
}