<?php
namespace App\Helpers;

/**
 * Comprehensive security sanitizer untuk data sebelum disimpan ke database
 */
class SecuritySanitizer {

    /**
     * Sanitize data array sebelum database operations
     */
    public static function sanitizeData($data, $rules = []) {
        if (!is_array($data) || empty($data)) {
            return $data;
        }

        $sanitized = [];
        foreach ($data as $key => $value) {
            // Skip null values
            if ($value === null) {
                $sanitized[$key] = null;
                continue;
            }

            // Apply field-specific rules if provided
            if (isset($rules[$key])) {
                $sanitized[$key] = self::applyRule($value, $rules[$key]);
            } else {
                // Default sanitization
                $sanitized[$key] = self::sanitizeMixed($value);
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize mixed data type
     */
    private static function sanitizeMixed($value) {
        if (is_string($value)) {
            return self::sanitizeString($value);
        } elseif (is_array($value)) {
            return array_map([self::class, 'sanitizeMixed'], $value);
        } elseif (is_object($value)) {
            return self::sanitizeObject($value);
        }

        return $value;
    }

    /**
     * Sanitize string values
     */
    private static function sanitizeString($value) {
        // Trim whitespace
        $value = trim($value);

        // Remove null bytes and control characters except newlines and tabs
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);

        // Normalize whitespace
        $value = preg_replace('/\s+/', ' ', $value);

        // Remove potential HTML/JS (double protection after ValidationHelper)
        $value = htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        return $value;
    }

    /**
     * Sanitize object values
     */
    private static function sanitizeObject($value) {
        if (method_exists($value, 'toArray')) {
            return self::sanitizeData($value->toArray());
        }

        // Convert object to array and sanitize
        $arrayValue = (array)$value;
        return self::sanitizeData($arrayValue);
    }

    /**
     * Apply specific sanitization rule
     */
    private static function applyRule($value, $rule) {
        switch ($rule) {
            case 'email':
                return filter_var($value, FILTER_SANITIZE_EMAIL);

            case 'url':
                return filter_var($value, FILTER_SANITIZE_URL);

            case 'int':
                return (int)$value;

            case 'float':
                return (float)$value;

            case 'bool':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);

            case 'alpha':
                return preg_replace('/[^a-zA-Z]/', '', $value);

            case 'alphanum':
                return preg_replace('/[^a-zA-Z0-9]/', '', $value);

            case 'text':
                // Multi-line text allowed
                return self::sanitizeText($value);

            case 'html':
                // For fields that need safe HTML (like descriptions)
                return self::sanitizeHTML($value);

            case 'json':
                return self::sanitizeJSON($value);

            case 'slug':
                return self::sanitizeSlug($value);

            default:
                return self::sanitizeString($value);
        }
    }

    /**
     * Sanitize multi-line text
     */
    private static function sanitizeText($value) {
        // Allow common formatting but strip dangerous content
        $value = trim($value);

        // Remove null bytes and excessive control characters
        $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $value);

        // Normalize line endings
        $value = str_replace(["\r\n", "\r"], "\n", $value);

        // Remove excessive consecutive newlines
        $value = preg_replace('/\n{3,}/', "\n\n", $value);

        // Trim whitespace around lines
        $lines = explode("\n", $value);
        $lines = array_map('trim', $lines);
        $value = implode("\n", $lines);

        return $value;
    }

    /**
     * Sanitize HTML content safely
     */
    private static function sanitizeHTML($value) {
        // Basic HTML sanitization
        $value = trim($value);

        // Remove script tags and dangerous attributes
        $patterns = [
            '/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi',
            '/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/mi',
            '/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/mi',
            '/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/mi',
            '/on\w+\s*=/mi', // Event handlers
            '/javascript:/mi',
            '/vbscript:/mi',
            '/data:text\/html/mi'
        ];

        foreach ($patterns as $pattern) {
            $value = preg_replace($pattern, '', $value);
        }

        // Allow basic formatting tags
        $allowedTags = '<p><br><strong><em><u><ol><ul><li>';
        $value = strip_tags($value, $allowedTags);

        return trim($value);
    }

