<?php
/**
 * Backend PHP API - Entry Point
 *
 * Modular API with separate handlers and helpers
 */

// Load Composer autoloader
require_once __DIR__ . '/vendor/autoload.php';

// Load manual libraries
require_once __DIR__ . '/lib/MysqliDb.php';

// Load environment variables
use Dotenv\Dotenv;
use App\Config\App;
use App\Helpers\ResponseHelper;

try {
    $dotenv = Dotenv::createImmutable(__DIR__);
    $dotenv->load();
} catch (\Dotenv\Exception\InvalidPathException $e) {
    error_log("Warning: .env file not found. Using default values.");
}

// Initialize app configuration
App::init();

// Set API headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-HTTP-Method-Override');
header('Access-Control-Max-Age: 86400'); // 24 hours cache for preflight

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Import route resolver
use App\Routes\ApiRoutes;

// Get request parameters
$action = $_GET['act'] ?? 'help';
$id = $_GET['id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// Handle method override for PUT/DELETE requests
// Some clients/servers don't support PUT/DELETE directly and use POST with override
if ($method === 'POST') {
    if (isset($_POST['_method'])) {
        $method = strtoupper($_POST['_method']);
    } elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
        $method = $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'];
    }
}

// Security: Action whitelist
$allowedActions = [
    'help', 'health',
    'login', 'register', 'logout', 'refresh', 'logout-all', 'change-password',
    'forgot-password', 'reset-password',
    'users', 'users_stats', 'user', 'profile',
    'user_update', 'user_toggle_status', 'user_delete',
    // Projects
    'projects', 'project', 'project_context', 'project_update', 'project_delete', 'project_add_member',
    // Environments
    'project_environments', 'environment', 'environment_update', 'environment_delete', 'environment_create',
    // Folders
    'project_folders', 'folders_list', 'folder', 'folder_detail', 'folder_update', 'folder_delete', 'folder_create',
    // Endpoints
    'endpoints', 'endpoint', 'endpoint_update', 'endpoint_delete', 'endpoint_create',
    'endpoint_list', 'endpoint_get',
    'project_endpoints', 'project_endpoints_grouped',
    // Flows
    'flows', 'flows_active', 'flows_list', 'flow', 'flow_update', 'flow_delete', 'flow_create', 'flow_toggle_active', 'flow_duplicate',
    'flow_list', 'flow_get', 'flow_activate', 'flow_deactivate', 'flow_execute',
    'flow_detail_ui', 'flow_update_ui', // UI endpoints for React Flow format
    // MCP
    'mcp_validate', 'mcp_generate_config'
];

if (!in_array($action, $allowedActions)) {
    ResponseHelper::error('Invalid action', 400);
}

// Resolve and execute route
$routePath = resolveRoutePath($action, $id);
$resolveResult = ApiRoutes::resolveRoute($method, $routePath, $id);

if ($resolveResult['error']) {
    ResponseHelper::error($resolveResult['error'], 404);
}

// Execute the resolved handler
ApiRoutes::execute($resolveResult['handler'], $id);

/**
 * Convert action parameter to route path
 */
function resolveRoutePath($action, $id = null) {
    $routeMap = [
        'help' => '/',
        'health' => '/health',
        'login' => '/login',
        'register' => '/register',
        'logout' => '/logout',
        'logout-all' => '/logout-all',
        'refresh' => '/refresh',
        'change-password' => '/change-password',
        'forgot-password' => '/forgot-password',
        'reset-password' => '/reset-password',
        'users' => '/users',
        'users_stats' => '/users/stats',
        'profile' => '/profile',
        'user' => $id ? "/user/$id" : '/user',
        'user_update' => $id ? "/user/$id" : '/user',
        'user_delete' => $id ? "/user/$id" : '/user',
        'user_toggle_status' => $id ? "/user/$id/toggle-status" : '/user/toggle-status',
        // Projects
        'projects' => '/projects',
        'project' => $id ? "/project/$id" : '/project',
        'project_update' => $id ? "/project/$id" : '/project',
        'project_delete' => $id ? "/project/$id" : '/project',
        'project_add_member' => $id ? "/project/$id/members" : '/project/members',
        // Environments
        'project_environments' => $id ? "/project/$id/environments" : '/project/environments',
        'environment' => $id ? "/environment/$id" : '/environment',
        'environment_update' => $id ? "/environment/$id" : '/environment',
        'environment_delete' => $id ? "/environment/$id" : '/environment',
        'environment_create' => $id ? "/project/$id/environments" : '/project/environments',
        // Folders
        'project_folders' => $id ? "/project/$id/folders" : '/project/folders',
        'folders_list' => $id ? "/project/$id/folders" : '/project/folders',
        'folder' => $id ? "/folder/$id" : '/folder',
        'folder_detail' => $id ? "/folder/$id" : '/folder',
        'folder_update' => $id ? "/folder/$id" : '/folder',
        'folder_delete' => $id ? "/folder/$id" : '/folder',
        'folder_create' => $id ? "/project/$id/folders" : '/project/folders',
        // Endpoints
        'endpoints' => $id ? "/folder/$id/endpoints" : '/folder/endpoints',
        'endpoint_list' => $id ? "/folder/$id/endpoints/list" : '/folder/endpoints',
        'endpoint' => $id ? "/endpoint/$id" : '/endpoint',
        'endpoint_get' => $id ? "/endpoint/$id/get" : '/endpoint/get',
        'endpoint_update' => $id ? "/endpoint/$id" : '/endpoint',
        'endpoint_delete' => $id ? "/endpoint/$id" : '/endpoint',
        'endpoint_create' => $id ? "/folder/$id/endpoints" : '/folder/endpoints',
        'project_endpoints' => $id ? "/project/$id/endpoints" : '/project/endpoints',
        'project_endpoints_grouped' => $id ? "/project/$id/endpoints/grouped" : '/project/endpoints/grouped',
        // Flows
        'flows' => $id ? "/project/$id/flows" : '/project/flows',
        'flows_active' => $id ? "/project/$id/flows/active" : '/project/flows/active',
        'flow' => $id ? "/flow/$id" : '/flow',
        'flow_update' => $id ? "/flow/$id" : '/flow',
        'flow_delete' => $id ? "/flow/$id" : '/flow',
        'flow_create' => $id ? "/project/$id/flows" : '/project/flows',
        'flow_toggle_active' => $id ? "/flow/$id/toggle-active" : '/flow/toggle-active',
        'flow_duplicate' => $id ? "/flow/$id/duplicate" : '/flow/duplicate',
        'flow_list' => $id ? "/project/$id/flows" : '/project/flows',
        'flow_get' => $id ? "/flow/$id" : '/flow',
        'flow_detail_ui' => $id ? "/flow/$id/ui" : '/flow/ui',
        'flow_activate' => $id ? "/flow/$id/activate" : '/flow/activate',
        'flow_deactivate' => $id ? "/flow/$id/deactivate" : '/flow/deactivate',
        'flow_execute' => $id ? "/flow/$id/execute" : '/flow/execute',
        // MCP
        'mcp_validate' => '/mcp/validate',
        'mcp_generate_config' => $id ? "/project/$id/generate-config" : '/project/generate-config'
    ];

    return $routeMap[$action] ?? '/';
}
?>