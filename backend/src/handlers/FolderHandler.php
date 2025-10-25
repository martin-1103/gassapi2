<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Helpers\AuthHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\FolderRepository;

class FolderHandler {
    private $projects;
    private $folders;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->folders = new FolderRepository();
    }

    /**
     * GET /project/{id}/folders
     */
    public function getAll($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->folders->listByProject($projectId);
        ResponseHelper::success($list, 'Folders fetched');
    }

    /**
     * POST /project/{id}/folders
     */
    public function create($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['name']);
        
        $name = ValidationHelper::sanitize($input['name']);
        $description = isset($input['description']) ? ValidationHelper::sanitize($input['description']) : null;
        $parentId = isset($input['parent_id']) ? ValidationHelper::sanitize($input['parent_id']) : null;
        $headers = $input['headers'] ?? new \stdClass();
        $variables = $input['variables'] ?? new \stdClass();
        $isDefault = isset($input['is_default']) ? (int)!!$input['is_default'] : 0;

        // Validate parent folder if provided
        if ($parentId) {
            $parentFolder = $this->folders->findById($parentId);
            if (!$parentFolder) {
                ResponseHelper::error('Parent folder not found', 400);
            }
            if ($parentFolder['project_id'] !== $projectId) {
                ResponseHelper::error('Parent folder must belong to the same project', 400);
            }
        }

        try {
            // If setting as default, unset other defaults
            if ($isDefault) {
                $this->folders->unsetDefaultForProject($projectId);
            }

            $folderId = $this->folders->createForProject($projectId, [
                'name' => $name,
                'description' => $description,
                'parent_id' => $parentId,
                'headers' => $headers,
                'variables' => $variables,
                'is_default' => $isDefault,
                'created_by' => $userId
            ]);
            
            $folder = $this->folders->findById($folderId);
            ResponseHelper::created($folder, 'Folder created');
        } catch (\Exception $e) {
            error_log('Folder create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create folder', 500);
        }
    }

    /**
     * GET /folder/{id}
     */
    public function getById($id) {
        if (!$id) { 
            ResponseHelper::error('Folder ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $folder = $this->folders->findById($id);
        if (!$folder) { 
            ResponseHelper::error('Folder not found', 404); 
        }
        
        if (!$this->projects->isMember($folder['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        ResponseHelper::success($folder, 'Folder detail');
    }

    /**
     * PUT /folder/{id}
     */
    public function update($id) {
        if (!$id) { 
            ResponseHelper::error('Folder ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $folder = $this->folders->findById($id);
        if (!$folder) { 
            ResponseHelper::error('Folder not found', 404); 
        }
        
        if (!$this->projects->isMember($folder['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        $data = [];
        
        if (isset($input['name'])) { 
            $data['name'] = ValidationHelper::sanitize($input['name']); 
        }
        if (isset($input['description'])) { 
            $data['description'] = ValidationHelper::sanitize($input['description']); 
        }
        if (isset($input['parent_id'])) { 
            $data['parent_id'] = ValidationHelper::sanitize($input['parent_id']); 
        }
        if (isset($input['headers'])) { 
            $data['headers'] = $input['headers']; 
        }
        if (isset($input['variables'])) { 
            $data['variables'] = $input['variables']; 
        }
        if (isset($input['is_default'])) { 
            $data['is_default'] = (int)!!$input['is_default']; 
        }

        try {
            // If setting as default, unset other defaults
            if (isset($data['is_default']) && $data['is_default']) {
                $this->folders->unsetDefaultForProject($folder['project_id']);
            }

            $this->folders->updateFolder($id, $data);
            $updated = $this->folders->findById($id);
            ResponseHelper::success($updated, 'Folder updated successfully');
        } catch (\Exception $e) {
            error_log('Folder update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update folder', 500);
        }
    }

    /**
     * DELETE /folder/{id}
     */
    public function delete($id) {
        if (!$id) { 
            ResponseHelper::error('Folder ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $folder = $this->folders->findById($id);
        if (!$folder) { 
            ResponseHelper::error('Folder not found', 404); 
        }
        
        if (!$this->projects->isMember($folder['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->folders->delete($id);
            ResponseHelper::success(['id' => $id], 'Folder deleted successfully');
        } catch (\Exception $e) {
            error_log('Folder delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete folder', 500);
        }
    }
}
