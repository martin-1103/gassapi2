/**
 * Folder Management Tools for GASSAPI MCP v2
 * Migrated from original folder tools with backend adaptation
 */

import { McpTool, McpToolResponse } from '../types.js';
import { ConfigManager } from '../config.js';
import { BackendClient } from '../client/BackendClient.js';
import { getApiEndpoints } from '../lib/api/endpoints.js';

// API Response Interfaces
interface FolderListResponse {
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

interface FolderCreateResponse {
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

interface FolderMoveResponse {
  success: boolean;
  message?: string;
}

interface FolderDeleteResponse {
  success: boolean;
  message?: string;
}

interface FolderTreeNode {
  id: string;
  name: string;
  description?: string;
  endpoint_count?: number;
  children: FolderTreeNode[];
  level: number;
}

// Singleton instances for folder tools
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Initialize folder dependencies
 */
async function getFolderDependencies() {
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
 * Build folder tree from flat list
 */
function buildFolderTree(folders: any[]): FolderTreeNode[] {
  const folderMap = new Map<string, FolderTreeNode>();
  const rootFolders: FolderTreeNode[] = [];

  // Create all nodes first
  folders.forEach(folder => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      description: folder.description,
      endpoint_count: folder.endpoint_count || 0,
      children: [],
      level: 0
    });
  });

  // Build hierarchy
  folders.forEach(folder => {
    const node = folderMap.get(folder.id)!;

    if (folder.parent_id && folderMap.has(folder.parent_id)) {
      const parent = folderMap.get(folder.parent_id)!;
      parent.children.push(node);
      node.level = parent.level + 1;
    } else {
      rootFolders.push(node);
    }
  });

  // Sort children by name
  const sortChildren = (nodes: FolderTreeNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    nodes.forEach(node => sortChildren(node.children));
  };

  sortChildren(rootFolders);
  return rootFolders;
}

/**
 * Format folder tree as text
 */
function formatFolderTree(nodes: FolderTreeNode[], level: number = 0): string {
  let result = '';

  nodes.forEach(node => {
    const indent = '  '.repeat(level);
    const bullet = level === 0 ? '📁' : '📂';
    const count = node.endpoint_count || 0;
    const description = node.description ? ` - ${node.description}` : '';

    result += `${indent}${bullet} ${node.name} (${node.id}) [${count} endpoints]${description}\n`;

    if (node.children.length > 0) {
      result += formatFolderTree(node.children, level + 1);
    }
  });

  return result;
}

