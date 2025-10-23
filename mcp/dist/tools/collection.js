import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';
/**
 * Tool koleksi MCP untuk management API
 * Handles operasi koleksi API
 */
const get_collections = {
    name: 'get_collections',
    description: 'List project collections with hierarchy',
    inputSchema: {
        type: 'object',
        properties: {
            projectId: {
                type: 'string',
                description: 'Project UUID (optional, will use config project if not provided)'
            },
            includeEndpointCount: {
                type: 'boolean',
                description: 'Include endpoint count in response',
                default: true
            },
            flatten: {
                type: 'boolean',
                description: 'Flatten hierarchy (no nesting)',
                default: false
            }
        },
        required: []
    }
};
const create_collection = {
    name: 'create_collection',
    description: 'Create new collection in project',
    inputSchema: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                description: 'Collection name'
            },
            projectId: {
                type: 'string',
                description: 'Project UUID'
            },
            parentId: {
                type: 'string',
                description: 'Parent collection UUID (optional for nested collections)'
            },
            description: {
                type: 'string',
                description: 'Collection description'
            }
        },
        required: ['name', 'projectId']
    }
};
const move_collection = {
    name: 'move_collection',
    description: 'Reorganize collection hierarchy by moving to new parent',
    inputSchema: {
        type: 'object',
        properties: {
            collectionId: {
                type: 'string',
                description: 'Collection UUID to move'
            },
            newParentId: {
                type: 'string',
                description: 'New parent collection UUID (null for root level)'
            }
        },
        required: ['collectionId', 'newParentId']
    }
};
const delete_collection = {
    name: 'delete_collection',
    description: 'Remove collection with safety checks and cascading delete',
    inputSchema: {
        type: 'object',
        properties: {
            collectionId: {
                type: 'string',
                description: 'Collection UUID to delete'
            },
            force: {
                type: 'boolean',
                description: 'Force delete without confirmation (use with caution)',
                default: false
            }
        },
        required: ['collectionId']
    }
};
export class CollectionTools {
    constructor() {
        this.backendClient = null;
        this.configLoader = new ConfigLoader();
    }
    async getBackendClient() {
        if (this.backendClient) {
            return this.backendClient;
        }
        const config = await this.configLoader.detectProjectConfig();
        if (!config) {
            throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
        }
        this.backendClient = new BackendClient(this.configLoader.getServerURL(config), this.configLoader.getMcpToken(config));
        return this.backendClient;
    }
    /**
     * List collections for a project
     */
    async getCollections(args) {
        try {
            const config = await this.configLoader.detectProjectConfig();
            if (!config) {
                throw new Error('No GASSAPI configuration found');
            }
            const projectId = args.projectId || config.project.id;
            const client = await this.getBackendClient();
            const result = await client.getCollections(projectId);
            if (!result.collections || result.collections.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📚 Koleksi

Project: ${config.project.name} (${projectId})
Hasil: Tidak ada koleksi ditemukan

Untuk membuat koleksi:
1. Gunakan tool create_collection
2. Import dari dokumentasi API yang ada
3. Gunakan web dashboard untuk visual management`
                        }
                    ]
                };
            }
            const collections = result.collections;
            const includeEndpointCount = args.includeEndpointCount !== false;
            // Build hierarchy tree if not flattened
            if (!args.flatten) {
                // Pastikan collections memiliki endpoint_count yang valid
                const normalizedCollections = collections.map(col => ({
                    ...col,
                    endpoint_count: col.endpoint_count || 0
                }));
                const tree = this.buildCollectionTree(normalizedCollections);
                const treeText = this.formatCollectionTree(tree, includeEndpointCount);
                return {
                    content: [
                        {
                            type: 'text',
                            text: `📚 Koleksi Project

Project: ${config.project.name} (${projectId})
Total Koleksi: ${collections.length}

Hierarki Koleksi:
${treeText}

Gunakan collectionId untuk operasi spesifik. Koleksi root tidak memiliki parent.`
                        }
                    ]
                };
            }
            // Flattened list - normalisasi endpoint_count untuk konsistensi
            const collectionList = collections.map((col) => {
                // Handle endpoint_count inconsistency - gunakan yang ada dari API atau default 0
                const endpointCount = col.endpoint_count !== undefined ? col.endpoint_count : 0;
                return `📁 ${col.name} (ID: ${col.id})${col.parent_id ? ` (Parent: ${col.parent_id})` : ''}${includeEndpointCount ? ` [${endpointCount} endpoints]` : ''}`;
            }).join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: `📚 Koleksi Project

Project: ${config.project.name} (${projectId})
Total Koleksi: ${collections.length}

Koleksi:
${collectionList}

Gunakan collectionId untuk operasi spesifik.`
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
                        text: `❌ Gagal Menampilkan Koleksi

Error: ${errorMessage}

Silakan periksa:
1. Project ID benar
2. MCP token memiliki akses project
3. Backend server dapat diakses`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Create new collection
     */
    async createCollection(args) {
        try {
            const client = await this.getBackendClient();
            const collectionData = {
                name: args.name,
                project_id: args.projectId,
                parent_id: args.parentId || undefined,
                description: args.description || undefined
            };
            const result = await client.createCollection(collectionData);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Koleksi Berhasil Dibuat

Detail Koleksi:
- Nama: ${args.name}
- ID: ${result.id}
- Project: ${args.projectId}
- Parent: ${args.parentId || 'Root level'}
- Deskripsi: ${args.description || 'Tidak ada deskripsi'}

Koleksi "${args.name}" berhasil dibuat!

Kamu sekarang bisa menambahkan endpoint ke koleksi ini menggunakan management endpoint tools.`
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
                        text: `❌ Gagal Membuat Koleksi

Error: ${errorMessage}

Silakan periksa:
1. Nama koleksi valid
2. Project ID ada dan dapat diakses
3. Parent collection ID valid (jika disediakan)
4. Memiliki akses write ke project`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Pindahkan koleksi ke parent baru
     */
    async moveCollection(args) {
        try {
            const client = await this.getBackendClient();
            const result = await client.moveCollection(args.collectionId, args.newParentId);
            const parentText = args.newParentId ? `dipindah ke parent collection ID: ${args.newParentId}` : 'dipindah ke root level';
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Koleksi Dipindahkan

Operasi Pindah:
- Collection ID: ${args.collectionId}
- ${parentText}
- Hasil: Berhasil

Koleksi berhasil direorganisasi!

Struktur hierarki baru akan terlihat pada listing koleksi selanjutnya.`
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
                        text: `❌ Gagal Memindahkan Koleksi

Error: ${errorMessage}

Silakan periksa:
1. Collection ID ada dan dapat diakses
2. New parent collection ID valid
3. Tidak ada circular reference di hierarchy
4. Memiliki akses write ke kedua koleksi`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Hapus koleksi dengan pemeriksaan keamanan
     */
    async deleteCollection(args) {
        try {
            const client = await this.getBackendClient();
            const force = args.force || false;
            if (!force) {
                // Safety check - dapatkan detail koleksi dulu
                try {
                    // Mendapatkan semua koleksi untuk mencari data koleksi yang akan dihapus
                    const config = await this.configLoader.detectProjectConfig();
                    if (config) {
                        const allCollections = await client.getCollections(config.project.id);
                        const targetCollection = allCollections.collections.find(col => col.id === args.collectionId);
                        if (targetCollection && (targetCollection.endpoint_count ?? 0) > 0) {
                            return {
                                content: [
                                    {
                                        type: 'text',
                                        text: `⚠️ Peringatan Hapus Koleksi

ID Koleksi: ${args.collectionId}
Nama Koleksi: ${targetCollection.name}

Pemeriksaan Keamanan:
❌ Koleksi ini mengandung ${targetCollection.endpoint_count ?? 0} endpoint
❌ Menghapus akan menghapus semua endpoint juga

Untuk melanjutkan penghapusan:
1. Gunakan force=true untuk override keamanan
2. Pindahkan endpoint ke koleksi lain dulu
3. Konfirmasi kamu ingin menghapus semuanya

Penghapusan koleksi dibatalkan untuk keamanan.`
                                    }
                                ],
                                isError: true
                            };
                        }
                    }
                }
                catch (error) {
                    // Jika tidak bisa cek, lanjut dengan warning
                    console.warn('Tidak bisa memeriksa detail koleksi, melanjutkan dengan hati-hati');
                }
            }
            const result = await client.deleteCollection(args.collectionId, force);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Koleksi Berhasil Dihapus

Detail Penghapusan:
- Collection ID: ${args.collectionId}
- Force Delete: ${force ? 'Ya' : 'Tidak'}
- Hasil: Berhasil

Koleksi dan semua isinya telah dihapus permanen!

Catatan: Aksi ini tidak bisa dibatalkan. Pertimbangkan untuk memindahkan data penting dulu.`
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
                        text: `❌ Gagal Menghapus Koleksi

Error: ${errorMessage}

Silakan periksa:
1. Collection ID ada dan dapat diakses
2. Memiliki permission delete untuk project
3. Tidak ada circular dependencies yang mencegah penghapusan`
                    }
                ],
                isError: true
            };
        }
    }
    /**
     * Bangun hierarchy tree koleksi dengan type safety
     */
    buildCollectionTree(collections) {
        const tree = [];
        const map = new Map();
        // Buat map dari semua koleksi dengan normalisasi endpoint_count
        collections.forEach(col => {
            // Pastikan endpoint_count selalu terdefinisi untuk consistency
            const normalizedEndpointCount = col.endpoint_count !== undefined ? col.endpoint_count : 0;
            const node = {
                collection: {
                    ...col,
                    endpoint_count: normalizedEndpointCount
                },
                children: [],
                endpointCount: normalizedEndpointCount,
                endpoint_count: normalizedEndpointCount // For API compatibility
            };
            map.set(col.id, node);
        });
        // Bangun struktur tree dengan validasi parent_id
        map.forEach((node, id) => {
            if (node.collection.parent_id && map.has(node.collection.parent_id)) {
                const parent = map.get(node.collection.parent_id);
                parent.children.push(node);
            }
            else {
                // Root level collection atau parent tidak ditemukan
                tree.push(node);
            }
        });
        return tree;
    }
    /**
     * Format collection tree sebagai text
     */
    formatCollectionTree(tree, includeEndpointCount, indent = 0) {
        const indentStr = '  '.repeat(indent);
        let result = '';
        tree.forEach(node => {
            // Normalisasi endpoint_count dengan type safety - gunakan nilai yang sudah dinormalisasi
            const endpointCount = node.collection.endpoint_count ?? 0;
            const endpointInfo = includeEndpointCount && endpointCount > 0
                ? ` [${endpointCount} endpoints]`
                : '';
            result += `${indentStr}📁 ${node.collection.name} (ID: ${node.collection.id})${endpointInfo}\n`;
            if (node.children && node.children.length > 0) {
                result += this.formatCollectionTree(node.children, includeEndpointCount, indent + 1);
            }
        });
        return result.trim();
    }
    /**
     * Dapatkan daftar tool koleksi
     */
    getTools() {
        return [
            get_collections,
            create_collection,
            move_collection,
            delete_collection
        ];
    }
    /**
     * Handle pemanggilan tool
     */
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'get_collections':
                return this.getCollections(args);
            case 'create_collection':
                return this.createCollection(args);
            case 'move_collection':
                return this.moveCollection(args);
            case 'delete_collection':
                return this.deleteCollection(args);
            default:
                throw new Error(`Unknown collection tool: ${toolName}`);
        }
    }
}
// Export untuk MCP server registration
export const collectionTools = new CollectionTools();
export const COLLECTION_TOOLS = [
    get_collections,
    create_collection,
    move_collection,
    delete_collection
];
//# sourceMappingURL=collection.js.map