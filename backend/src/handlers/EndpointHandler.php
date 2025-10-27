<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Helpers\AuthHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\FolderRepository;
use App\Repositories\EndpointRepository;

class EndpointHandler {
    private $projects;
    private $folders;
    private $endpoints;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->folders = new FolderRepository();
        $this->endpoints = new EndpointRepository();
    }

    /**
     * GET /folder/{id}/endpoints
     */
    public function getAll($folderId) {
        if (!$folderId) { 
            ResponseHelper::error('Folder ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $folder = $this->folders->findById($folderId);
        if (!$folder) { 
            ResponseHelper::error('Folder not found', 404); 
        }
        
        if (!$this->projects->isMember($folder['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->endpoints->listByFolder($folderId);
        ResponseHelper::success($list, 'Endpoints fetched');
    }

    /**
     * POST /folder/{id}/endpoints
     */
    public function create($folderId) {
        if (!$folderId) { 
            ResponseHelper::error('Folder ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $folder = $this->folders->findById($folderId);
        if (!$folder) { 
            ResponseHelper::error('Folder not found', 404); 
        }
        
        if (!$this->projects->isMember($folder['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['name', 'method', 'url']);
        
        $name = ValidationHelper::sanitize($input['name']);
        $method = strtoupper(ValidationHelper::sanitize($input['method']));
        $url = ValidationHelper::sanitize($input['url']);
        $description = $input['description'] ?? null;
        $purpose = $input['purpose'] ?? null;
        $headers = $input['headers'] ?? new \stdClass();
        $body = $input['body'] ?? null;
        $requestParams = $input['request_params'] ?? null;
        $responseSchema = $input['response_schema'] ?? null;
        $headerDocs = $input['header_docs'] ?? null;

        // Validate HTTP method
        $validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        if (!in_array($method, $validMethods)) {
            ResponseHelper::error('Invalid HTTP method', 400);
        }

        try {
            $endpointId = $this->endpoints->createForFolder($folderId, [
                'name' => $name,
                'method' => $method,
                'url' => $url,
                'description' => $description,
                'purpose' => $purpose,
                'headers' => $headers,
                'body' => $body,
                'request_params' => $requestParams,
                'response_schema' => $responseSchema,
                'header_docs' => $headerDocs,
                'created_by' => $userId
            ]);
            
            $endpoint = $this->endpoints->findById($endpointId);
            ResponseHelper::created($endpoint, 'Endpoint created');
        } catch (\Exception $e) {
            error_log('Endpoint create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create endpoint', 500);
        }
    }

    /**
     * GET /endpoint/{id}
     */
    public function getById($id) {
        if (!$id) { 
            ResponseHelper::error('Endpoint ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $endpoint = $this->endpoints->findWithDetails($id);
        if (!$endpoint) { 
            ResponseHelper::error('Endpoint not found', 404); 
        }
        
        if (!$this->projects->isMember($endpoint['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        ResponseHelper::success($endpoint, 'Endpoint detail');
    }

    /**
     * PUT /endpoint/{id}
     */
    public function update($id) {
        if (!$id) { 
            ResponseHelper::error('Endpoint ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $endpoint = $this->endpoints->findWithDetails($id);
        if (!$endpoint) { 
            ResponseHelper::error('Endpoint not found', 404); 
        }
        
        if (!$this->projects->isMember($endpoint['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        $data = [];
        
        if (isset($input['name'])) { 
            $data['name'] = ValidationHelper::sanitize($input['name']); 
        }
        if (isset($input['method'])) { 
            $method = strtoupper(ValidationHelper::sanitize($input['method']));
            $validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
            if (!in_array($method, $validMethods)) {
                ResponseHelper::error('Invalid HTTP method', 400);
            }
            $data['method'] = $method;
        }
        if (isset($input['url'])) { 
            $data['url'] = ValidationHelper::sanitize($input['url']); 
        }
        if (isset($input['headers'])) { 
            $data['headers'] = $input['headers']; 
        }
        if (isset($input['body'])) {
            $data['body'] = $input['body'];
        }
        if (isset($input['description'])) {
            $data['description'] = ValidationHelper::sanitize($input['description']);
        }
        if (isset($input['purpose'])) {
            $data['purpose'] = ValidationHelper::sanitize($input['purpose']);
        }
        if (isset($input['request_params'])) {
            $data['request_params'] = $input['request_params'];
        }
        if (isset($input['response_schema'])) {
            $data['response_schema'] = $input['response_schema'];
        }
        if (isset($input['header_docs'])) {
            $data['header_docs'] = $input['header_docs'];
        }

        try {
            $this->endpoints->updateEndpoint($id, $data);
            $updated = $this->endpoints->findById($id);
            ResponseHelper::success($updated, 'Endpoint updated');
        } catch (\Exception $e) {
            error_log('Endpoint update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update endpoint', 500);
        }
    }

    /**
     * DELETE /endpoint/{id}
     */
    public function delete($id) {
        if (!$id) { 
            ResponseHelper::error('Endpoint ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        $endpoint = $this->endpoints->findWithDetails($id);
        if (!$endpoint) { 
            ResponseHelper::error('Endpoint not found', 404); 
        }
        
        if (!$this->projects->isMember($endpoint['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->endpoints->delete($id);
            ResponseHelper::success(['id' => $id], 'Endpoint deleted');
        } catch (\Exception $e) {
            error_log('Endpoint delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete endpoint', 500);
        }
    }

    /**
     * GET /project/{id}/endpoints - Get all endpoints for a project
     */
    public function getAllByProject($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->endpoints->listByProject($projectId);
        ResponseHelper::success($list, 'Endpoints fetched');
    }

    /**
     * GET /project/{id}/endpoints/grouped - Get endpoints grouped by folder
     */
    public function getGrouped($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $grouped = $this->endpoints->listGroupedByFolder($projectId);
        ResponseHelper::success($grouped, 'Grouped endpoints fetched');
    }
}