// Tool: get_folders
export const getFoldersTool: McpTool = {
  name: 'get_folders',
  description: 'List all folders for a project with hierarchical structure',
  inputSchema: {
    type: 'object',
    properties: {
      include_endpoint_count: {
        type: 'boolean',
        description: 'Include endpoint count for each folder',
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

// Tool: create_folder
export const createFolderTool: McpTool = {
  name: 'create_folder',
  description: 'Create a new folder in a project',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Folder name (required)'
      },
      parent_id: {
        type: 'string',
        description: 'Parent folder ID for nested folders (optional)'
      },
      description: {
        type: 'string',
        description: 'Folder description (optional)'
      }
    },
    required: ['name']
  }
};

// Tool: move_folder
export const moveFolderTool: McpTool = {
  name: 'move_folder',
  description: 'Move a folder to a new parent or root level',
  inputSchema: {
    type: 'object',
    properties: {
      folder_id: {
        type: 'string',
        description: 'Folder ID to move (required)'
      },
      new_parent_id: {
        type: 'string',
        description: 'New parent folder ID (use "root" for root level, required)'
      }
    },
    required: ['folder_id', 'new_parent_id']
  }
};

// Tool: delete_folder
export const deleteFolderTool: McpTool = {
  name: 'delete_folder',
  description: 'Delete a folder (with safety checks for endpoints)',
  inputSchema: {
    type: 'object',
    properties: {
      folder_id: {
        type: 'string',
        description: 'Folder ID to delete (required)'
      },
      force: {
        type: 'boolean',
        description: 'Force delete without confirmation (use with caution)',
        default: false
      }
    },
    required: ['folder_id']
  }
};

/**
 * Folder tool handlers
 */
export function createFolderToolHandlers(): Record<string, (args: any) => Promise<McpToolResponse>> {
  return {
    [getFoldersTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFolderDependencies();

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

        // Call backend to get folders
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('projectFolders', { id: projectId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[FolderTools] Requesting folders from: ${fullUrl}`);

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

        const data = await result.json() as FolderListResponse;

        if (data.success && data.data) {
          const folders = Array.isArray(data.data) ? data.data : [];

          let foldersText = `📚 Folders List (${folders.length}):\n\n`;

          if (folders.length === 0) {
            foldersText += 'No folders found for this project.\n';
            foldersText += 'Use create_folder tool to add your first folder.\n';
          } else {
            if (flatten) {
              // Flattened list view
              folders.forEach((folder, index) => {
                const count = includeEndpointCount ? ` [${folder.endpoint_count || 0} endpoints]` : '';
                const description = folder.description ? ` - ${folder.description}` : '';
                foldersText += `${index + 1}. ${folder.name} (${folder.id})${count}${description}\n`;
              });
            } else {
              // Tree structure view
              const tree = buildFolderTree(folders);
              foldersText += formatFolderTree(tree);
            }
          }

          foldersText += `\n📊 Total folders: ${folders.length}`;

          return {
            content: [
              {
                type: 'text',
                text: foldersText
              }
            ]
          };
        } else {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Failed to list folders: ${data.message || 'Unknown error'}`
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
              text: `❌ Folders list error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [createFolderTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFolderDependencies();

        const name = args.name as string;
        const description = args.description as string | undefined;
        const parentId = args.parent_id as string | undefined;

        if (!name || name.trim() === '') {
          throw new Error('Folder name is required');
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

        // Create folder
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('folderCreate', { project_id: projectId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[FolderTools] Creating folder at: ${fullUrl}`);

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
          throw new Error(`Failed to create folder: HTTP ${result.status}`);
        }

        const data = await result.json() as FolderCreateResponse;

        if (data.success && data.data) {
          const folder = data.data;

          let createText = `✅ Folder Created Successfully\n\n`;
          createText += `📁 Name: ${folder.name}\n`;
          createText += `🆔 ID: ${folder.id}\n`;
          createText += `📝 Description: ${folder.description || 'No description'}\n`;
          createText += `🏷️  Project: ${projectId}\n`;
          if (folder.parent_id) {
            createText += `📂 Parent: ${folder.parent_id}\n`;
          }
          createText += `📅 Created: ${folder.created_at}\n`;

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
                text: `❌ Failed to create folder: ${data.message || 'Unknown error'}`
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
              text: `❌ Folder creation error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [moveFolderTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFolderDependencies();

        const folderId = args.folder_id as string;
        const newParentId = args.new_parent_id as string;

        if (!folderId) {
          throw new Error('Folder ID is required');
        }

        if (!newParentId) {
          throw new Error('New parent ID is required (use "root" for root level)');
        }

        // Move folder (using update endpoint with parent_id)
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('folderUpdate', { id: folderId });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[FolderTools] Moving folder at: ${fullUrl}`);

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
          throw new Error(`Failed to move folder: HTTP ${result.status}`);
        }

        const data = await result.json() as FolderCreateResponse; // Using same response type as create

        if (data.success && data.data) {
          const folder = data.data;
          let moveText = `✅ Folder Moved Successfully\n\n`;
          moveText += `📁 Folder: ${folder.name}\n`;
          moveText += `🆔 ID: ${folder.id}\n`;
          if (folder.parent_id) {
            moveText += `📍 New Parent: ${folder.parent_id}\n`;
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
                text: `❌ Failed to move folder: ${data.message || 'Unknown error'}`
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
              text: `❌ Folder move error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    },

    [deleteFolderTool.name]: async (args: Record<string, any>) => {
      try {
        const { configManager, backendClient } = await getFolderDependencies();

        const folderId = args.folder_id as string;
        const force = args.force === true;

        if (!folderId) {
          throw new Error('Folder ID is required');
        }

        // Delete folder
        const apiEndpoints = getApiEndpoints();
        const endpoint = apiEndpoints.getEndpoint('folderDelete', {
          id: folderId,
          force: force ? 'true' : 'false'
        });
        const fullUrl = `${backendClient.getBaseUrl()}${endpoint}`;

        console.error(`[FolderTools] Deleting folder at: ${fullUrl}`);

        const result = await fetch(fullUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${backendClient.getToken()}`,
            'Content-Type': 'application/json'
          }
        });

        if (!result.ok) {
          throw new Error(`Failed to delete folder: HTTP ${result.status}`);
        }

        const data = await result.json() as FolderDeleteResponse;

        if (data.success) {
          let deleteText = `✅ Folder Deleted Successfully\n\n`;
          deleteText += `📁 Folder ID: ${folderId}\n`;
          deleteText += `⚠️  Force Delete: ${force ? 'Yes' : 'No'}\n`;
          if (force) {
            deleteText += `🔥 All child folders and endpoints have been deleted.\n`;
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
                text: `❌ Failed to delete folder: ${data.message || 'Unknown error'}`
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
              text: `❌ Folder deletion error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    }
  };
}

// Export for server integration
export const FOLDER_TOOLS: McpTool[] = [
  getFoldersTool,
  createFolderTool,
  moveFolderTool,
  deleteFolderTool
];

// Legacy compatibility
export const TOOLS: McpTool[] = FOLDER_TOOLS;
export class ToolHandlers {
  static async handleGetFolders(args?: {
    project_id?: string;
    include_endpoint_count?: boolean;
    flatten?: boolean;
  }): Promise<McpToolResponse> {
    const handlers = createFolderToolHandlers();
    return handlers.get_folders(args || {});
  }

  static async handleCreateFolder(args: {
    name: string;
    project_id?: string;
    parent_id?: string;
    description?: string;
  }): Promise<McpToolResponse> {
    const handlers = createFolderToolHandlers();
    return handlers.create_folder(args);
  }

  static async handleMoveFolder(args: {
    folder_id: string;
    new_parent_id: string;
  }): Promise<McpToolResponse> {
    const handlers = createFolderToolHandlers();
    return handlers.move_folder(args);
  }

  static async handleDeleteFolder(args: {
    folder_id: string;
    force?: boolean;
  }): Promise<McpToolResponse> {
    const handlers = createFolderToolHandlers();
    return handlers.delete_folder(args);
  }
}

export function createToolHandlers(config: any): Record<string, (args: any) => Promise<McpToolResponse>> {
  return createFolderToolHandlers();
}