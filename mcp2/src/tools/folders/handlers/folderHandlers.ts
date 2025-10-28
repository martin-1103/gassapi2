/**
 * Folder Handlers
 * Handles all folder-related requests
 */

import { McpToolResponse } from '../../../types.js';
import { ConfigManager } from '../../../config.js';
import { BackendClient } from '../../../client/BackendClient.js';
import { FolderService } from '../services/FolderService.js';
import {
  ListFoldersRequest,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
  FolderTreeNode
} from '../types.js';

// Initialize services
let configManager: ConfigManager | null = null;
let backendClient: BackendClient | null = null;

/**
 * Get singleton instances
 */
async function getInstances() {
  if (!configManager) {
    configManager = new ConfigManager();
    await configManager.detectProjectConfig();
  }
  if (!backendClient) {
    const mcpToken = configManager.getMcpToken();
    if (!mcpToken) {
      throw new Error('Configuration tidak lengkap: perlu mcpToken');
    }
    backendClient = new BackendClient(mcpToken);
  }
  return { configManager, backendClient };
}

/**
 * Format folder tree for display
 */
function formatFolderTree(nodes: FolderTreeNode[], prefix: string = ''): string {
  let result = '';

  nodes.forEach((node, index) => {
    const isLast = index === nodes.length - 1;
    const currentPrefix = isLast ? '└── ' : '├── ';
    const childPrefix = prefix + (isLast ? '    ' : '│   ');

    result += prefix + currentPrefix + node.name;
    if (node.endpoint_count) {
      result += ` (${node.endpoint_count} endpoints)`;
    }
    if (node.description) {
      result += ` - ${node.description}`;
    }
    result += '\n';

    if (node.children.length > 0) {
      result += formatFolderTree(node.children, childPrefix);
    }
  });

  return result;
}

/**
 * List folders handler
 */
export async function handleListFolders(args: any): Promise<McpToolResponse> {
  try {
    const { projectId, parentId, includeTree, activeOnly } = args;

    const instances = await getInstances();

    // Get project ID if not provided
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const config = await instances.configManager.detectProjectConfig();
      targetProjectId = config?.project?.id;
      if (!targetProjectId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Project ID not found in config and not provided in arguments'
              }, null, 2)
            }
          ]
        };
      }
    }

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // List folders
    const request: ListFoldersRequest = {
      projectId: targetProjectId,
      parentId,
      includeTree: includeTree || false,
      activeOnly: activeOnly !== false // default to true
    };

    const response = await folderService.listFolders(request);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to list folders',
              debug: response
            }, null, 2)
          }
        ]
      };
    }

    const folders = response.data || [];

    // Format response
    let folderText = `📁 Folders List (${folders.length}):\n\n`;

    if (folders.length === 0) {
      folderText += 'No folders found for this project.\n';
      folderText += 'Use create_folder tool to add your first folder.\n';
    } else if (includeTree && response.tree) {
      folderText += formatFolderTree(response.tree);
    } else {
      folders.forEach((folder: any, index: number) => {
        folderText += `${index + 1}. ${folder.name} (${folder.id})\n`;
        if (folder.description) {
          folderText += `   - ${folder.description}\n`;
        }
        folderText += '\n';
      });
    }

    return {
      content: [
        {
          type: 'text',
          text: folderText
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while listing folders'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Create folder handler
 */
export async function handleCreateFolder(args: any): Promise<McpToolResponse> {
  try {
    const { name, description, parentId, projectId } = args;

    if (!name) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Folder name is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Get project ID if not provided
    let targetProjectId = projectId;
    if (!targetProjectId) {
      const config = await instances.configManager.detectProjectConfig();
      targetProjectId = config?.project?.id;
      if (!targetProjectId) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: 'Project ID not found in config and not provided in arguments'
              }, null, 2)
            }
          ]
        };
      }
    }

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Create folder
    const createRequest: CreateFolderRequest = {
      name: name.trim(),
      description: description?.trim(),
      parentId,
      projectId: targetProjectId
    };

    const response = await folderService.createFolder(createRequest);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to create folder'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: response.data,
            message: 'Folder created successfully'
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while creating folder'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Update folder handler
 */
export async function handleUpdateFolder(args: any): Promise<McpToolResponse> {
  try {
    const { folderId, name, description, parentId } = args;

    if (!folderId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Folder ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Update folder
    const updateRequest: UpdateFolderRequest = {
      folderId,
      name: name?.trim(),
      description: description?.trim(),
      parentId
    };

    const response = await folderService.updateFolder(updateRequest);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to update folder'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            data: response.data,
            message: 'Folder updated successfully'
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while updating folder'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Move folder handler
 */
export async function handleMoveFolder(args: any): Promise<McpToolResponse> {
  try {
    const { folderId, newParentId } = args;

    if (!folderId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Folder ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Move folder
    const moveRequest: MoveFolderRequest = {
      folderId,
      newParentId
    };

    const response = await folderService.moveFolder(moveRequest);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to move folder'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Folder moved successfully'
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while moving folder'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Delete folder handler
 */
export async function handleDeleteFolder(args: any): Promise<McpToolResponse> {
  try {
    const { folderId } = args;

    if (!folderId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Folder ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Delete folder
    const response = await folderService.deleteFolder(folderId);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to delete folder'
            }, null, 2)
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            message: 'Folder deleted successfully'
          }, null, 2)
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while deleting folder'
          }, null, 2)
        }
      ]
    };
  }
}

/**
 * Get folder details handler
 */
export async function handleGetFolderDetails(args: any): Promise<McpToolResponse> {
  try {
    const { folderId } = args;

    if (!folderId) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: 'Folder ID is required'
            }, null, 2)
          }
        ]
      };
    }

    const instances = await getInstances();

    // Create folder service
    const folderService = new FolderService(
      instances.backendClient.getBaseUrl(),
      instances.backendClient.getToken()
    );

    // Get folder details
    const response = await folderService.getFolderDetails(folderId);

    if (!response.success) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: response.error || 'Failed to get folder details'
            }, null, 2)
          }
        ]
      };
    }

    const folder = response.data;

    // Format response
    let folderText = `📁 Folder Details:\n\n`;
    folderText += `Name: ${folder.name}\n`;
    folderText += `ID: ${folder.id}\n`;

    if (folder.description) {
      folderText += `Description: ${folder.description}\n`;
    }

    if (folder.project_id) {
      folderText += `Project ID: ${folder.project_id}\n`;
    }

    if (folder.folder_id) {
      folderText += `Parent Folder ID: ${folder.folder_id}\n`;
    }

    if (folder.endpoint_count !== undefined) {
      folderText += `Endpoint Count: ${folder.endpoint_count}\n`;
    }

    if (folder.created_at) {
      folderText += `Created: ${new Date(folder.created_at).toLocaleString()}\n`;
    }

    if (folder.updated_at) {
      folderText += `Updated: ${new Date(folder.updated_at).toLocaleString()}\n`;
    }

    return {
      content: [
        {
          type: 'text',
          text: folderText
        }
      ]
    };

  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message || 'Unknown error occurred while getting folder details'
          }, null, 2)
        }
      ]
    };
  }
}