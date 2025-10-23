<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\EnvironmentRepository;

class EnvironmentHandler {
    private $projects;
    private $envs;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->envs = new EnvironmentRepository();
    }

    /**
     * GET /project/{id}/environments
     */
    public function getAll($projectId) {
        if (!$projectId) { ResponseHelper::error('Project ID is required', 400); }
        $userId = $this->requireUserId();
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        $list = $this->envs->listByProject($projectId);
        ResponseHelper::success($list, 'Environments fetched');
    }

    /**
     * POST /project/{id}/environments
     */
    public function create($projectId) {
        if (!$projectId) { ResponseHelper::error('Project ID is required', 400); }
        $userId = $this->requireUserId();
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['name']);
        $name = ValidationHelper::sanitize($input['name']);
        $description = isset($input['description']) ? ValidationHelper::sanitize($input['description']) : null;
        $variables = $input['variables'] ?? new \stdClass();
        $isDefault = isset($input['is_default']) ? (int)!!$input['is_default'] : 0;

        try {
            $envId = $this->envs->createForProject($projectId, [
                'name' => $name,
                'description' => $description,
                'variables' => $variables,
                'is_default' => $isDefault
            ]);
            $env = $this->envs->findById($envId);
            ResponseHelper::created($env, 'Environment created');
        } catch (\Exception $e) {
            error_log('Environment create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create environment', 500);
        }
    }

    /**
     * GET /environment/{id}
     */
    public function getById($id) {
        if (!$id) { ResponseHelper::error('Environment ID is required', 400); }
        $userId = $this->requireUserId();
        $env = $this->envs->findById($id);
        if (!$env) { ResponseHelper::error('Environment not found', 404); }
        if (!$this->projects->isMember($env['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        ResponseHelper::success($env, 'Environment detail');
    }

    /**
     * PUT /environment/{id}
     */
    public function update($id) {
        if (!$id) { ResponseHelper::error('Environment ID is required', 400); }
        $userId = $this->requireUserId();
        $env = $this->envs->findById($id);
        if (!$env) { ResponseHelper::error('Environment not found', 404); }
        if (!$this->projects->isMember($env['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        $input = ValidationHelper::getJsonInput();
        $data = [];
        if (isset($input['name'])) { $data['name'] = ValidationHelper::sanitize($input['name']); }
        if (isset($input['description'])) { $data['description'] = ValidationHelper::sanitize($input['description']); }
        if (isset($input['variables'])) { $data['variables'] = is_array($input['variables']) ? json_encode($input['variables']) : $input['variables']; }
        if (isset($input['is_default'])) { $data['is_default'] = (int)!!$input['is_default']; }

        try {
            if (isset($data['is_default']) && $data['is_default']) {
                $this->envs->unsetDefaultForProject($env['project_id']);
            }
            $this->envs->update($id, $data);
            $updated = $this->envs->findById($id);
            ResponseHelper::success($updated, 'Environment updated');
        } catch (\Exception $e) {
            error_log('Environment update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update environment', 500);
        }
    }

    /**
     * DELETE /environment/{id}
     */
    public function delete($id) {
        if (!$id) { ResponseHelper::error('Environment ID is required', 400); }
        $userId = $this->requireUserId();
        $env = $this->envs->findById($id);
        if (!$env) { ResponseHelper::error('Environment not found', 404); }
        if (!$this->projects->isMember($env['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            // Check if it's the last environment for the project
            $list = $this->envs->listByProject($env['project_id']);
            if (count($list) <= 1) {
                ResponseHelper::error('Cannot delete the last environment', 400);
            }
            $this->envs->delete($id);
            ResponseHelper::success(['id' => $id], 'Environment deleted');
        } catch (\Exception $e) {
            error_log('Environment delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete environment', 500);
        }
    }

    private function requireUserId() {
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        return $payload['sub'];
    }
}