    /**
     * Sanitize JSON data
     */
    private static function sanitizeJSON($value) {
        if (is_string($value)) {
            // Validate JSON structure
            json_decode($value);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $value;
            }
            // If invalid JSON, treat as regular string
            return self::sanitizeString($value);
        }

        // If array, sanitize recursively
        if (is_array($value)) {
            return array_map([self::class, 'sanitizeJSON'], $value);
        }

        return $value;
    }

    /**
     * Sanitize slug strings (URL-friendly)
     */
    private static function sanitizeSlug($value) {
        $value = strtolower(trim($value));

        // Replace spaces and special characters with hyphens
        $value = preg_replace('/[^a-z0-9]+/', '-', $value);

        // Remove leading/trailing hyphens
        $value = trim($value, '-');

        // Limit length
        return substr($value, 0, 100);
    }

    /**
     * Get default sanitization rules untuk common fields
     */
    public static function getDefaultRules($table) {
        $rules = [
            'users' => [
                'name' => 'text',
                'email' => 'email',
                'is_active' => 'bool',
                'role' => 'text',
                'avatar_url' => 'url'
            ],
            'projects' => [
                'name' => 'text',
                'description' => 'text',
                'is_active' => 'bool',
                'user_id' => 'int'
            ],
            'collections' => [
                'name' => 'text',
                'description' => 'text',
                'variables' => 'json',
                'headers' => 'json',
                'project_id' => 'int',
                'parent_id' => 'int'
            ],
            'endpoints' => [
                'name' => 'text',
                'method' => 'alpha',
                'url' => 'text',
                'headers' => 'json',
                'body' => 'json',
                'collection_id' => 'int'
            ],
            'environments' => [
                'name' => 'text',
                'description' => 'text',
                'variables' => 'json',
                'project_id' => 'int'
            ]
        ];

        return $rules[$table] ?? [];
    }

    /**
     * Validate SQL injection prevention
     */
    public static function checkSQLInjection($value) {
        if (!is_string($value)) {
            return true;
        }

        $dangerousPatterns = [
            '/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i',
            '/(\b(OR|AND)\b.*\b(=|LIKE)\b)/i',
            '/(--|;|\/\*|\*\/|@@|@|`|"|\'|\\\\)/i',
            '/\b(CONCAT|CHAR|ASCII|ORD|HEX|UNHEX)\s*\(/i',
            '/\b(WAITFOR|DELAY|BENCHMARK)\s*\(/i',
            '/\b(INFORMATION_SCHEMA|SYS|MASTER|MSDB)\b/i'
        ];

        foreach ($dangerousPatterns as $pattern) {
            if (preg_match($pattern, $value)) {
                error_log("Potential SQL injection detected: " . $value);
                return false;
            }
        }

        return true;
    }

    /**
     * Sanitize file upload data
     */
    public static function sanitizeFileData($fileData) {
        if (!is_array($fileData) || !isset($fileData['name'])) {
            return null;
        }

        $sanitized = [
            'name' => self::sanitizeString($fileData['name']),
            'type' => isset($fileData['type']) ? self::sanitizeString($fileData['type']) : null,
            'size' => isset($fileData['size']) ? (int)$fileData['size'] : 0,
            'error' => isset($fileData['error']) ? (int)$fileData['error'] : 0
        ];

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        if (isset($fileData['type']) && !in_array($fileData['type'], $allowedTypes)) {
            error_log("Blocked file upload: Invalid type {$fileData['type']}");
            return null;
        }

        // Validate file size (5MB limit)
        $maxSize = 5 * 1024 * 1024;
        if ($sanitized['size'] > $maxSize) {
            error_log("Blocked file upload: File too large ({$sanitized['size']} bytes)");
            return null;
        }

        return $sanitized;
    }
}