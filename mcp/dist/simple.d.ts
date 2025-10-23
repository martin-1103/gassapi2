interface Config {
    project?: {
        id: string;
        name: string;
    };
    mcpClient?: {
        token: string;
        serverURL: string;
    };
}
/**
 * Simple MCP client for testing
 */
export declare class SimpleMcpClient {
    private config;
    constructor();
    /**
     * Load configuration from gassapi.json dengan type guards
     */
    private loadConfig;
    /**
     * Test basic functionality dengan validasi tambahan
     */
    testBasicFunctionality(): Promise<void>;
    /**
     * Show status dengan validasi
     */
    showStatus(): void;
    /**
     * Create sample configuration dengan validasi struktur
     */
    createSampleConfig(): void;
    /**
     * Get config dengan type guard
     */
    getConfig(): Config | null;
    /**
     * Cek apakah konfigurasi valid
     */
    isConfigValid(): boolean;
    /**
     * Validasi ulang konfigurasi
     */
    validateConfig(): {
        isValid: boolean;
        errors: string[];
    };
}
export {};
//# sourceMappingURL=simple.d.ts.map