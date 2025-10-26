/**
 * Folder Service
 * Handles folder-related operations with backend
 */

import { HttpClient } from '../../../shared/http/HttpClient.js';
import { ValidationUtils, ErrorUtils, StringUtils } from '../../../shared/utils/index.js';
import {
  ListFoldersRequest,
  ListFoldersResponse,
  CreateFolderRequest,
  CreateFolderResponse,
  UpdateFolderRequest,
  UpdateFolderResponse,
  MoveFolderRequest,
  MoveFolderResponse,
  DeleteFolderResponse,
  FolderValidationResult,
  FolderTreeNode,
  Folder,
  FolderStats
} from '../types.js';

export class FolderService {
  private httpClient: HttpClient;
  private baseUrl: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.httpClient = new HttpClient({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * List folders for a project
   */
  async listFolders(request: ListFoldersRequest): Promise<ListFoldersResponse> {
    try {
      if (!request.projectId) {
        return {
          success: false,
          error: 'Project ID is required'
        };
      }

      const params = new URLSearchParams();
      if (request.parentId) {
        params.append('parent_id', request.parentId);
      }
      if (request.activeOnly !== false) {
        params.append('is_active', 'true');
      }

      const url = `${this.baseUrl}/?act=project_folders&id=${request.projectId}${params.toString() ? '&' + params.toString() : ''}`;
      const response = await this.httpClient.get<any>(url);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const foldersData = response.data.data || response.data;

        // Ensure foldersData is an array
        if (!Array.isArray(foldersData)) {
          return {
            success: false,
            error: 'Invalid response format: expected array of folders'
          };
        }

        let result: ListFoldersResponse = {
          success: true,
          data: foldersData,
          message: `Retrieved ${foldersData.length} folders`
        };

        // Build tree if requested
        if (request.includeTree) {
          result.tree = this.buildFolderTree(foldersData);
        }

        return result;
      }

      return {
        success: false,
        error: response.error || 'Failed to retrieve folders'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Get folder details
   */
  async getFolderDetails(folderId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/?act=folder&id=${folderId}`;
      const response = await this.httpClient.get(url);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const folderData = response.data.data || response.data;

        return {
          success: true,
          data: folderData
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to get folder details'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Create a new folder
   */
  async createFolder(request: CreateFolderRequest): Promise<CreateFolderResponse> {
    try {
      // Validate request
      const validation = this.validateCreateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        };
      }

      const url = `${this.baseUrl}/?act=folder_create&id=${request.projectId}`;
      const createData = {
        name: request.name.trim(),
        description: request.description?.trim(),
        parent_id: request.parentId,
        project_id: request.projectId
      };

      const response = await this.httpClient.post(url, createData);

      if (response.success && response.data) {
        // Handle nested response structure from backend
        const folderData = response.data.data || response.data;

        return {
          success: true,
          data: folderData,
          message: 'Folder created successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to create folder'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Update folder
   */
  async updateFolder(request: UpdateFolderRequest): Promise<UpdateFolderResponse> {
    try {
      // Validate request
      const validation = this.validateUpdateRequest(request);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Validation failed',
          details: validation.errors
        };
      }

      const url = `${this.baseUrl}/?act=folder_update&id=${request.folderId}`;
      const updateData: any = {};

      if (request.name !== undefined) {
        updateData.name = request.name.trim();
      }
      if (request.description !== undefined) {
        updateData.description = request.description?.trim() || null;
      }
      if (request.parentId !== undefined) {
        updateData.parent_id = request.parentId;
      }

      const response = await this.httpClient.patch(url, updateData);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
          message: 'Folder updated successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to update folder'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Move folder to new parent
   */
  async moveFolder(request: MoveFolderRequest): Promise<MoveFolderResponse> {
    try {
      const url = `${this.baseUrl}/?act=folder_update&id=${request.folderId}`;
      const moveData = {
        parent_id: request.newParentId
      };

      const response = await this.httpClient.post(url, moveData);

      if (response.success) {
        return {
          success: true,
          message: 'Folder moved successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to move folder'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Delete folder
   */
  async deleteFolder(folderId: string): Promise<DeleteFolderResponse> {
    try {
      const url = `${this.baseUrl}/?act=folder&id=${folderId}`;
      const response = await this.httpClient.delete(url);

      if (response.success) {
        return {
          success: true,
          message: 'Folder deleted successfully'
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to delete folder'
      };

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Build folder tree from flat list
   */
  buildFolderTree(folders: Folder[]): FolderTreeNode[] {
    const folderMap = new Map<string, FolderTreeNode>();
    const rootFolders: FolderTreeNode[] = [];

    // Create all nodes first
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        id: folder.id,
        name: folder.name,
        description: folder.description,
        endpoint_count: 0, // Will be updated later
        children: [],
        level: 0,
        parent_id: folder.folder_id,
        project_id: folder.project_id,
        created_at: folder.created_at,
        updated_at: folder.updated_at
      });
    });

    // Build tree structure
    folders.forEach(folder => {
      const node = folderMap.get(folder.id)!;
      const parentId = folder.folder_id;

      if (parentId && folderMap.has(parentId)) {
        const parent = folderMap.get(parentId)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootFolders.push(node);
      }
    });

    // Sort by name at each level
    const sortChildren = (nodes: FolderTreeNode[]) => {
      nodes.sort((a, b) => a.name.localeCompare(b.name));
      nodes.forEach(node => sortChildren(node.children));
    };

    sortChildren(rootFolders);

    return rootFolders;
  }

  /**
   * Duplicate folder
   */
  async duplicateFolder(folderId: string, newName: string, newParentId?: string): Promise<CreateFolderResponse> {
    try {
      // Get source folder details
      const sourceDetails = await this.getFolderDetails(folderId);

      if (!sourceDetails.success || !sourceDetails.data) {
        return {
          success: false,
          error: 'Failed to get source folder details'
        };
      }

      // Create duplicate
      const createRequest: CreateFolderRequest = {
        name: newName,
        description: sourceDetails.data.description
          ? `Copy of: ${sourceDetails.data.description}`
          : 'Duplicated folder',
        parentId: newParentId || sourceDetails.data.folder_id,
        projectId: sourceDetails.data.project_id
      };

      return await this.createFolder(createRequest);

    } catch (error) {
      return {
        success: false,
        error: ErrorUtils.extractMessage(error)
      };
    }
  }

  /**
   * Get folder statistics
   */
  async getFolderStats(projectId: string): Promise<FolderStats> {
    try {
      const foldersResponse = await this.listFolders({
        projectId,
        includeTree: true
      });

      if (!foldersResponse.success || !foldersResponse.data) {
        throw new Error('Failed to retrieve folders');
      }

      const folders = foldersResponse.data;
      const tree = foldersResponse.tree || [];

      let totalEndpoints = 0;
      let maxDepth = 0;
      let emptyFolders = 0;

      const calculateDepth = (nodes: FolderTreeNode[], currentDepth: number = 0) => {
        maxDepth = Math.max(maxDepth, currentDepth);
        nodes.forEach(node => {
          if (node.endpoint_count !== undefined) {
            totalEndpoints += node.endpoint_count;
            if (node.endpoint_count === 0) {
              emptyFolders++;
            }
          }
          if (node.children.length > 0) {
            calculateDepth(node.children, currentDepth + 1);
          }
        });
      };

      calculateDepth(tree);

      return {
        totalFolders: folders.length,
        totalEndpoints,
        maxDepth: maxDepth + 1,
        averageEndpointsPerFolder: folders.length > 0 ? totalEndpoints / folders.length : 0,
        emptyFolders
      };

    } catch (error) {
      throw new Error(`Failed to calculate folder stats: ${ErrorUtils.extractMessage(error)}`);
    }
  }

  /**
   * Export folder structure
   */
  async exportFolderStructure(projectId: string): Promise<string> {
    try {
      const foldersResponse = await this.listFolders({
        projectId,
        includeTree: true
      });

      if (!foldersResponse.success || !foldersResponse.tree) {
        throw new Error('Failed to retrieve folder structure');
      }

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        projectId,
        tree: foldersResponse.tree
      };

      return JSON.stringify(exportData, null, 2);

    } catch (error) {
      throw new Error(`Export failed: ${ErrorUtils.extractMessage(error)}`);
    }
  }

  /**
   * Validate create folder request
   */
  private validateCreateRequest(request: CreateFolderRequest): FolderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!request.name || request.name.trim().length === 0) {
      errors.push('Folder name is required');
    }

    if (request.name && request.name.length > 100) {
      errors.push('Folder name must be 100 characters or less');
    }

    if (request.description && request.description.length > 500) {
      warnings.push('Description is very long (>500 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate update folder request
   */
  private validateUpdateRequest(request: UpdateFolderRequest): FolderValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (request.name !== undefined && request.name.length > 0) {
      if (request.name.trim().length === 0) {
        errors.push('Folder name cannot be empty');
      }
      if (request.name.length > 100) {
        errors.push('Folder name must be 100 characters or less');
      }
    }

    if (request.description !== undefined && request.description.length > 500) {
      warnings.push('Description is very long (>500 characters)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }
}