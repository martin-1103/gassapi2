<?php
namespace App\Middleware;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;

/**
 * CSRF Protection Middleware
 */
class CSRFMiddleware {

    /**
     * Validate CSRF token for state-changing requests
     */
    public static function validateCSRF() {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        // Only validate state-changing requests
        $stateChangingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

        if (!in_array($method, $stateChangingMethods)) {
            return true; // Skip validation for GET requests
        }

        // Get CSRF token from header or body
        $token = null;

        // Check Authorization header first
        $headers = getallheaders();
        if (isset($headers['X-CSRF-Token'])) {
            $token = $headers['X-CSRF-Token'];
        } elseif (isset($headers['X-XSRF-Token'])) {
            $token = $headers['X-XSRF-Token'];
        }

        // Check request body if not in headers
        if (!$token) {
            $input = ValidationHelper::getJsonInput();
            $token = $input['csrf_token'] ?? null;
        }

        // Validate token
        if ($token) {
            return ValidationHelper::validateCSRFToken($token);
        }

        // For API requests, CSRF might be handled differently
        // Check if this is an API request with JWT token
        $authHeader = $headers['Authorization'] ?? '';
        if (strpos($authHeader, 'Bearer ') === 0) {
            return true; // Skip CSRF for JWT-authenticated API requests
        }

        ResponseHelper::error('CSRF token required', 403);
        return false;
    }

    /**
     * Generate CSRF token for forms
     */
    public static function generateToken() {
        return ValidationHelper::generateCSRFToken();
    }

    /**
     * Add CSRF headers to response
     */
    public static function addCSRFHeaders() {
        $token = self::generateToken();

        // Add headers for JavaScript frameworks
        header('X-CSRF-Token: ' . $token);
        header('X-XSRF-Token: ' . $token);

        return $token;
    }
}