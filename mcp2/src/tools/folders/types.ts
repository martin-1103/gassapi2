/**
 * Folder Types - Reusable interfaces for folder operations
 * Extracted from folders.ts to improve modularity
 */

import { Folder, FolderListResponse, FolderDetailsResponse } from '../../shared/types/index.js';

// Folder tree structure
export interface FolderTreeNode {
  id: string;
  name: string;
  description?: string;
  endpoint_count?: number;
  children: FolderTreeNode[];
  level: number;
  parent_id?: string;
  project_id: string;
  created_at?: string;
  updated_at?: string;
}

// Folder request/response types
export interface ListFoldersRequest {
  projectId?: string;
  parentId?: string;
  includeTree?: boolean;
  activeOnly?: boolean;
}

export interface ListFoldersResponse extends FolderListResponse {
  tree?: FolderTreeNode[];
  error?: string;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parentId?: string;
  projectId?: string;
}

export interface CreateFolderResponse {
  success: boolean;
  data?: Folder;
  message?: string;
  error?: string;
  details?: string[];
}

export interface UpdateFolderRequest {
  folderId: string;
  name?: string;
  description?: string;
  parentId?: string;
}

export interface UpdateFolderResponse {
  success: boolean;
  data?: Folder;
  message?: string;
  error?: string;
  details?: string[];
}

export interface MoveFolderRequest {
  folderId: string;
  newParentId?: string;
}

export interface MoveFolderResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DeleteFolderResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Folder validation
export interface FolderValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// Folder service interfaces
export interface FolderService {
  listFolders(request: ListFoldersRequest): Promise<ListFoldersResponse>;
  getFolderDetails(folderId: string): Promise<FolderDetailsResponse>;
  createFolder(request: CreateFolderRequest): Promise<CreateFolderResponse>;
  updateFolder(request: UpdateFolderRequest): Promise<UpdateFolderResponse>;
  moveFolder(request: MoveFolderRequest): Promise<MoveFolderResponse>;
  deleteFolder(folderId: string): Promise<DeleteFolderResponse>;
  buildFolderTree(folders: Folder[]): FolderTreeNode[];
}

// Folder management operations
export interface FolderManager {
  duplicateFolder(folderId: string, newName: string, newParentId?: string): Promise<CreateFolderResponse>;
  exportFolderStructure(): Promise<string>;
  importFolderStructure(data: string): Promise<CreateFolderResponse>;
  reorderFolders(folderIds: string[]): Promise<boolean>;
}

// Folder statistics
export interface FolderStats {
  totalFolders: number;
  totalEndpoints: number;
  maxDepth: number;
  averageEndpointsPerFolder: number;
  emptyFolders: number;
}

// Re-export shared types for convenience
export {
  Folder,
  FolderListResponse,
  FolderDetailsResponse
};