<?php
namespace App\Routes;

use App\Handlers\AuthHandler;
use App\Handlers\UserHandler;
use App\Handlers\HealthHandler;
use App\Handlers\ProjectHandler;
use App\Handlers\EnvironmentHandler;
use App\Handlers\McpHandler;

/**
 * API Routes definition
 */
class ApiRoutes {

    /**
     * Get all available routes
     */
    public static function getRoutes() {
        return [
            'GET' => [
                '/' => ['handler' => 'help', 'description' => 'API documentation'],
                '/health' => ['handler' => 'health', 'description' => 'Health check'],
                '/users' => ['handler' => 'users', 'description' => 'List all users'],
                '/users/stats' => ['handler' => 'users_stats', 'description' => 'User statistics'],
                '/user/{id}' => ['handler' => 'user', 'description' => 'Get user by ID'],
                '/profile' => ['handler' => 'profile', 'description' => 'Current user profile'],
                // Projects
                '/projects' => ['handler' => 'projects_list', 'description' => 'List projects'],
                '/project/{id}' => ['handler' => 'project_detail', 'description' => 'Get project by ID'],
                // Environments
                '/project/{id}/environments' => ['handler' => 'environments_list', 'description' => 'List environments for a project'],
                '/environment/{id}' => ['handler' => 'environment_detail', 'description' => 'Get environment detail'],
                // MCP
                '/mcp/validate' => ['handler' => 'mcp_validate', 'description' => 'Validate MCP token']
            ],
            'POST' => [
                '/login' => ['handler' => 'login', 'description' => 'User authentication'],
                '/register' => ['handler' => 'register', 'description' => 'User registration'],
                '/logout' => ['handler' => 'logout', 'description' => 'User logout'],
                '/refresh' => ['handler' => 'refresh', 'description' => 'Refresh access token'],
                '/logout-all' => ['handler' => 'logout_all', 'description' => 'Logout from all devices'],
                '/user/{id}' => ['handler' => 'user_update', 'description' => 'Update user'],
                '/profile' => ['handler' => 'profile_update', 'description' => 'Update current user profile'],
                '/change-password' => ['handler' => 'change_password', 'description' => 'Change user password'],
                // Projects
                '/projects' => ['handler' => 'project_create', 'description' => 'Create project'],
                '/project/{id}/members' => ['handler' => 'project_add_member', 'description' => 'Add member to project'],
                // Environments
                '/project/{id}/environments' => ['handler' => 'environment_create', 'description' => 'Create environment for a project'],
                // MCP
                '/project/{id}/generate-config' => ['handler' => 'mcp_generate_config', 'description' => 'Generate MCP config for project']
            ],
            'PUT' => [
                '/user/{id}' => ['handler' => 'user_update', 'description' => 'Update user'],
                '/user/{id}/toggle-status' => ['handler' => 'toggle_status', 'description' => 'Activate/Deactivate user'],
                // Projects
                '/project/{id}' => ['handler' => 'project_update', 'description' => 'Update project'],
                // Environments
                '/environment/{id}' => ['handler' => 'environment_update', 'description' => 'Update environment']
            ],
            'DELETE' => [
                '/user/{id}' => ['handler' => 'user_delete', 'description' => 'Delete user'],
                // Projects
                '/project/{id}' => ['handler' => 'project_delete', 'description' => 'Delete project'],
                // Environments
                '/environment/{id}' => ['handler' => 'environment_delete', 'description' => 'Delete environment']
            ]
        ];
    }

    /**
     * Get route handler based on request method and path
     */
    public static function resolveRoute($method, $path, $id = null) {
        $routes = self::getRoutes();

        if (!isset($routes[$method])) {
            return ['handler' => null, 'error' => 'Method not allowed'];
        }

        $methodRoutes = $routes[$method];

        // Check exact match
        if (isset($methodRoutes[$path])) {
            return ['handler' => $methodRoutes[$path]['handler'], 'error' => null];
        }

        // Check pattern match with ID (supports {id} anywhere in pattern)
        foreach ($methodRoutes as $pattern => $route) {
            if (strpos($pattern, '{id}') !== false && $id !== null) {
                $candidate = str_replace('{id}', $id, $pattern);
                if ($path === $candidate) {
                    return ['handler' => $route['handler'], 'error' => null];
                }
            }
        }

        return ['handler' => null, 'error' => 'Route not found'];
    }

