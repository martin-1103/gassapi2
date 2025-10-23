import { GassapiConfig } from '../types/config.types';
/**
 * Loader untuk konfigurasi GASSAPI
 * Otomatis deteksi dan parsing file konfigurasi gassapi.json
 */
export declare class ConfigLoader {
    private cacheManager;
    private configCache;
    constructor();
    /**
     * Deteksi otomatis file gassapi.json dengan scan parent directory
     */
    detectProjectConfig(): Promise<GassapiConfig | null>;
    /**
     * Scan file gassapi.json di direktori saat ini dan parent
     */
    private scanForConfig;
    /**
     * Load file konfigurasi gassapi.json spesifik
     */
    loadConfig(configPath: string): Promise<GassapiConfig>;
    /**
     * Validasi struktur konfigurasi GASSAPI
     */
    validateConfig(config: any): asserts config is GassapiConfig;
    /**
     * Dapatkan template konfigurasi default
     */
    static getDefaultConfig(): Partial<GassapiConfig>;
    /**
     * Bikin file konfigurasi sample
     */
    static createSampleConfig(projectDir: string, projectId: string, projectName: string): Promise<void>;
    /**
     * Reload konfigurasi (clear cache dan reload)
     */
    reloadConfig(configPath: string): Promise<GassapiConfig>;
    /**
     * Dapatkan konfigurasi dengan cache
     */
    getCachedConfig(configPath: string): Promise<GassapiConfig | null>;
    /**
     * Clear semua cache konfigurasi
     */
    clearCache(): void;
    /**
     * Validasi keberadaan file konfigurasi
     */
    configExists(configPath?: string): Promise<boolean>;
    /**
     * Dapatkan direktori project dari konfigurasi
     */
    getProjectDirectory(configPath?: string): Promise<string | null>;
    /**
     * Cek apakah file ada
     */
    private fileExists;
    /**
     * Normalisasi variabel environment
     */
    normalizeEnvironmentVariables(variables: Record<string, any>): Record<string, string>;
    /**
     * Ambil variabel environment untuk environment tertentu
     */
    extractEnvironmentVariables(config: GassapiConfig, environmentName?: string): Record<string, string>;
    /**
     * Dapatkan nama environment yang aktif
     */
    getActiveEnvironment(config: GassapiConfig): string;
    /**
     * Dapatkan informasi project
     */
    getProjectInfo(config: GassapiConfig): {
        id: string;
        name: string;
        description?: string;
    };
    /**
     * Dapatkan URL server
     */
    getServerURL(config: GassapiConfig): string;
    /**
     * Dapatkan token MCP
     */
    getMcpToken(config: GassapiConfig): string;
    /**
     * Dapatkan base URL API
     */
    getApiBaseUrl(config: GassapiConfig): string;
    /**
     * Dapatkan port discovery
     */
    getDiscoveryPorts(config: GassapiConfig): number[];
    /**
     * Apakah harus auto-scan API
     */
    shouldAutoScan(config: GassapiConfig): boolean;
}
//# sourceMappingURL=ConfigLoader.d.ts.map