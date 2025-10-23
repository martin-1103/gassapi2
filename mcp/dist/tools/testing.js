import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';
import { logger } from '../utils/Logger';
/**
 * Testing MCP Tools
 * Handles endpoint testing and execution operations
 */
const test_endpoint = {
    name: 'test_endpoint',
    description: 'Execute single endpoint test with environment variables',
    inputSchema: {
        type: 'object',
        properties: {
            endpointId: {
                type: 'string',
                description: 'Endpoint UUID to test'
            },
            environmentId: {
                type: 'string',
                description: 'Environment UUID for test execution'
            },
            overrideVariables: {
                type: 'object',
                description: 'Override environment variables for this test',
                default: {}
            },
            saveResult: {
                type: 'boolean',
                description: 'Save test result in backend',
                default: true
            }
        },
        required: ['endpointId', 'environmentId']
    }
};
export class TestingTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
    }
    /**
     * Validasi format UUID
     */
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }
    /**
     * Validasi dan sanitasi input parameters
     */
    validateTestEndpointArgs(args) {
        if (!args.endpointId || typeof args.endpointId !== 'string') {
            throw new Error('Endpoint ID harus diisi dan berupa string yang valid');
        }
        if (!args.environmentId || typeof args.environmentId !== 'string') {
            throw new Error('Environment ID harus diisi dan berupa string yang valid');
        }
        if (!this.isValidUUID(args.endpointId)) {
            throw new Error('Endpoint ID format tidak valid - harus UUID yang benar');
        }
        if (!this.isValidUUID(args.environmentId)) {
            throw new Error('Environment ID format tidak valid - harus UUID yang benar');
        }
        if (args.overrideVariables && typeof args.overrideVariables !== 'object') {
            throw new Error('Override variables harus berupa object');
        }
        // Validate override variables structure
        if (args.overrideVariables) {
            for (const [key, value] of Object.entries(args.overrideVariables)) {
                if (typeof key !== 'string' || key.trim() === '') {
                    throw new Error('Nama variable harus berupa string yang tidak kosong');
                }
                if (typeof value !== 'string') {
                    throw new Error(`Nilai variable "${key}" harus berupa string`);
                }
                if (key.length > 255) {
                    throw new Error(`Nama variable "${key}" terlalu panjang (maks 255 karakter)`);
                }
                if (value.length > 10000) {
                    throw new Error(`Nilai variable "${key}" terlalu panjang (maks 10.000 karakter)`);
                }
            }
        }
        if (args.saveResult !== undefined && typeof args.saveResult !== 'boolean') {
            throw new Error('SaveResult harus berupa boolean');
        }
    }
    /**
     * Transformasi aman environment variables array ke Record
     */
    transformEnvironmentVariables(environmentVariables) {
        try {
            if (!Array.isArray(environmentVariables)) {
                throw new Error('Environment variables harus berupa array');
            }
            const variables = {};
            for (let i = 0; i < environmentVariables.length; i++) {
                const variable = environmentVariables[i];
                // Validate variable structure
                if (!variable || typeof variable !== 'object') {
                    logger.warn(`Variable di index ${i} tidak valid, dilewati`, { index: i }, 'TestingTools');
                    continue;
                }
                // Check required fields
                if (!variable.key || typeof variable.key !== 'string') {
                    logger.warn(`Variable di index ${i} tidak memiliki key yang valid, dilewati`, { index: i }, 'TestingTools');
                    continue;
                }
                if (variable.key.trim() === '') {
                    logger.warn(`Variable di index ${i} memiliki key kosong, dilewati`, { index: i }, 'TestingTools');
                    continue;
                }
                // Only include enabled variables
                if (!variable.enabled) {
                    continue;
                }
                // Validate and clean key
                const cleanKey = variable.key.trim();
                if (cleanKey.length > 255) {
                    logger.warn(`Variable "${cleanKey}" terlalu panjang, dilewati`, { key: cleanKey }, 'TestingTools');
                    continue;
                }
                // Validate value
                if (variable.value === undefined || variable.value === null) {
                    logger.warn(`Variable "${cleanKey}" tidak memiliki nilai, dilewati`, { key: cleanKey }, 'TestingTools');
                    continue;
                }
                const stringValue = String(variable.value);
                if (stringValue.length > 10000) {
                    logger.warn(`Nilai variable "${cleanKey}" terlalu panjang, dilewati`, { key: cleanKey }, 'TestingTools');
                    continue;
                }
                variables[cleanKey] = stringValue;
            }
            return variables;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Gagal memproses environment variables: ${errorMessage}`);
        }
    }
    /**
     * Wrapper aman untuk pemanggilan API
     */
    async safeApiCall(operation, apiCall) {
        try {
            return await apiCall();
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown API error';
            // Check for common API errors
            if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                throw new Error(`${operation} - Data tidak ditemukan. Mohon periksa ID yang dimasukkan.`);
            }
            else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
                throw new Error(`${operation} - Akses ditolak. Mohon periksa token dan permission.`);
            }
            else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
                throw new Error(`${operation} - Akses forbidden. Mohon periksa konfigurasi permission.`);
            }
            else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
                throw new Error(`${operation} - Server error. Silakan coba lagi nanti atau hubungi admin.`);
            }
            else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                throw new Error(`${operation} - Koneksi error. Mohon periksa koneksi internet dan server availability.`);
            }
            else if (errorMessage.includes('timeout')) {
                throw new Error(`${operation} - Timeout. Server terlalu lama merespons, silakan coba lagi.`);
            }
            else {
                throw new Error(`${operation} - ${errorMessage}`);
            }
        }
    }
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('Konfigurasi GASSAPI tidak ditemukan. Silakan buat file gassapi.json di root project.');
            }
            // Validate config structure
            if (!config.project || !config.project.id) {
                throw new Error('Konfigurasi project tidak valid - project ID dibutuhkan');
            }
            if (!config.mcpClient || !config.mcpClient.serverURL) {
                throw new Error('Konfigurasi MCP client tidak valid - server URL dibutuhkan');
            }
            if (!config.mcpClient || !config.mcpClient.token) {
                throw new Error('Konfigurasi MCP client tidak valid - MCP token dibutuhkan');
            }
            this.backendClient = new BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
            return this.backendClient;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Gagal menginisialisasi backend client: ${errorMessage}`);
        }
    }
    /**
     * Test single endpoint dengan environment variables
     */
    async testEndpoint(args) {
        try {
            // Validate input parameters
            this.validateTestEndpointArgs(args);
            // Get configuration and client
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('Konfigurasi GASSAPI tidak ditemukan');
            }
            const client = await this.getBackendClient();
            // Get endpoint and environment details with safe API calls
            const [endpointDetails, environmentDetails] = await Promise.all([
                this.safeApiCall('Get endpoint details', () => client.getEndpointDetails(args.endpointId)),
                this.safeApiCall('Get environment details', () => client.getEnvironmentVariables(args.environmentId))
            ]);
            // Validate API responses
            if (!endpointDetails || typeof endpointDetails !== 'object') {
                throw new Error('Response endpoint details tidak valid');
            }
            if (!environmentDetails || !Array.isArray(environmentDetails.variables)) {
                throw new Error('Response environment variables tidak valid');
            }
            // Safe environment variables transformation
            const variables = this.transformEnvironmentVariables(environmentDetails.variables);
            // Apply overrides with validation
            if (args.overrideVariables) {
                for (const [key, value] of Object.entries(args.overrideVariables)) {
                    variables[key] = value;
                }
            }
            // Execute test with safe API call
            const testResult = await this.safeApiCall('Execute endpoint test', () => client.testEndpoint(args.endpointId, args.environmentId, args.overrideVariables));
            // Validate test result
            if (!testResult || typeof testResult !== 'object') {
                throw new Error('Hasil test tidak valid dari server');
            }
            // Format response
            const result = this.formatTestResult(testResult, endpointDetails, variables);
            return {
                content: [
                    {
                        type: 'text',
                        text: result
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown test error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Gagal Test Endpoint

Error: ${errorMessage}

Silakan periksa:
1. Endpoint ID benar dan valid
2. Environment accessible dan active
3. Koneksi internet stabil
4. API server sedang running
5. Konfigurasi project lengkap

Coba lagi atau hubungi admin kalau error terus berlanjut!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Format test result untuk display
     */
    formatTestResult(testResult, endpointDetails, variables) {
        try {
            // Validate test result structure
            if (!testResult || typeof testResult !== 'object') {
                throw new Error('Test result tidak valid');
            }
            const status = testResult.status >= 200 && testResult.status < 300 ? '🟢' : '🔴';
            const statusText = testResult.status >= 200 && testResult.status < 300 ? 'Success' : 'Failed';
            // Safe status validation
            if (typeof testResult.status !== 'number') {
                logger.warn('Status test tidak valid, menggunakan default 500', { status: testResult.status }, 'TestingTools');
                testResult.status = 500;
            }
            // Safe response time handling
            const responseTime = typeof testResult.response_time === 'number'
                ? testResult.response_time
                : 0;
            // Safe timestamp formatting
            let timestamp = 'N/A';
            if (testResult.created_at) {
                try {
                    timestamp = new Date(testResult.created_at).toLocaleString('id-ID');
                }
                catch (e) {
                    logger.warn('Format timestamp error', { error: e }, 'TestingTools');
                    timestamp = String(testResult.created_at);
                }
            }
            let result = `🧪 Hasil Test Endpoint

${status} Status: ${testResult.status} (${statusText})
⏱️  Response Time: ${responseTime}ms
📊 Timestamp: ${timestamp}

📍 Detail Endpoint:
- Name: ${endpointDetails?.name || 'N/A'}
- Method: ${endpointDetails?.method || 'N/A'}
- URL: ${endpointDetails?.url || 'N/A'}
- Collection: ${endpointDetails?.collection?.name || 'N/A'}

🔧 Environment Variables (${Object.keys(variables).length}):`;
            // Safe variables display
            if (Object.keys(variables).length > 0) {
                const varEntries = Object.entries(variables).map(([key, value]) => {
                    const safeKey = String(key).substring(0, 50);
                    const safeValue = String(value).length > 100
                        ? String(value).substring(0, 100) + '...'
                        : String(value);
                    return `- ${safeKey}: ${safeValue}`;
                });
                result += '\n' + varEntries.join('\n');
            }
            else {
                result += '\n- Tidak ada variables yang aktif';
            }
            // Safe response headers display
            if (testResult.response_headers && typeof testResult.response_headers === 'object') {
                result += '\n\n📤 Response Headers:';
                try {
                    Object.entries(testResult.response_headers).forEach(([key, value]) => {
                        if (typeof key === 'string' && key.length < 100) {
                            result += `\n- ${key}: ${value}`;
                        }
                    });
                }
                catch (e) {
                    logger.warn('Error formatting response headers', { error: e }, 'TestingTools');
                    result += '\n- Error menampilkan headers';
                }
            }
            // Safe response body display
            if (testResult.response_body) {
                try {
                    const responseString = typeof testResult.response_body === 'string'
                        ? testResult.response_body
                        : JSON.stringify(testResult.response_body || {}, null, 2);
                    if (responseString.length < 1000) {
                        result += '\n\n📄 Response Body:';
                        result += `\n\`\`\`\n${responseString}\n\`\`\``;
                    }
                    else {
                        result += `\n\n📄 Response Body: ${responseString.length} karakter (terlalu besar untuk ditampilkan)`;
                    }
                }
                catch (e) {
                    logger.warn('Error formatting response body', { error: e }, 'TestingTools');
                    result += '\n\n📄 Response Body: Error formatting data';
                }
            }
            // Safe error display
            if (testResult.error) {
                result += `\n\n❌ Detail Error:\n${String(testResult.error)}`;
            }
            result += '\n\n✅ Test selesai! Ready untuk next operation.';
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown formatting error';
            logger.warn('Error formatting test result', { error: errorMessage }, 'TestingTools');
            return `🧪 Hasil Test (Error Formatting)

Maaf, ada error saat memformat hasil test:
${errorMessage}

Data mentah test tersimpan di server. Silakan check dashboard.`;
        }
    }
    /**
     * Quick test dengan auto-detection
     */
    async quickTest(args) {
        try {
            // Validate quick test args
            if (args.url && typeof args.url !== 'string') {
                throw new Error('URL harus berupa string yang valid');
            }
            if (args.method && typeof args.method !== 'string') {
                throw new Error('Method harus berupa string yang valid');
            }
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🧪 Quick Test

❌ Konfigurasi Dibutuhkan
File gassapi.json tidak ditemukan di project directory.

Untuk jalankan quick test:
1. Create GASSAPI project
2. Generate MCP configuration
3. Save sebagai gassapi.json di project root`
                        }
                    ],
                    isError: true
                };
            }
            const client = await this.getBackendClient();
            // Get project context with safe API call
            const projectContext = await this.safeApiCall('Get project context', () => client.getProjectContext(config.project.id));
            // Validate project context
            if (!projectContext || typeof projectContext !== 'object') {
                throw new Error('Project context tidak valid dari server');
            }
            if (!projectContext.collections || !Array.isArray(projectContext.collections) || projectContext.collections.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `🧪 Quick Test

❌ Tidak Ada Endpoint
Project: ${config.project?.name || 'Unknown'}
Collections: 0

Untuk test endpoint:
1. Create collections
2. Add endpoints ke collections
3. Use test_endpoint tool dengan endpoint ID spesifik`
                        }
                    ],
                    isError: true
                };
            }
            // Safe endpoint selection
            try {
                const firstCollection = projectContext.collections[0];
                // Perlu dapatkan endpoints dari API karena tidak ada di response
                const client = await this.getBackendClient();
                const endpoints = await client.getEndpoints(firstCollection.id);
                if (endpoints && Array.isArray(endpoints) && endpoints.length > 0) {
                    const firstEndpoint = endpoints[0];
                    const firstEnvironment = projectContext.environments && Array.isArray(projectContext.environments)
                        ? (projectContext.environments.find((env) => env.is_default) || projectContext.environments[0])
                        : null;
                    if (firstEnvironment && firstEndpoint) {
                        const result = await this.testEndpoint({
                            endpointId: firstEndpoint.id,
                            environmentId: firstEnvironment.id,
                            saveResult: true
                        });
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: `🧪 Quick Test

🎯 Auto-selected Endpoint:
- Name: ${firstEndpoint.name || 'Unknown'}
- Method: ${firstEndpoint.method || 'Unknown'}
- URL: ${firstEndpoint.url || 'Unknown'}
- Environment: ${firstEnvironment.name || 'Unknown'}

${result.content[0].text}`
                                }
                            ]
                        };
                    }
                }
            }
            catch (endpointError) {
                logger.warn('Error selecting endpoint for quick test', { error: endpointError }, 'TestingTools');
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `🧪 Quick Test

❌ Tidak Ada Endpoint Bisa Di-test
Project: ${config.project?.name || 'Unknown'}
Collections: ${projectContext.collections.length}

Tidak ada endpoint ditemukan untuk quick testing.

Untuk enable testing:
1. Add endpoints ke collections
2. Configure environment variables
3. Use test_endpoint tool spesifik`
                    }
                ],
                isError: true
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Quick Test Gagal

Error: ${errorMessage}

Tidak bisa jalankan quick test. Please check konfigurasi dan coba lagi.`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Test multiple endpoints
     */
    async batchTest(args) {
        try {
            // Validate batch test args
            if (!Array.isArray(args.endpointIds) || args.endpointIds.length === 0) {
                throw new Error('Endpoint IDs harus berupa array yang tidak kosong');
            }
            if (args.endpointIds.length > 50) {
                throw new Error('Terlalu banyak endpoints untuk batch test (maks 50)');
            }
            if (!args.environmentId || typeof args.environmentId !== 'string') {
                throw new Error('Environment ID harus diisi dan valid');
            }
            if (!this.isValidUUID(args.environmentId)) {
                throw new Error('Environment ID format tidak valid');
            }
            // Validate each endpoint ID
            for (let i = 0; i < args.endpointIds.length; i++) {
                const endpointId = args.endpointIds[i];
                if (!this.isValidUUID(endpointId)) {
                    throw new Error(`Endpoint ID di index ${i} tidak valid: ${endpointId}`);
                }
            }
            if (args.delay !== undefined && (typeof args.delay !== 'number' || args.delay < 0 || args.delay > 10000)) {
                throw new Error('Delay harus berupa number antara 0 dan 10000ms');
            }
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('Konfigurasi GASSAPI tidak ditemukan');
            }
            const client = await this.getBackendClient();
            const results = [];
            const parallel = args.parallel !== false;
            const delay = Math.min(args.delay || 100, 10000); // Cap delay at 10 seconds
            try {
                if (parallel) {
                    // Run tests in parallel with error handling
                    const promises = args.endpointIds.map(async (endpointId, index) => {
                        try {
                            const result = await this.safeApiCall('Batch endpoint test', () => client.testEndpoint(endpointId, args.environmentId));
                            return { endpointId, index, result };
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            return {
                                endpointId,
                                index,
                                result: {
                                    status: 0,
                                    response_time: 0,
                                    created_at: new Date().toISOString(),
                                    error: errorMessage
                                }
                            };
                        }
                    });
                    const testResults = await Promise.all(promises);
                    results.push(...testResults);
                }
                else {
                    // Run tests sequentially with error handling
                    for (let i = 0; i < args.endpointIds.length; i++) {
                        const endpointId = args.endpointIds[i];
                        try {
                            const result = await this.safeApiCall('Sequential endpoint test', () => client.testEndpoint(endpointId, args.environmentId));
                            results.push({ endpointId, index: i, result });
                        }
                        catch (error) {
                            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                            results.push({
                                endpointId,
                                index: i,
                                result: {
                                    status: 0,
                                    response_time: 0,
                                    created_at: new Date().toISOString(),
                                    error: errorMessage
                                }
                            });
                        }
                        // Add delay between tests
                        if (delay > 0 && i < args.endpointIds.length - 1) {
                            await this.sleep(delay);
                        }
                    }
                }
            }
            catch (batchError) {
                const errorMessage = batchError instanceof Error ? batchError.message : 'Unknown batch error';
                throw new Error(`Batch test execution error: ${errorMessage}`);
            }
            // Safe results calculation
            const successCount = results.filter(r => r.result.status >= 200 && r.result.status < 300).length;
            const failCount = results.length - successCount;
            const avgResponseTime = results.length > 0
                ? results.reduce((sum, r) => sum + (r.result.response_time || 0), 0) / results.length
                : 0;
            let resultText = `🧪 Hasil Batch Test

📊 Summary:
- Total Tests: ${results.length}
- ✅ Successful: ${successCount}
- ❌ Failed: ${failCount}
- 📈 Average Response Time: ${avgResponseTime.toFixed(2)}ms
- 🔄 Execution Mode: ${parallel ? 'Parallel' : 'Sequential'}
- ⏱️ Delay: ${delay}ms

📋 Detailed Results:`;
            // Safe results display
            results.forEach(({ endpointId, result, index }) => {
                const status = result.status >= 200 && result.status < 300 ? '🟢' : '🔴';
                const responseTime = result.response_time || 0;
                const shortEndpointId = endpointId.substring(0, 8) + '...';
                resultText += `\n${index + 1}. ${shortEndpointId}: ${status} ${result.status} (${responseTime}ms)`;
                // Add error info if failed
                if (result.error && result.status === 0) {
                    const shortError = String(result.error).substring(0, 50);
                    resultText += `\n   Error: ${shortError}...`;
                }
            });
            resultText += `\n\n🎯 Batch test selesai! ${successCount}/${results.length} tests passed.`;
            return {
                content: [
                    {
                        type: 'text',
                        text: resultText
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Batch Test Gagal

Error: ${errorMessage}

Silakan periksa:
1. Semua endpoint IDs valid
2. Environment accessible
3. Koneksi internet stabil
4. Jumlah endpoint tidak lebih dari 50

Batch test failed! Coba lagi ya!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Helper function untuk delays
     */
    sleep(ms) {
        return new Promise(resolve => {
            if (ms <= 0) {
                resolve();
                return;
            }
            setTimeout(resolve, Math.min(ms, 10000)); // Cap at 10 seconds
        });
    }
    /**
     * Get testing tools list
     */
    getTools() {
        return [test_endpoint];
    }
    /**
     * Handle tool calls
     */
    async handleToolCall(toolName, args) {
        try {
            // Validate tool name
            if (!toolName || typeof toolName !== 'string') {
                throw new Error('Tool name harus valid');
            }
            // Validate args
            if (!args || typeof args !== 'object') {
                throw new Error('Arguments harus berupa object yang valid');
            }
            switch (toolName) {
                case 'test_endpoint':
                    return this.testEndpoint(args);
                default:
                    throw new Error(`Testing tool tidak dikenal: ${toolName}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new Error(`Handle tool call error: ${errorMessage}`);
        }
    }
}
// Export for MCP server registration
export const testingTools = new TestingTools();
export const TESTING_TOOLS = [test_endpoint];
//# sourceMappingURL=testing.js.map