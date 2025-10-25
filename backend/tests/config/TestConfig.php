<?php

/**
 * Test Configuration untuk Backend PHP API
 */
class TestConfig {
    // Base Configuration
    const BASE_URL = 'http://localhost:8080/gassapi2/backend/';
    const TIMEOUT = 5; // 5 detik timeout untuk testing

    // Test Settings
    const DEBUG = true;
    const SAVE_RESPONSES = true;
    const REPORTS_DIR = __DIR__ . '/../reports/';

    // Test Data
    const TEST_USER = [
        'email' => 'test@example.com',
        'password' => 'Test123456!',
        'name' => 'Test User'
    ];

    const TEST_ADMIN = [
        'email' => 'admin@example.com',
        'password' => 'Admin123456!',
        'name' => 'Admin User'
    ];

    // Endpoints untuk testing
    const ENDPOINTS = [
        'health' => '?act=health',
        'login' => '?act=login',
        'register' => '?act=register',
        'logout' => '?act=logout',
        'logout_all' => '?act=logout-all',
        'logout-all' => '?act=logout-all',
        'refresh' => '?act=refresh',
        'change_password' => '?act=change-password',
        'change-password' => '?act=change-password',
        'users' => '?act=users',
        'users_stats' => '?act=users_stats',
        'profile' => '?act=profile',
        'user' => '?act=user&id=',
        'user_by_id' => '?act=user&id=',
        'user_update' => '?act=user_update&id=',
        'user_toggle_status' => '?act=user_toggle_status&id=',
        'user_delete' => '?act=user_delete&id=',
        'help' => '?act=help',
        // Projects & Environments & MCP
        'projects' => '?act=projects',
        'project' => '?act=project&id=',
        'project_environments' => '?act=project_environments&id=',
        'project_update' => '?act=project_update&id=',
        'project_delete' => '?act=project_delete&id=',
        'project_add_member' => '?act=project_add_member&id=',
        'environment' => '?act=environment&id=',
        'environment_create' => '?act=environment_create&id=',
        'environment_update' => '?act=environment_update&id=',
        'environment_delete' => '?act=environment_delete&id=',
        'mcp_generate_config' => '?act=mcp_generate_config&id=',
        'mcp_validate' => '?act=mcp_validate',

        // Folders API
        'folder_create' => '?act=folder_create&id=',
        'folder_list' => '?act=folder_list&id=',
        'folders_list' => '?act=folders_list&id=',
        'folder_get' => '?act=folder_detail&id=',
        'folder_detail' => '?act=folder_detail&id=',
        'folder_update' => '?act=folder_update&id=',
        'folder_delete' => '?act=folder_delete&id=',

        // Endpoints API
        'endpoint_create' => '?act=endpoint_create&id=',
        'endpoint_list' => '?act=endpoint_list&id=',
        'endpoint_get' => '?act=endpoint_get&id=',
        'endpoint_update' => '?act=endpoint_update&id=',
        'endpoint_delete' => '?act=endpoint_delete&id=',

        // Flows API
        'flow_create' => '?act=flow_create&id=',
        'flow_list' => '?act=flow_list&id=',
        'flow_get' => '?act=flow_get&id=',
        'flow_update' => '?act=flow_update&id=',
        'flow_delete' => '?act=flow_delete&id=',
        'flow_toggle_active' => '?act=flow_toggle_active&id=',
        'flow_duplicate' => '?act=flow_duplicate&id=',
        'flow_execute' => '?act=flow_execute&id=',
        'flow_activate' => '?act=flow_activate&id=',
        'flow_deactivate' => '?act=flow_deactivate&id=',

        // Additional endpoints (may not be implemented)
        'forgot-password' => '?act=forgot-password',
        'reset-password' => '?act=reset-password',
        'status' => '?act=status',
        'health/' => '?act=health',
        '/help' => '?act=help',
        '' => '?act=help'
    ];

    // Headers default
    const DEFAULT_HEADERS = [
        'Content-Type: application/json',
        'Accept: application/json'
    ];

    /**
     * Get base URL
     */
    public static function getBaseUrl() {
        return self::BASE_URL;
    }

    /**
     * Get full URL untuk endpoint
     */
    public static function getUrl($endpoint, $id = null) {
        // Ensure endpoint exists to prevent undefined array key warnings
        if (!isset(self::ENDPOINTS[$endpoint])) {
            throw new InvalidArgumentException("Endpoint '$endpoint' is not defined in TestConfig::ENDPOINTS");
        }

        $url = self::BASE_URL . self::ENDPOINTS[$endpoint];

        // Handle endpoints that need ID
        if ($id !== null) {
            // User management endpoints
            if (in_array($endpoint, ['user', 'user_by_id', 'user_update', 'user_toggle_status', 'user_delete'])) {
                $url .= $id;
            }

            // Project endpoints
            if (in_array($endpoint, ['project', 'project_environments', 'project_update', 'project_delete', 'project_add_member', 'environment_create'])) {
                $url .= $id;
            }

            // Environment endpoints
            if (in_array($endpoint, ['environment', 'environment_update', 'environment_delete'])) {
                $url .= $id;
            }

            // MCP endpoints
            if (in_array($endpoint, ['mcp_generate_config'])) {
                $url .= $id;
            }

            // Folder endpoints
            if (in_array($endpoint, ['folder_create', 'folder_list', 'folders_list', 'folder_get', 'folder_detail', 'folder_update', 'folder_delete'])) {
                $url .= $id;
            }

            // Endpoint endpoints
            if (in_array($endpoint, ['endpoint_create', 'endpoint_list', 'endpoint_get', 'endpoint_update', 'endpoint_delete'])) {
                $url .= $id;
            }

            // Flow endpoints
            if (in_array($endpoint, ['flow_create', 'flow_list', 'flow_get', 'flow_update', 'flow_delete', 'flow_toggle_active', 'flow_duplicate', 'flow_execute', 'flow_activate', 'flow_deactivate'])) {
                $url .= $id;
            }
        }

        return $url;
    }

    /**
     * Get timeout setting
     */
    public static function getTimeout() {
        return self::TIMEOUT;
    }

    /**
     * Check if debug mode
     */
    public static function isDebug() {
        return self::DEBUG;
    }

    /**
     * Save response to file
     */
    public static function saveResponse($testName, $response) {
        if (!self::SAVE_RESPONSES) return;

        // Sanitize filename and limit length
        $sanitizedName = substr(preg_replace('/[^a-zA-Z0-9_-]/', '_', $testName), 0, 50);
        $filename = self::REPORTS_DIR . $sanitizedName . '_' . date('Y-m-d_H-i-s') . '.json';

        // Ensure reports directory exists
        if (!is_dir(self::REPORTS_DIR)) {
            mkdir(self::REPORTS_DIR, 0755, true);
        }

        $data = [
            'test' => $testName,
            'timestamp' => date('Y-m-d H:i:s'),
            'response' => $response
        ];

        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
    }
}