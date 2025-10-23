/**
 * Simple MCP client for testing
 */
export declare class SimpleMcpClient {
    private config;
    constructor();
    /**
     * Load configuration from gassapi.json
     */
    private loadConfig;
    /**
     * Test basic functionality
     */
    testBasicFunctionality(): Promise<void>;
    /**
     * Show status
     */
    showStatus(): void;
    /**
     * Create sample configuration
     */
    createSampleConfig(): void;
}
export { SimpleMcpClient };
