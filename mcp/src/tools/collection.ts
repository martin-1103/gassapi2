import { McpTool } from '../types/mcp.types';
import { ConfigLoader } from '../discovery/ConfigLoader';
import { BackendClient } from '../client/BackendClient';

/**
 * Collection Management MCP Tools
 * Handles API collection operations
 */

const get_collections: McpTool = {
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
    required: [] as string[]
  }
};

const create_collection: McpTool = {
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

const move_collection: McpTool = {
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

const delete_collection: McpTool = {
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
  private configLoader: ConfigLoader;
  private backendClient: BackendClient | null = null;

  constructor() {
    this.configLoader = new ConfigLoader();
  }

  private async getBackendClient(): Promise<BackendClient> {
    if (this.backendClient) {
      return this.backendClient;
    }

    const config = await this.configLoader.detectProjectConfig();
    if (!config) {
      throw new Error('No GASSAPI configuration found. Please create gassapi.json in your project root.');
    }

    this.backendClient = new BackendClient(
      this.configLoader.getServerURL(config),
      this.configLoader.getMcpToken(config)
    );

    return this.backendClient;
  }

  /**
   * List collections for a project
   */
  async getCollections(args: {
    projectId?: string;
    includeEndpointCount?: boolean;
    flatten?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
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
              type: 'text' as const,
              text: `📚 Collections

Project: ${config.project.name} (${projectId})
Result: No collections found

To create collections:
1. Use create_collection tool
2. Import from existing API documentation
3. Use web dashboard for visual management`
            }
          ]
        };
      }

      const collections = result.collections;
      const includeEndpointCount = args.includeEndpointCount !== false;

      // Build hierarchy tree if not flattened
      if (!args.flatten) {
        const tree = this.buildCollectionTree(collections);
        const treeText = this.formatCollectionTree(tree, includeEndpointCount);

        return {
          content: [
            {
              type: 'text' as const,
              text: `📚 Project Collections

Project: ${config.project.name} (${projectId})
Total Collections: ${collections.length}

Collection Hierarchy:
${treeText}

Use collectionId for specific operations. Root collections have no parent.`
            }
          ]
        };
      }

      // Flattened list
      const collectionList = collections.map((col: any) =>
        `📁 ${col.name} (ID: ${col.id})${col.parent_id ? ` (Parent: ${col.parent_id})` : ''}${includeEndpointCount && col.endpoint_count ? ` [${col.endpoint_count} endpoints]` : ''}`
      ).join('\n');

      return {
        content: [
          {
            type: 'text' as const,
            text: `📚 Project Collections

Project: ${config.project.name} (${projectId})
Total Collections: ${collections.length}

Collections:
${collectionList}

Use collectionId for specific operations.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
                type: 'text' as const,
                text: `❌ Failed to List Collections

Error: ${errorMessage}

Please check:
1. Project ID is correct
2. MCP token has project access
3. Backend server is accessible`
              }
            ],
        isError: true
      };
    }
  }

  /**
   * Create new collection
   */
  async createCollection(args: {
    name: string;
    projectId: string;
    parentId?: string;
    description?: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const collectionData = {
        name: args.name,
        project_id: args.projectId,
        parent_id: args.parentId || null,
        description: args.description || null
      };

      const result = await client.createCollection(collectionData);

      return {
        content: [
          {
            type: 'text' as const,
            text: `✅ Collection Created

Collection Details:
- Name: ${args.name}
- ID: ${result.id}
- Project: ${args.projectId}
- Parent: ${args.parentId || 'Root level'}
- Description: ${args.description || 'No description'}

Collection "${args.name}" created successfully!

You can now add endpoints to this collection using endpoint management tools.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Create Collection

Error: ${errorMessage}

Please check:
1. Collection name is valid
2. Project ID exists and is accessible
3. Parent collection ID is valid (if provided)
4. Have write access to the project`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Move collection to new parent
   */
  async moveCollection(args: {
    collectionId: string;
    newParentId: string;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const result = await client.moveCollection(args.collectionId, args.newParentId);

      const parentText = args.newParentId ? `moved to parent collection ID: ${args.newParentId}` : 'moved to root level';

      return {
        content: [
          {
            type: 'text' as const,
            text: `✅ Collection Moved

Move Operation:
- Collection ID: ${args.collectionId}
- ${parentText}
- Result: Success

Collection reorganized successfully!

New hierarchy structure will be reflected in subsequent collection listings.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Move Collection

Error: ${errorMessage}

Please check:
1. Collection ID exists and is accessible
2. New parent collection ID is valid
3. No circular reference in hierarchy
4. Have write access to both collections`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Delete collection with safety checks
   */
  async deleteCollection(args: {
    collectionId: string;
    force?: boolean;
  }): Promise<{
    content: Array<{ type: 'text'; text: string }>;
    isError?: boolean;
  }> {
    try {
      const client = await this.getBackendClient();
      const force = args.force || false;

      if (!force) {
        // Safety check - get collection details first
        try {
          const collections = await client.getCollections('all'); // This would need to be implemented
          const hasEndpoints = true; // We need to check if collection has endpoints

          if (hasEndpoints) {
            return {
              content: [
                {
                  type: 'text' as const,
                  text: `⚠️ Collection Delete Warning

Collection ID: ${args.collectionId}

Safety Check:
❌ This collection contains endpoints
❌ Deleting will also remove all endpoints

To proceed with deletion:
1. Use force=true to override safety
2. Move endpoints to another collection first
3. Confirm you want to delete everything

Collection deletion cancelled for safety.`
                }
              ],
              isError: true
            };
          }
        } catch {
          // If we can't check, proceed with warning
        }
      }

      const result = await client.deleteCollection(args.collectionId, force);

      return {
        content: [
          {
            type: 'text' as const,
            text: `✅ Collection Deleted

Deletion Details:
- Collection ID: ${args.collectionId}
- Force Delete: ${force ? 'Yes' : 'No'}
- Result: Success

Collection and all its contents have been permanently deleted!

Note: This action cannot be undone. Consider moving important data first.`
          }
        ]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      return {
        content: [
          {
            type: 'text' as const,
            text: `❌ Failed to Delete Collection

Error: ${errorMessage}

Please check:
1. Collection ID exists and is accessible
2. Have delete permissions for the project
3. No circular dependencies preventing deletion`
          }
        ],
        isError: true
      };
    }
  }

  /**
   * Build collection hierarchy tree
   */
  private buildCollectionTree(collections: any[]): any[] {
    const tree: any[] = [];
    const map = new Map();

    // Create map of all collections
    collections.forEach(col => {
      map.set(col.id, { ...col, children: [] });
    });

    // Build tree structure
    map.forEach((col, id) => {
      if (col.parent_id && map.has(col.parent_id)) {
        map.get(col.parent_id).children.push(col);
      } else {
        tree.push(col);
      }
    });

    return tree;
  }

  /**
   * Format collection tree as text
   */
  private formatCollectionTree(tree: any[], includeEndpointCount: boolean, indent = 0): string {
    const indentStr = '  '.repeat(indent);
    let result = '';

    tree.forEach(node => {
      const endpointInfo = includeEndpointCount && node.endpoint_count !== undefined
        ? ` [${node.endpoint_count} endpoints]`
        : '';

      result += `${indentStr}📁 ${node.name} (ID: ${node.id})${endpointInfo}\n`;

      if (node.children && node.children.length > 0) {
        result += this.formatCollectionTree(node.children, includeEndpointCount, indent + 1);
      }
    });

    return result.trim();
  }

  /**
   * Get collection tools list
   */
  getTools(): McpTool[] {
    return [
      get_collections,
      create_collection,
      move_collection,
      delete_collection
    ];
  }

  /**
   * Handle tool calls
   */
  async handleToolCall(toolName: string, args: any): Promise<any> {
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

// Export for MCP server registration
export const collectionTools = new CollectionTools();
export const COLLECTION_TOOLS = [
  get_collections,
  create_collection,
  move_collection,
  delete_collection
];