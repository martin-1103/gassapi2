/**
 * Folder Tools Definition
 * MCP tool definitions for folder operations
 */

import { McpTool } from '../../types.js';
import {
  handleListFolders,
  handleCreateFolder,
  handleUpdateFolder,
  handleDeleteFolder,
  handleGetFolderDetails
} from './handlers/folderHandlers.js';

/**
 * List Folders Tool
 */
export const listFoldersTool: McpTool = {
  name: 'list_folders',
  description: 'List all folders for current project with optional tree view',
  inputSchema: {
    type: 'object',
    properties: {
      projectId: {
        type: 'string',
        description: 'Project ID (optional, will use current project if not provided)'
      },
      parentId: {
        type: 'string',
        description: 'Parent folder ID to filter subfolders'
      },
      includeTree: {
        type: 'boolean',
        description: 'Include hierarchical tree view',
        default: false
      },
      activeOnly: {
        type: 'boolean',
        description: 'Show only active folders',
        default: true
      }
    }
  },
  handler: handleListFolders
};

/**
 * Create Folder Tool
 */
export const createFolderTool: McpTool = {
  name: 'create_folder',
  description: 'Create a new folder in the project',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Folder name'
      },
      description: {
        type: 'string',
        description: 'Folder description'
      },
      parentId: {
        type: 'string',
        description: 'Parent folder ID (optional, creates root-level folder if not provided)'
      },
      projectId: {
        type: 'string',
        description: 'Project ID (optional, will use current project if not provided)'
      }
    },
    required: ['name']
  },
  handler: handleCreateFolder
};

/**
 * Update Folder Tool
 */
export const updateFolderTool: McpTool = {
  name: 'update_folder',
  description: 'Update folder name, description, or parent',
  inputSchema: {
    type: 'object',
    properties: {
      folderId: {
        type: 'string',
        description: 'Folder ID to update'
      },
      name: {
        type: 'string',
        description: 'New folder name'
      },
      description: {
        type: 'string',
        description: 'New folder description'
      },
      parentId: {
        type: 'string',
        description: 'New parent folder ID (null to move to root)'
      }
    },
    required: ['folderId']
  },
  handler: handleUpdateFolder
};


/**
 * Delete Folder Tool
 */
export const deleteFolderTool: McpTool = {
  name: 'delete_folder',
  description: 'Delete a folder and all its contents',
  inputSchema: {
    type: 'object',
    properties: {
      folderId: {
        type: 'string',
        description: 'Folder ID to delete'
      }
    },
    required: ['folderId']
  },
  handler: handleDeleteFolder
};

/**
 * Get Folder Details Tool
 */
export const getFolderDetailsTool: McpTool = {
  name: 'get_folder_details',
  description: 'Get detailed information about a specific folder',
  inputSchema: {
    type: 'object',
    properties: {
      folderId: {
        type: 'string',
        description: 'Folder ID to get details for'
      }
    },
    required: ['folderId']
  },
  handler: handleGetFolderDetails
};

/**
 * Export all folder tools
 */
export const folderTools = [
  listFoldersTool,
  createFolderTool,
  updateFolderTool,
  deleteFolderTool,
  getFolderDetailsTool
];