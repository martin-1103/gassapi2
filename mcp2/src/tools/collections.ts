/**
 * Collection Management Tools for GASSAPI MCP v2
 * Migrated from original collection tools with backend adaptation
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { getApiEndpoints } from '../lib/api/endpoints.js';

// API Response Interfaces
interface CollectionListResponse {
  success: boolean;
  data?: Array<{
    id: string;
    project_id: string;
    parent_id?: string;
    name: string;
    description?: string;
    endpoint_count?: number;
    created_at: string;
    updated_at: string;
  }>;
  message?: string;
}

interface CollectionCreateResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description?: string;
    parent_id?: string;
    project_id: string;
    created_at: string;
    updated_at: string;
  };
  message?: string;
}

interface CollectionMoveResponse {
  success: boolean;
  message?: string;
}

interface CollectionDeleteResponse {
  success: boolean;
  message?: string;
}

interface CollectionTreeNode {
  id: string;
  name: string;
  description?: string;
  endpoint_count?: number;
  children: CollectionTreeNode[];
  level: number;
}

// Singleton instances for collection tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize collection dependencies
 */
async function getCollectionDependencies() {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  if (!backendClient) {
    const config = await configManager.detectProjectConfig();
    if (!config) {
      throw new Error('No configuration found');
    }
    const token = configManager.getMcpToken(config);
    const serverUrl = configManager.getServerURL(config);
    if (!token || !serverUrl) {
      throw new Error('Missing token or server URL in configuration');
    }
    backendClient = new BackendClient(serverUrl, token);
  }
  return { configManager, backendClient };
}

/**
 * Build collection tree from flat list
 */
function buildCollectionTree(collections: any[]): CollectionTreeNode[] {
  const collectionMap = new Map<string, CollectionTreeNode>();
  const rootCollections: CollectionTreeNode[] = [];

  // Create all nodes first
  collections.forEach(collection => {
    collectionMap.set(collection.id, {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      endpoint_count: collection.endpoint_count || 0,
      children: [],
      level: 0
    });
  });

  // Build hierarchy
  collections.forEach(collection => {
    const node = collectionMap.get(collection.id)!;

    if (collection.parent_id && collectionMap.has(collection.parent_id)) {
      const parent = collectionMap.get(collection.parent_id)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      rootCollections.push(node);
    }
  });

  // Sort children by name
  const sortChildren = (nodes: CollectionTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => sortChildren(node.children));
  };

  sortChildren(rootCollections);
  return rootCollections;
}

/**
 * Format collection tree as text
 */
function formatCollectionTree(nodes: CollectionTreeNode[], level: number = 0): string {
  let result = '';

  nodes.forEach(node => {
    const indent = '  '.repeat(level);
    const bullet = level === 0 ? '📁' : '📂';
    const count = node.endpoint_count || 0;
    const description = node.description ? ` - ${node.description}` : '';

    result += `${indent}${bullet} ${node.name} (${node.id}) [${count} endpoints]${description}\n`;

    if (node.children.length > 0) {
      result += formatCollectionTree(node.children, level + 1);
    }
  });

  return result;
}

// Tool: get_collections
export const getCollectionsTool: McpTool = {
  name: 'get_collections',
  description: 'List all collections for a project with hierarchical structure',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: {
        type: 'string',
        description: 'Optional project ID (uses project from config if not provided)'
      },
      include_endpoint_count: {
        type: 'boolean',
        description: 'Include endpoint count for each collection',
        default: true
      },
      flatten: {
        type: 'boolean',
        description: 'Show flattened list instead of tree structure',
        default: false
      }
    }
  }
};

// Tool: create_collection
export const createCollectionTool: McpTool = {
  name: 'create_collection',
  description: 'Create a new collection in a project',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Collection name (required)'
      },
      project_id: {
        type: 'string',
        description: 'Project ID to create collection in (required if not in config)'
      },
      parent_id: {
        type: 'string',
        description: 'Parent collection ID for nested collections (optional)'
      },
      description: {
        type: 'string',
        description: 'Collection description (optional)'
      }
    },
    required: ['name']
  }
};