    /**
     * Execute route handler
     */
    public static function execute($handler, $id = null) {
        $authHandler = new AuthHandler();
        $userHandler = new UserHandler();
        $healthHandler = new HealthHandler();
        $projectHandler = new ProjectHandler();
        $environmentHandler = new EnvironmentHandler();
        $mcpHandler = new McpHandler();

        switch ($handler) {
            case 'help':
                self::showHelp();
                break;
            case 'health':
                $healthHandler->getStatus();
                break;
            case 'login':
                $authHandler->login();
                break;
            case 'register':
                $authHandler->register();
                break;
            case 'logout':
                $authHandler->logout();
                break;
            case 'refresh':
                $authHandler->refresh();
                break;
            case 'logout_all':
                $authHandler->logoutAll();
                break;
            case 'change_password':
                $authHandler->changePassword();
                break;
            case 'users':
                $userHandler->getAll();
                break;
            case 'users_stats':
                $userHandler->getStats();
                break;
            case 'user':
                $userHandler->getById($id);
                break;
            case 'user_update':
                $userHandler->update($id);
                break;
            case 'user_delete':
                $userHandler->delete($id);
                break;
                        case 'toggle_status':
                $userHandler->toggleStatus($id);
                break;
            case 'profile':
                $userHandler->profile();
                break;
            case 'profile_update':
                $userHandler->updateProfile();
                break;
            // Project management
            case 'projects_list':
                $projectHandler->getAll();
                break;
            case 'project_create':
                $projectHandler->create();
                break;
            case 'project_detail':
                $projectHandler->getById($id);
                break;
            case 'project_update':
                $projectHandler->update($id);
                break;
            case 'project_delete':
                $projectHandler->delete($id);
                break;
            case 'project_add_member':
                $projectHandler->addMember($id);
                break;
            // Environment management
            case 'environments_list':
                $environmentHandler->getAll($id);
                break;
            case 'environment_detail':
                $environmentHandler->getById($id);
                break;
            case 'environment_create':
                $environmentHandler->create($id);
                break;
            case 'environment_update':
                $environmentHandler->update($id);
                break;
            case 'environment_delete':
                $environmentHandler->delete($id);
                break;
            // MCP integration
            case 'mcp_generate_config':
                $mcpHandler->generateConfig($id);
                break;
            case 'mcp_validate':
                $mcpHandler->validateToken();
                break;
            default:
                \App\Helpers\ResponseHelper::error('Handler not implemented', 501);
        }
    }

    /**
     * Show API documentation
     */
    private static function showHelp() {
        $routes = self::getRoutes();
        $endpoints = [];

        foreach ($routes as $method => $methodRoutes) {
            foreach ($methodRoutes as $path => $route) {
                $endpoints[] = [
                    'method' => $method,
                    'path' => $path,
                    'description' => $route['description']
                ];
            }
        }

        \App\Helpers\ResponseHelper::success([
            'api_name' => 'Backend PHP API',
            'version' => '1.0.0',
            'base_url' => '/gassapi/backend-php',
            'usage' => '?act=endpoint_name&id={id}',
            'endpoints' => $endpoints,
            'examples' => [
                [
                    'description' => 'Get API help',
                    'url' => '?act=help'
                ],
                [
                    'description' => 'Health check',
                    'url' => '?act=health'
                ],
                [
                    'description' => 'List all users',
                    'url' => '?act=users'
                ],
                [
                    'description' => 'Login user',
                    'method' => 'POST',
                    'url' => '?act=login',
                    'body' => [
                        'email' => 'user@example.com',
                        'password' => 'password123'
                    ]
                ]
            ]
        ], 'API Documentation');
    }
}