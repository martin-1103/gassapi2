<?php
namespace App\Helpers;

/**
 * Validation helper untuk input validation
 */
class ValidationHelper {

    /**
     * Get JSON input from request body
     */
    public static function getJsonInput() {
        $input = file_get_contents('php://input');
        return json_decode($input, true) ?? [];
    }

    /**
     * Validate required fields
     */
    public static function required($data, $requiredFields) {
        $missing = [];
        foreach ($requiredFields as $field) {
            if (empty($data[$field])) {
                $missing[] = ucfirst($field);
            }
        }

        if (!empty($missing)) {
            ResponseHelper::error(implode(', ', $missing) . ' are required');
        }
    }

    /**
     * Validate email format
     */
    public static function email($email) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error('Invalid email format');
        }
        return filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    /**
     * Sanitize string input
     */
    public static function sanitize($string) {
        return htmlspecialchars(trim($string), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Validate password strength
     */
    public static function password($password) {
        if (strlen($password) < 8) {
            ResponseHelper::error('Password must be at least 8 characters');
        }
        return $password;
    }
}