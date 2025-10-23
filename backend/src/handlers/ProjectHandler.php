<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\EnvironmentRepository;

class ProjectHandler {
    private $projects;
    private $envs;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->envs = new EnvironmentRepository();
    }

    /**
     * POST /projects - Create project
     */
    public function create() {
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) {
            ResponseHelper::error('Unauthorized', 401);
        }
        $userId = $payload['sub'];

        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['name']);
        $name = ValidationHelper::sanitize($input['name']);
        $description = isset($input['description']) ? ValidationHelper::sanitize($input['description']) : null;

        try {
            $projectId = $this->projects->createWithOwner($userId, [
                'name' => $name,
                'description' => $description,
                'settings' => json_encode([ 'visibility' => 'private' ])
            ]);

            // Auto-create default environment
            $this->envs->createForProject($projectId, [
                'name' => 'development',
                'description' => 'Default development environment',
                'variables' => new \stdClass(),
                'is_default' => 1
            ]);

            $project = $this->projects->findById($projectId);
            ResponseHelper::created($project, 'Project created successfully');
        } catch (\Exception $e) {
            error_log('Project create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create project', 500);
        }
    }

    /**
     * GET /projects - List projects for current user
     */
    public function getAll() {
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) {
            ResponseHelper::error('Unauthorized', 401);
        }
        $userId = $payload['sub'];
        $list = $this->projects->listForUser($userId, 100, 0);
        ResponseHelper::success($list, 'Projects fetched');
    }

    /**
     * GET /project/{id}
     */
    public function getById($id) {
        if (!$id) { ResponseHelper::error('Project ID is required', 400); }
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        $userId = $payload['sub'];

        $project = $this->projects->findForUser($id, $userId);
        if (!$project) { ResponseHelper::error('Project not found', 404); }

        // add member count
        $project['member_count'] = $this->projects->countMembers($id);
        ResponseHelper::success($project, 'Project detail');
    }

    /**
     * PUT /project/{id}
     */
    public function update($id) {
        if (!$id) { ResponseHelper::error('Project ID is required', 400); }
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        $userId = $payload['sub'];

        if (!$this->projects->isOwner($id, $userId)) {
            ResponseHelper::error('Forbidden: owner only', 403);
        }

        $input = ValidationHelper::getJsonInput();
        $data = [];
        if (isset($input['name'])) { $data['name'] = ValidationHelper::sanitize($input['name']); }
        if (isset($input['description'])) { $data['description'] = ValidationHelper::sanitize($input['description']); }
        if (isset($input['is_public'])) { $data['is_public'] = (int)!!$input['is_public']; }

        if (empty($data)) {
            ResponseHelper::error('No valid fields to update', 400);
        }

        try {
            $this->projects->update($id, $data);
            $project = $this->projects->findById($id);
            ResponseHelper::success($project, 'Project updated');
        } catch (\Exception $e) {
            error_log('Project update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update project', 500);
        }
    }

    /**
     * DELETE /project/{id}
     */
    public function delete($id) {
        if (!$id) { ResponseHelper::error('Project ID is required', 400); }
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        $userId = $payload['sub'];

        if (!$this->projects->isOwner($id, $userId)) {
            ResponseHelper::error('Forbidden: owner only', 403);
        }

        try {
            $this->projects->delete($id);
            ResponseHelper::success(['id' => $id], 'Project deleted');
        } catch (\Exception $e) {
            error_log('Project delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete project', 500);
        }
    }

    /**
     * POST /project/{id}/members
     */
    public function addMember($projectId) {
        if (!$projectId) { ResponseHelper::error('Project ID is required', 400); }
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        $userId = $payload['sub'];

        // inviter must be member
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden: members only', 403);
        }

        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['user_id']);
        $invitee = $input['user_id'];

        if ($invitee === $userId) {
            ResponseHelper::error('Cannot invite yourself', 400);
        }

        try {
            $pmId = $this->projects->addMember($projectId, $invitee, $userId);
            ResponseHelper::created(['member_id' => $pmId], 'Member added');
        } catch (\Exception $e) {
            error_log('Add member error: ' . $e->getMessage());
            ResponseHelper::error('Failed to add member', 500);
        }
    }
}
