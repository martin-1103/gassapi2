<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\MessageHelper;
use App\Helpers\AuthHelper;
use App\Helpers\JwtHelper;
use App\Repositories\ProjectRepository;
use App\Repositories\EnvironmentRepository;
use App\Repositories\CollectionRepository;
use App\Services\AuthService;

class ProjectHandler {
    private $projects;
    private $envs;
    private $collections;
    private $authService;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->envs = new EnvironmentRepository();
        $this->collections = new CollectionRepository();
        $this->authService = new AuthService();
    }

    /**
     * POST /projects - Create project
     */
    public function create() {
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];

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
                'variables' => '{}',  // JSON string instead of object
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
        $user = AuthHelper::requireAuth();
        $userId = $user['id'];
        $list = $this->projects->listForUser($userId, 100, 0);
        ResponseHelper::success($list, 'Projects fetched');
    }

    /**
     * GET /project/{id}
     */
    public function getById($id) {
        if (!$id) { ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400); }

        $user = AuthHelper::requireProjectAccess($id);

        $project = $this->projects->findById($id);
        if (!$project) { ResponseHelper::error(MessageHelper::ERROR_NOT_FOUND, 404); }

        // add member count
        $project['member_count'] = $this->projects->countMembers($id);
        ResponseHelper::success($project, 'Project detail');
    }

    /**
     * GET /project/{id}/context - Get project context with environments and collections
     * Supports both JWT and MCP tokens
     */
    public function getContext($id) {
        if (!$id) { ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400); }

        $user = AuthHelper::requireProjectAccess($id);

        // Get project details
        $project = $this->projects->findById($id);
        if (!$project) { ResponseHelper::error(MessageHelper::ERROR_NOT_FOUND, 404); }

        // Get environments
        $environments = $this->envs->listByProject($id);
        $environments = array_map(function($env) {
            return [
                'id' => $env['id'],
                'name' => $env['name'],
                'description' => $env['description'],
                'is_default' => (bool)$env['is_default'],
                'variables' => json_decode($env['variables'] ?: '{}', true),
                'created_at' => $env['created_at'],
                'updated_at' => $env['updated_at']
            ];
        }, $environments);

        // Get collections
        $collections = $this->collections->listByProject($id);
        $collections = array_map(function($collection) {
            return [
                'id' => $collection['id'],
                'name' => $collection['name'],
                'description' => $collection['description'],
                'endpoint_count' => $collection['endpoint_count'] ?? 0,
                'created_at' => $collection['created_at'],
                'updated_at' => $collection['updated_at']
            ];
        }, $collections);

        $context = [
            'project' => [
                'id' => $project['id'],
                'name' => $project['name'],
                'description' => $project['description'],
                'created_at' => $project['created_at'],
                'updated_at' => $project['updated_at']
            ],
            'environments' => $environments,
            'collections' => $collections,
            'user' => [
                'id' => $user['id'],
                'token_type' => $user['token_type'],
                'authenticated' => true
            ]
        ];

        ResponseHelper::success($context, 'Project context fetched successfully');
    }

    /**
     * PUT /project/{id}
     */
    public function update($id) {
        if (!$id) { ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400); }
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }

        $user = $this->authService->validateAccessToken($token);
        if (!$user) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }
        $userId = $user['id'];

        if (!$this->projects->isOwner($id, $userId)) {
            ResponseHelper::error(MessageHelper::ERROR_FORBIDDEN, 403);
        }

        $input = ValidationHelper::getJsonInput();
        $data = [];
        if (isset($input['name'])) {
            $name = ValidationHelper::sanitize($input['name']);
            // Validate that name is not empty after sanitization
            if (empty(trim($name))) {
                ResponseHelper::error('Project name cannot be empty', 400);
            }
            $data['name'] = $name;
        }
        if (isset($input['description'])) { $data['description'] = ValidationHelper::sanitize($input['description']); }
        if (isset($input['is_public'])) { $data['is_public'] = (int)!!$input['is_public']; }

        if (empty($data)) {
            ResponseHelper::error(MessageHelper::ERROR_NO_DATA_TO_UPDATE, 400);
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
        if (!$id) { ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400); }
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }

        $user = $this->authService->validateAccessToken($token);
        if (!$user) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }
        $userId = $user['id'];

        if (!$this->projects->isOwner($id, $userId)) {
            ResponseHelper::error(MessageHelper::ERROR_FORBIDDEN, 403);
        }

        try {
            $this->projects->delete($id);
            ResponseHelper::success(['id' => $id], 'Project deleted successfully');
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
        if (!$token) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }

        $user = $this->authService->validateAccessToken($token);
        if (!$user) { ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401); }
        $userId = $user['id'];

        // inviter must be member
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error(MessageHelper::ERROR_FORBIDDEN, 403);
        }

        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['user_id']);
        $invitee = $input['user_id'];

        if ($invitee === $userId) {
            ResponseHelper::error(MessageHelper::ERROR_BAD_REQUEST, 400);
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
