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
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

// Security: Action whitelist
$allowedActions = [
    'help', 'health',
    'login', 'register', 'logout', 'refresh', 'logout-all', 'change-password',
    'users', 'users_stats', 'user', 'profile',
    'user_update', 'user_toggle_status', 'user_delete',
    // Projects
    'projects', 'project', 'project_update', 'project_delete', 'project_add_member',
    // Environments
    'project_environments', 'environment', 'environment_update', 'environment_delete', 'environment_create',
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
        // MCP
        'mcp_validate' => '/mcp/validate',
        'mcp_generate_config' => $id ? "/project/$id/generate-config" : '/project/generate-config'
    ];

    return $routeMap[$action] ?? '/';
}
?>