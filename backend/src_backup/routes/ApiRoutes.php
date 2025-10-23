<?php
namespace App\Routes;

use App\Handlers\AuthHandler;
use App\Handlers\UserHandler;
use App\Handlers\HealthHandler;

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
                '/profile' => ['handler' => 'profile', 'description' => 'Current user profile']
            ],
            'POST' => [
                '/login' => ['handler' => 'login', 'description' => 'User authentication'],
                '/register' => ['handler' => 'register', 'description' => 'User registration'],
                '/logout' => ['handler' => 'logout', 'description' => 'User logout'],
                '/refresh' => ['handler' => 'refresh', 'description' => 'Refresh access token'],
                '/logout-all' => ['handler' => 'logout_all', 'description' => 'Logout from all devices'],
                '/user/{id}' => ['handler' => 'user_update', 'description' => 'Update user'],
                '/profile' => ['handler' => 'profile_update', 'description' => 'Update current user profile'],
                '/change-password' => ['handler' => 'change_password', 'description' => 'Change user password']
            ],
            'PUT' => [
                '/user/{id}' => ['handler' => 'user_update', 'description' => 'Update user'],
                '/user/{id}/toggle-status' => ['handler' => 'toggle_status', 'description' => 'Activate/Deactivate user']
            ],
            'DELETE' => [
                '/user/{id}' => ['handler' => 'user_delete', 'description' => 'Delete user']
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

        // Check pattern match with ID
        foreach ($methodRoutes as $pattern => $route) {
            if (strpos($pattern, '{id}') !== false) {
                $basePath = str_replace('{id}', '', $pattern);
                if ($path === $basePath . $id) {
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