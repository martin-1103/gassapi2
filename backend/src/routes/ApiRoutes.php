<?php
namespace App\Routes;

use App\Handlers\AuthHandler;
use App\Handlers\UserHandler;
use App\Handlers\HealthHandler;
use App\Handlers\ProjectHandler;
use App\Handlers\EnvironmentHandler;
use App\Handlers\FolderHandler;
use App\Handlers\EndpointHandler;
use App\Handlers\FlowHandler;
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
                '/project/{id}/context' => ['handler' => 'project_context', 'description' => 'Get project context with environments and folders'],
                // Environments
                '/project/{id}/environments' => ['handler' => 'environments_list', 'description' => 'List environments for a project'],
                '/environment/{id}' => ['handler' => 'environment_detail', 'description' => 'Get environment detail'],
                // Folders
                '/project/{id}/folders' => ['handler' => 'folders_list', 'description' => 'List folders for a project'],
                '/folder/{id}' => ['handler' => 'folder_detail', 'description' => 'Get folder detail'],
                // Endpoints
                '/folder/{id}/endpoints' => ['handler' => 'endpoints_list', 'description' => 'List endpoints for a folder'],
                '/folder/{id}/endpoints/list' => ['handler' => 'endpoint_list', 'description' => 'List endpoints for a folder (alias)'],
                '/endpoint/{id}' => ['handler' => 'endpoint_detail', 'description' => 'Get endpoint detail'],
                '/endpoint/{id}/get' => ['handler' => 'endpoint_get', 'description' => 'Get endpoint detail (alias)'],
                '/project/{id}/endpoints' => ['handler' => 'project_endpoints_list', 'description' => 'List all endpoints in a project'],
                '/project/{id}/endpoints/grouped' => ['handler' => 'project_endpoints_grouped', 'description' => 'List endpoints grouped by folder'],
                // Flows
                '/project/{id}/flows' => ['handler' => 'flows_list', 'description' => 'List flows for a project'],
                '/project/{id}/flows/active' => ['handler' => 'flows_active_list', 'description' => 'List active flows for a project'],
                '/flow/{id}' => ['handler' => 'flow_detail', 'description' => 'Get flow detail'],
                '/flow/{id}/ui' => ['handler' => 'flow_detail_ui', 'description' => 'Get flow detail for UI (React Flow format)'],
                '/flow/{id}/activate' => ['handler' => 'flow_activate', 'description' => 'Activate flow'],
                '/flow/{id}/deactivate' => ['handler' => 'flow_deactivate', 'description' => 'Deactivate flow'],
                '/flow/{id}/execute' => ['handler' => 'flow_execute', 'description' => 'Execute flow'],
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
                '/forgot-password' => ['handler' => 'forgot_password', 'description' => 'Request password reset'],
                '/reset-password' => ['handler' => 'reset_password', 'description' => 'Reset password with token'],
                // Projects
                '/projects' => ['handler' => 'project_create', 'description' => 'Create project'],
                '/project/{id}/members' => ['handler' => 'project_add_member', 'description' => 'Add member to project'],
                // Environments
                '/project/{id}/environments' => ['handler' => 'environment_create', 'description' => 'Create environment for a project'],
                // Folders
                '/project/{id}/folders' => ['handler' => 'folder_create', 'description' => 'Create folder for a project'],
                // Endpoints
                '/folder/{id}/endpoints' => ['handler' => 'endpoint_create', 'description' => 'Create endpoint for a folder'],
                // Flows
                '/project/{id}/flows' => ['handler' => 'flow_create', 'description' => 'Create flow for a project'],
                '/flow/{id}/duplicate' => ['handler' => 'flow_duplicate', 'description' => 'Duplicate a flow'],
                // MCP
                '/project/{id}/generate-config' => ['handler' => 'mcp_generate_config', 'description' => 'Generate MCP config for project']
            ],
            'PUT' => [
                '/user/{id}' => ['handler' => 'user_update', 'description' => 'Update user'],
                '/user/{id}/toggle-status' => ['handler' => 'toggle_status', 'description' => 'Activate/Deactivate user'],
                '/flow/{id}/activate' => ['handler' => 'flow_activate', 'description' => 'Activate flow'],
                '/flow/{id}/deactivate' => ['handler' => 'flow_deactivate', 'description' => 'Deactivate flow'],
                // Projects
                '/project/{id}' => ['handler' => 'project_update', 'description' => 'Update project'],
                // Environments
                '/environment/{id}' => ['handler' => 'environment_update', 'description' => 'Update environment'],
                // Folders
                '/folder/{id}' => ['handler' => 'folder_update', 'description' => 'Update folder'],
                // Endpoints
                '/endpoint/{id}' => ['handler' => 'endpoint_update', 'description' => 'Update endpoint'],
                // Flows
                '/flow/{id}' => ['handler' => 'flow_update', 'description' => 'Update flow'],
                '/flow/{id}/ui' => ['handler' => 'flow_update_ui', 'description' => 'Update flow from UI (React Flow format)'],
                '/flow/{id}/toggle-active' => ['handler' => 'flow_toggle_active', 'description' => 'Toggle flow active status']
            ],
            'DELETE' => [
                '/user/{id}' => ['handler' => 'user_delete', 'description' => 'Delete user'],
                '/flow/{id}/execute' => ['handler' => 'flow_execute', 'description' => 'Execute flow'],
                // Projects
                '/project/{id}' => ['handler' => 'project_delete', 'description' => 'Delete project'],
                // Environments
                '/environment/{id}' => ['handler' => 'environment_delete', 'description' => 'Delete environment'],
                // Folders
                '/folder/{id}' => ['handler' => 'folder_delete', 'description' => 'Delete folder'],
                // Endpoints
                '/endpoint/{id}' => ['handler' => 'endpoint_delete', 'description' => 'Delete endpoint'],
                // Flows
                '/flow/{id}' => ['handler' => 'flow_delete', 'description' => 'Delete flow']
            ]
        ];
    }

    /**
     * Get route handler based on request method and path
     */
    public static function resolveRoute($method, $path, $id_or_folderId = null) {
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
            if (strpos($pattern, '{id}') !== false && $id_or_folderId !== null) {
                $candidate = str_replace('{id}', $id_or_folderId, $pattern);
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
    $folderHandler = new FolderHandler();
    $endpointHandler = new EndpointHandler();
    $flowHandler = new FlowHandler();
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
            case 'forgot_password':
                $authHandler->forgotPassword();
                break;
            case 'reset_password':
                $authHandler->resetPassword();
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
            case 'project_context':
                $projectHandler->getContext($id);
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
            // Folder management
            case 'folders_list':
                $folderHandler->getAll($id);
                break;
            case 'folder_detail':
                $folderHandler->getById($id);
                break;
            case 'folder_create':
                $folderHandler->create($id);
                break;
            case 'folder_update':
                $folderHandler->update($id);
                break;
            case 'folder_delete':
                $folderHandler->delete($id);
                break;
            // Endpoint management
            case 'endpoints_list':
                $endpointHandler->getAll($id);
                break;
            case 'endpoint_detail':
                $endpointHandler->getById($id);
                break;
            case 'endpoint_create':
                $endpointHandler->create($id);
                break;
            case 'endpoint_update':
                $endpointHandler->update($id);
                break;
            case 'endpoint_delete':
                $endpointHandler->delete($id);
                break;
            case 'project_endpoints_list':
                $endpointHandler->getAllByProject($id);
                break;
            case 'project_endpoints_grouped':
                $endpointHandler->getGrouped($id);
                break;
            // Flow management
            case 'flows_list':
                $flowHandler->getAll($id);
                break;
            case 'flow_list': // Alias for flows_list
                $flowHandler->getAll($id);
                break;
            case 'flows_active_list':
                $flowHandler->getActive($id);
                break;
            case 'flow_detail':
                $flowHandler->getById($id);
                break;
            case 'flow_get': // Alias for flow_detail
                $flowHandler->getById($id);
                break;
            case 'flow_detail_ui': // Get flow for UI (React Flow format)
                $flowHandler->getByIdForUI($id);
                break;
            case 'flow_create':
                $flowHandler->create($id);
                break;
            case 'flow_update':
                $flowHandler->update($id);
                break;
            case 'flow_update_ui': // Update flow from UI (React Flow format)
                $flowHandler->updateFromUI($id);
                break;
            case 'flow_delete':
                $flowHandler->delete($id);
                break;
            case 'flow_toggle_active':
                $flowHandler->toggleActive($id);
                break;
            case 'flow_duplicate':
                $flowHandler->duplicate($id);
                break;
            case 'flow_activate':
                $flowHandler->activate($id);
                break;
            case 'flow_deactivate':
                $flowHandler->deactivate($id);
                break;
            case 'flow_execute':
                $flowHandler->execute($id);
                break;
            // MCP integration
            case 'mcp_generate_config':
                $mcpHandler->generateConfig($id);
                break;
            case 'mcp_validate':
                $mcpHandler->validateToken();
                break;
            case 'endpoint_list':
                $endpointHandler->getAll($id);
                break;
            case 'endpoint_get':
                $endpointHandler->getById($id);
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