/**
 * Folders Module Index
 * Main entry point for folder operations
 */

// Export tools
export {
  folderTools,
  listFoldersTool,
  createFolderTool,
  updateFolderTool,
  deleteFolderTool,
  getFolderDetailsTool
} from './tools.js';

// Export handlers
export {
  handleListFolders,
  handleCreateFolder,
  handleUpdateFolder,
  handleDeleteFolder,
  handleGetFolderDetails
} from './handlers/folderHandlers.js';

// Export services
export { FolderService } from './services/FolderService.js';

// Export types
export * from './types.js';