// Tool: move_collection
export const moveCollectionTool: McpTool = {
  name: 'move_collection',
  description: 'Move a collection to a new parent or root level',
  inputSchema: {
    type: 'object',
    properties: {
      collection_id: {
        type: 'string',
        description: 'Collection ID to move (required)'
      },
      new_parent_id: {
        type: 'string',
        description: 'New parent collection ID (use "root" for root level, required)'
      }
    },
    required: ['collection_id', 'new_parent_id']
  }
};

// Tool: delete_collection
export const deleteCollectionTool: McpTool = {
  name: 'delete_collection',
  description: 'Delete a collection (with safety checks for endpoints)',
  inputSchema: {
    type: 'object',
    properties: {
      collection_id: {
        type: 'string',
        description: 'Collection ID to delete (required)'
      },
      force: {
        type: 'boolean',
        description: 'Force delete without confirmation (use with caution)',
        default: false
      }
    },
    required: ['collection_id']
  }
};

/**
 * Collection tool handlers
 */
export function createCollectionToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [getCollectionsTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getCollectionDependencies();

        // Get project ID from args or config
        let projectId = args.project_id as string | undefined;
        if (!projectId) {
          const config = await configManager.detectProjectConfig();
          projectId = config?.project?.id;
          if (!projectId) {
            throw new Error('Project ID not found in config and not provided in arguments');
          }
        }

        const includeEndpointCount = args.include_endpoint_count !== false;
        const flatten = args.flatten === true;

        // Call backend to get collections
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('projectCollections', { id: projectId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[CollectionTools] Requesting collections from: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`HTTP ${result.status}: ${result.statusText}`);
        }

        const data = await result.json() as CollectionListResponse;

        if (data.success && data.data) {
          const collections = Array.isArray(data.data) ? data.data : [];

          let collectionsText = `📚 Collections List (${collections.length}):\n\n`;

          if (collections.length === 0) {
            collectionsText += 'No collections found for this project.\n';
            collectionsText += 'Use create_collection tool to add your first collection.\n';
          } else {
            if (flatten) {
              // Flattened list view
              collections.forEach((collection, index) => {
                const count = includeEndpointCount ? ` [${collection.endpoint_count || 0} endpoints]` : '';
                const description = collection.description ? ` - ${collection.description}` : '';
                collectionsText += `${index + 1}. ${collection.name} (${collection.id})${count}${description}\n`;
              });
            } else {
              // Tree structure view
              const tree = buildCollectionTree(collections);
              collectionsText += formatCollectionTree(tree);
            }
          }

          collectionsText += `\n📊 Total collections: ${collections.length}`;

          return {
            content: [
              {
                type: 'text',
                text: collectionsText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to list collections: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Collections list error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [createCollectionTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getCollectionDependencies();

        const name = args.name as string;
        const description = args.description as string | undefined;
        const parentId = args.parent_id as string | undefined;

        if (!name || name.trim() === '') {
          throw new Error('Collection name is required');
        }

        // Get project ID from args or config
        let projectId = args.project_id as string | undefined;
        if (!projectId) {
          const config = await configManager.detectProjectConfig();
          projectId = config?.project?.id;
          if (!projectId) {
            throw new Error('Project ID not found in config and not provided in arguments');
          }
        }

        // Create collection
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('collectionCreate', { id: projectId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[CollectionTools] Creating collection at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description?.trim() || null,
            parent_id: parentId || null
          })
        });

        if (!result.ok) {
          throw new Error(`Failed to create collection: HTTP ${result.status}`);
        }

        const data = await result.json() as CollectionCreateResponse;

        if (data.success && data.data) {
          const collection = data.data;

          let createText = `✅ Collection Created Successfully\n\n`;
          createText += `📁 Name: ${collection.name}\n`;
          createText += `🆔 ID: ${collection.id}\n`;
          createText += `📝 Description: ${collection.description || 'No description'}\n`;
          createText += `🏷️  Project: ${projectId}\n`;
          if (collection.parent_id) {
            createText += `📂 Parent: ${collection.parent_id}\n`;
          }
          createText += `📅 Created: ${collection.created_at}\n`;

          return {
            content: [
              {
                type: 'text',
                text: createText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to create collection: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Collection creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [moveCollectionTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getCollectionDependencies();

        const collectionId = args.collection_id as string;
        const newParentId = args.new_parent_id as string;

        if (!collectionId) {
          throw new Error('Collection ID is required');
        }

        if (!newParentId) {
          throw new Error('New parent ID is required (use "root" for root level)');
        }

        // Move collection (using update endpoint with parent_id)
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('collectionUpdate', { id: collectionId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[CollectionTools] Moving collection at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parent_id: newParentId === 'root' ? null : newParentId
          })
        });

        if (!result.ok) {
          throw new Error(`Failed to move collection: HTTP ${result.status}`);
        }

        const data = await result.json() as CollectionCreateResponse; // Using same response type as create

        if (data.success && data.data) {
          const collection = data.data;
          let moveText = `✅ Collection Moved Successfully\n\n`;
          moveText += `📁 Collection: ${collection.name}\n`;
          moveText += `🆔 ID: ${collection.id}\n`;
          if (collection.parent_id) {
            moveText += `📍 New Parent: ${collection.parent_id}\n`;
          } else {
            moveText += `📍 New Location: Root level\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: moveText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to move collection: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Collection move error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [deleteCollectionTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getCollectionDependencies();

        const collectionId = args.collection_id as string;
        const force = args.force === true;

        if (!collectionId) {
          throw new Error('Collection ID is required');
        }

        // Delete collection
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('collectionDelete', {
          id: collectionId,
          force: force ? 'true' : 'false'
        });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[CollectionTools] Deleting collection at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`Failed to delete collection: HTTP ${result.status}`);
        }

        const data = await result.json() as CollectionDeleteResponse;

        if (data.success) {
          let deleteText = `✅ Collection Deleted Successfully\n\n`;
          deleteText += `📁 Collection ID: ${collectionId}\n`;
          deleteText += `⚠️  Force Delete: ${force ? 'Yes' : 'No'}\n`;
          if (force) {
            deleteText += `🔥 All child collections and endpoints have been deleted.\n`;
          }

          return {
            content: [
              {
                type: 'text',
                text: deleteText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to delete collection: ${data.message || 'Unknown error'}`
              }
            ],
            isError: true
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Collection deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const COLLECTION_TOOLS: McpTool[] = [
  getCollectionsTool,
  createCollectionTool,
  moveCollectionTool,
  deleteCollectionTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = COLLECTION_TOOLS;
export class ToolHandlers {
  static async handleGetCollections(args?: {
    project_id?: string;
    include_endpoint_count?: boolean;
    flatten?: boolean;
  }): Promise<McpToolResponse> {
    const handlers = createCollectionToolHandlers();
    return handlers.get_collections(args || {});
  }

  static async handleCreateCollection(args: {
    name: string;
    project_id?: string;
    parent_id?: string;
    description?: string;
  }): Promise<McpToolResponse> {
    const handlers = createCollectionToolHandlers();
    return handlers.create_collection(args);
  }

  static async handleMoveCollection(args: {
    collection_id: string;
    new_parent_id: string;
  }): Promise<McpToolResponse> {
    const handlers = createCollectionToolHandlers();
    return handlers.move_collection(args);
  }

  static async handleDeleteCollection(args: {
    collection_id: string;
    force?: boolean;
  }): Promise<McpToolResponse> {
    const handlers = createCollectionToolHandlers();
    return handlers.delete_collection(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createCollectionToolHandlers();
}