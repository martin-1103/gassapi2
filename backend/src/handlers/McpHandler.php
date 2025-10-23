<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\JwtHelper;
use App\Helpers\ValidationHelper;
use App\Repositories\McpTokenRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\EnvironmentRepository;

class McpHandler {
    private $tokens;
    private $projects;
    private $envs;

    public function __construct() {
        $this->tokens = new McpTokenRepository();
        $this->projects = new ProjectRepository();
        $this->envs = new EnvironmentRepository();
    }

    /**
     * POST /project/{id}/generate-config
     * Issues a permanent MCP token and returns suggested gassapi.json
     */
    public function generateConfig($projectId) {
        if (!$projectId) { ResponseHelper::error('Project ID is required', 400); }
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) { ResponseHelper::error('Unauthorized', 401); }
        $userId = $payload['sub'];

        // Ensure access
        $project = $this->projects->findForUser($projectId, $userId);
        if (!$project) { ResponseHelper::error('Project not found', 404); }

        // Issue token
        $issued = $this->tokens->issueToken($projectId, $userId);

        // Collect environments
        $envs = $this->envs->listByProject($projectId);

        $config = [
            'name' => $project['name'],
            'project_id' => $project['id'],
            'api_base_url' => ($_ENV['APP_URL'] ?? 'http://localhost') . '/gassapi2/backend/',
            'mcp_validate_endpoint' => '/mcp/validate',
            'token' => $issued['token'], // plaintext token for client storage
            'environments' => array_map(function($e) {
                return [
                    'id' => $e['id'],
                    'name' => $e['name'],
                    'is_default' => (bool)$e['is_default'],
                    'variables' => json_decode($e['variables'] ?: '{}', true)
                ];
            }, $envs)
        ];

        ResponseHelper::created($config, 'MCP config generated');
    }

    /**
     * GET /mcp/validate
     * Authorization: Bearer <mcp_token>
     */
    public function validateToken() {
        // Accept token from Authorization header or query/body
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? null;
        $plain = null;
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $m)) {
            $plain = trim($m[1]);
        }
        if (!$plain) {
            // Try from query parameter first
            $plain = $_GET['token'] ?? null;

            // If still no token, try from body (for POST requests)
            if (!$plain && $_SERVER['REQUEST_METHOD'] === 'POST') {
                $input = ValidationHelper::getJsonInput();
                $plain = $input['token'] ?? null;
            }
        }
        if (!$plain) {
            ResponseHelper::error('No token provided', 401);
        }

        $rec = $this->tokens->findActiveByPlainToken($plain);
        if (!$rec) {
            ResponseHelper::error('Invalid token', 401);
        }

        // Update last_validated_at
        $this->tokens->setLastValidatedNow($rec['id']);

        // Return project context
        $project = $this->projects->findById($rec['project_id']);
        $envs = $this->envs->listByProject($rec['project_id']);
        ResponseHelper::success([
            'project' => $project,
            'environments' => $envs
        ], 'Token valid');
    }
}
