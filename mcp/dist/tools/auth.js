import { ConfigLoader } from '../discovery/ConfigLoader.js';
import { BackendClient } from '../client/BackendClient.js';
import { logger } from '../utils/Logger.js';
/**
 * Tool autentikasi MCP
 * Handle validasi token dan operasi autentikasi lainnya
 */
// Definisi tool untuk validasi token MCP
const validate_mcp_token = {
    name: 'validate_mcp_token',
    description: 'Validasi token MCP dan dapetin info konteks proyek',
    inputSchema: {
        type: 'object',
        properties: {
            token: {
                type: 'string',
                description: 'Token MCP yang mau divalidasi (opsional, pake config file kalo ga ada)'
            }
        },
        required: []
    }
};
export class AuthTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
    }
    /**
     * Dapatkan backend client dengan caching biar ga bikin baru terus
     */
    async getBackendClient(token) {
        // Kalo uda ada, pake yang uda ada
        if (this.backendClient) {
            return this.backendClient;
        }
        // Load config sekali aja, diemin di variable
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('Konfigurasi GASSAPI ga ketemu. Please create gassapi.json di root project kamu.');
        }
        // Cari token dari parameter atau config
        let mcpToken;
        if (token) {
            mcpToken = token;
        }
        else {
            mcpToken = this.configLoader.getMcpToken(config);
        }
        if (!mcpToken) {
            throw new Error('Token MCP ga ada. Please provide token atau pastiin gassapi.json ada token yang valid.');
        }
        // Ambil server URL dari config
        const serverURL = this.configLoader.getServerURL(config);
        if (!serverURL) {
            throw new Error('Server URL ga ada di konfigurasi');
        }
        // Bikin client baru
        this.backendClient = new BackendClient(serverURL, mcpToken);
        return this.backendClient;
    }
    /**
     * Validasi token MCP dan kembalikan konteks proyek
     * Type-safe implementation dengan proper error handling
     */
    async validateMcpToken(args) {
        try {
            // Dapatkan client backend
            const client = await this.getBackendClient(args.token);
            const result = await client.validateToken();
            // Type-safe access ke token validation response
            const projectId = result.project?.id ?? 'N/A';
            const projectName = result.project?.name ?? 'N/A';
            const envName = result.environment?.name ?? 'N/A';
            const envVars = result.environment?.variables ?? {};
            const lastValidated = result.lastValidatedAt ?? 'N/A';
            // Build response message dengan type-safe string interpolation
            const response = {
                content: [
                    {
                        type: 'text',
                        text: `✅ Token MCP Valid

Info Proyek:
- ID: ${projectId}
- Name: ${projectName}

Environment:
- Aktif: ${envName}
- Variabel: ${Object.keys(envVars).length} terkonfigurasi

Status Token: Valid
Terakhir Validasi: ${lastValidated}

Siap untuk operasi GASSAPI!`
                    }
                ]
            };
            // Log info token berhasil divalidasi
            logger.info('Token MCP berhasil divalidasi', { projectId, projectName }, 'AuthTools');
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error validasi tidak diketahui';
            const response = {
                content: [
                    {
                        type: 'text',
                        text: `❌ Validasi Token MCP Gagal

Error: ${errorMessage}

Cek dulu:
1. Token bener dan masih aktif
2. File gassapi.json ada di root project
3. Server backend bisa diakses

Validasi token gagal!`
                    }
                ],
                isError: true
            };
            // Log error validasi token gagal
            logger.error('Validasi token MCP gagal', { error: errorMessage }, 'AuthTools');
            return response;
        }
    }
    /**
     * Dapatkan status autentikasi sekarang dengan type-safe implementation
     */
    async getAuthStatus() {
        try {
            const config = await this.configLoader.detectProjectConfig();
            // Kalo config ga ada
            if (!config) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Status Autentikasi

Konfigurasi: ❌ Ketemu
- gassapi.json: Ga ada di direktori parent

Cara setup:
1. Bikin project lewat GASSAPI web dashboard
2. Generate konfigurasi MCP
3. Simpen sebagai gassapi.json di root project`
                        }
                    ]
                };
            }
            // Type-safe access ke config properties
            const projectName = config.project.name ?? 'Tanpa Nama';
            const projectId = config.project.id;
            const serverURL = this.configLoader.getServerURL(config);
            // Cek validitas token
            try {
                const client = await this.getBackendClient();
                const result = await client.validateToken();
                // Type-safe access ke validation result
                const lastValidated = result.lastValidatedAt ?? 'Pertama kali';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Status Autentikasi

Konfigurasi: ✅ Ketemu
- gassapi.json: Ketemu dan valid
- Proyek: ${projectName} (${projectId})
- Server: ${serverURL}

Token: ✅ Valid
- Akses Proyek: Diberikan
- Terakhir Validasi: ${lastValidated}

Status: 🟢 Siap untuk operasi GASSAPI`
                        }
                    ]
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📋 Status Autentikasi

