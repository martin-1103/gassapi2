<?php

/**
 * Test Configuration untuk Backend PHP API
 */
class TestConfig {
    // Base Configuration
    const BASE_URL = 'http://localhost:8080/gassapi2/backend/';
    const TIMEOUT = 5; // 1 detik sesuai permintaan

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
        'logout-all' => '?act=logout-all',
        'refresh' => '?act=refresh',
        'change-password' => '?act=change-password',
        'users' => '?act=users',
        'users_stats' => '?act=users_stats',
        'profile' => '?act=profile',
        'user' => '?act=user&id=',
        'user_update' => '?act=user_update&id=',
        'user_toggle_status' => '?act=user&id=',  // Will be handled specially
        'help' => '?act=help'
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
        $url = self::BASE_URL . self::ENDPOINTS[$endpoint];

        // Handle endpoints that need ID
        if ($id !== null) {
            if (in_array($endpoint, ['user', 'user_update', 'user_toggle_status'])) {
                $url .= $id;
                // Special handling for toggle status
                if ($endpoint === 'user_toggle_status') {
                    $url = str_replace('?act=user&id=', '?act=user&id=' . $id . '/toggle-status', $url);
                }
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

        $filename = self::REPORTS_DIR . $testName . '_' . date('Y-m-d_H-i-s') . '.json';
        $data = [
            'test' => $testName,
            'timestamp' => date('Y-m-d H:i:s'),
            'response' => $response
        ];

        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
    }
}