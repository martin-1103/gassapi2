<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\CollectionRepository;

class CollectionHandler {
    private $projects;
    private $collections;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->collections = new CollectionRepository();
    }

    /**
     * GET /project/{id}/collections
     */
    public function getAll($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->collections->listByProject($projectId);
        ResponseHelper::success($list, 'Collections fetched');
    }

    /**
     * POST /project/{id}/collections
     */
    public function create($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
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

        // Validate parent collection if provided
        if ($parentId) {
            $parentCollection = $this->collections->findById($parentId);
            if (!$parentCollection) {
                ResponseHelper::error('Parent collection not found', 400);
            }
            if ($parentCollection['project_id'] !== $projectId) {
                ResponseHelper::error('Parent collection must belong to the same project', 400);
            }
        }

        try {
            // If setting as default, unset other defaults
            if ($isDefault) {
                $this->collections->unsetDefaultForProject($projectId);
            }

            $collectionId = $this->collections->createForProject($projectId, [
                'name' => $name,
                'description' => $description,
                'parent_id' => $parentId,
                'headers' => $headers,
                'variables' => $variables,
                'is_default' => $isDefault,
                'created_by' => $userId
            ]);
            
            $collection = $this->collections->findById($collectionId);
            ResponseHelper::created($collection, 'Collection created');
        } catch (\Exception $e) {
            error_log('Collection create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create collection', 500);
        }
    }

    /**
     * GET /collection/{id}
     */
    public function getById($id) {
        if (!$id) { 
            ResponseHelper::error('Collection ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $collection = $this->collections->findById($id);
        if (!$collection) { 
            ResponseHelper::error('Collection not found', 404); 
        }
        
        if (!$this->projects->isMember($collection['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        ResponseHelper::success($collection, 'Collection detail');
    }

    /**
     * PUT /collection/{id}
     */
    public function update($id) {
        if (!$id) { 
            ResponseHelper::error('Collection ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $collection = $this->collections->findById($id);
        if (!$collection) { 
            ResponseHelper::error('Collection not found', 404); 
        }
        
        if (!$this->projects->isMember($collection['project_id'], $userId)) {
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
                $this->collections->unsetDefaultForProject($collection['project_id']);
            }

            $this->collections->updateCollection($id, $data);
            $updated = $this->collections->findById($id);
            ResponseHelper::success($updated, 'Collection updated successfully');
        } catch (\Exception $e) {
            error_log('Collection update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update collection', 500);
        }
    }

    /**
     * DELETE /collection/{id}
     */
    public function delete($id) {
        if (!$id) { 
            ResponseHelper::error('Collection ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $collection = $this->collections->findById($id);
        if (!$collection) { 
            ResponseHelper::error('Collection not found', 404); 
        }
        
        if (!$this->projects->isMember($collection['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->collections->delete($id);
            ResponseHelper::success(['id' => $id], 'Collection deleted successfully');
        } catch (\Exception $e) {
            error_log('Collection delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete collection', 500);
        }
    }

    private function requireUserId() {
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { 
            ResponseHelper::error('Unauthorized', 401); 
        }
        return $payload['sub'];
    }
}