Konfigurasi: ✅ Ketemu
- gassapi.json: Ketemu
- Proyek: ${projectName} (${projectId})
- Server: ${serverURL}

Token: ❌ Invalid
- Error: ${errorMessage}
- Status: Ga terautentikasi

Cek token lagi atau regenerate konfigurasi MCP`
                        }
                    ],
                    isError: true
                };
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Status Autentikasi

Konfigurasi: ❌ Error
- Error: ${errorMessage}

Cek file konfigurasi gassapi.json`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Dapatkan informasi konteks proyek dengan type-safe implementation
     */
    async getProjectContext(args) {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('Konfigurasi GASSAPI ga ketemu');
            }
            const projectId = args.project_id || config.project.id;
            const client = await this.getBackendClient();
            const context = await client.getProjectContext(projectId);
            // Type-safe environment formatting - handle both UnifiedEnvironment and GassapiEnvironment
            const environments = context.environments.map((env) => {
                // Safe access dengan fallback untuk is_default property
                const isDefault = 'is_default' in env ? env.is_default : false;
                return `- ${env.name} (ID: ${env.id}, Default: ${isDefault ? 'Ya' : 'Tidak'})`;
            }).join('\n');
            // Type-safe collection formatting dengan proper endpoint count handling
            const collections = context.collections && context.collections.length > 0
                ? context.collections.map((col) => {
                    // Handle both endpoint_count and endpoints.length untuk backward compatibility
                    const endpointCount = col.endpoint_count ?? col.endpoints?.length ?? 0;
                    return `- ${col.name} (ID: ${col.id}, Endpoint: ${endpointCount})`;
                }).join('\n')
                : 'Ga ada koleksi yang ketemu';
            // Type-safe project information access
            const projectName = context.project.name ?? 'Tanpa Nama';
            const projectDescription = context.project.description ?? 'Ga ada deskripsi';
            const environmentCount = context.environments?.length ?? 0;
            const collectionCount = context.collections?.length ?? 0;
            return {
                content: [
                    {
                        type: 'text',
                        text: `📋 Konteks Proyek

Proyek: ${projectName} (${context.project.id})
Deskripsi: ${projectDescription}

Environment (${environmentCount}):
${environments}

Koleksi (${collectionCount}):
${collections}

Status: 🟢 Proyek berhasil dimuat`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Gagal Muat Konteks Proyek

Error: ${errorMessage}

Cek dulu:
1. ID proyek bener
2. Token MCP valid
3. Punya akses ke proyeknya

Pemuatan konteks proyek gagal!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Refresh autentikasi (bersihin cache dan validasi ulang) dengan proper error handling
     */
    async refreshAuth() {
        try {
            // Bersihin cache dulu dengan type-safe operation
            this.configLoader.clearCache();
            this.backendClient = null; // Reset client instance
            // Validasi token lagi dengan empty args object
            const validationResult = await this.validateMcpToken({});
            // Cek hasil validasi untuk memberikan response yang lebih informatif
            if (validationResult.isError) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `⚠️ Refresh Autentikasi Selesai

Cache: ✅ Dibersihin
Token: ❌ Validasi gagal
Status: ⚠️ Perlu perhatian

Cache dibersihin tapi token validation gagal.
Cek konfigurasi token dan coba lagi.`
                        }
                    ],
                    isError: true
                };
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `🔄 Autentikasi Di-refresh

Cache: ✅ Dibersihin
Token: ✅ Di-validasi ulang
Status: 🟢 Siap untuk operasi baru

Cache autentikasi dibersihin dan token di-validasi ulang!`
                    }
                ]
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error tidak diketahui';
            return {
                content: [
                    {
                        type: 'text',
                        text: `❌ Refresh Autentikasi Gagal

Error: ${errorMessage}

Cek konfigurasi kamu dan coba lagi.

Refresh autentikasi gagal!`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Dapatkan daftar tool autentikasi
     */
    getTools() {
        return [validate_mcp_token];
    }
    /**
     * Handle pemanggilan tool dengan type-safe argument validation
     */
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'validate_mcp_token':
                // Type validation untuk token argument
                const tokenArg = args.token;
                return this.validateMcpToken({ token: tokenArg });
            default:
                throw new Error(`Tool autentikasi tidak diketahui: ${toolName}`);
        }
    }
}
// Export untuk registrasi MCP server
export const authTools = new AuthTools();
export const AUTH_TOOLS = [validate_mcp_token];
//# sourceMappingURL=auth.js.map