<?php
namespace App\Helpers;

/**
 * Enhanced Validation helper dengan comprehensive XSS protection
 */
class ValidationHelper {

    /**
     * Get JSON input from request body dengan validasi tambahan
     */
    public static function getJsonInput() {
        $input = file_get_contents('php://input');

        // Validasi ukuran input untuk mencegah DoS
        if (strlen($input) > 1024 * 1024) { // 1MB limit
            ResponseHelper::error(MessageHelper::VALIDATION_INPUT_TOO_LARGE, 413);
        }

        // Handle empty request body (valid untuk DELETE requests dan lainnya)
        if (empty($input) || trim($input) === '') {
            return [];
        }

        $decoded = json_decode($input, true);

        // Handle JSON decode errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg() . " | Input: " . substr($input, 0, 200));
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_JSON, 400);
        }

        return $decoded ?? [];
    }

    /**
     * Validate required fields dengan detail error
     */
    public static function required($data, $requiredFields) {
        $missing = [];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                $missing[] = ucfirst(str_replace('_', ' ', $field));
            }
        }

        if (!empty($missing)) {
            ResponseHelper::error(implode(', ', array_map([MessageHelper::class, 'requiredField'], $missing)), 400);
        }
    }

    /**
     * Validate email format dengan enhanced security
     */
    public static function email($email) {
        // Basic format validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_EMAIL, 400);
        }

        // Additional security checks
        $email = strtolower(trim($email));

        // Prevent dangerous characters
        if (preg_match('/[<>"\'\x00-\x1f\x7f-\x9f]/', $email)) {
            ResponseHelper::error(MessageHelper::VALIDATION_EMAIL_CONTAINS_INVALID_CHARS, 400);
        }

        // Length validation
        if (strlen($email) > 254) {
            ResponseHelper::error(MessageHelper::VALIDATION_EMAIL_TOO_LONG, 400);
        }

        return filter_var($email, FILTER_SANITIZE_EMAIL);
    }

    /**
     * Comprehensive XSS protection untuk string input
     */
    public static function sanitize($string, $maxLength = 1000) {
        if ($string === null || $string === '') {
            return $string;
        }

        // Trim whitespace
        $string = trim($string);

        // Length validation
        if (strlen($string) > $maxLength) {
            ResponseHelper::error(MessageHelper::inputTooLong($maxLength), 400);
        }

        // Convert to lowercase for case-insensitive checks
        $lowerString = strtolower($string);

        // Check for dangerous HTML tags
        $dangerousTags = [
            'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
            'link', 'meta', 'style', 'applet', 'body', 'html', 'head', 'title',
            'base', 'bgsound', 'blink', 'ilayer', 'layer', 'marquee', 'xml',
            'svg', 'math', 'canvas', 'video', 'audio', 'source', 'track'
        ];

        foreach ($dangerousTags as $tag) {
            if (strpos($lowerString, '<' . $tag) !== false ||
                strpos($lowerString, $tag . '>') !== false ||
                strpos($lowerString, '<' . $tag . '>') !== false) {
                ResponseHelper::error(MessageHelper::VALIDATION_CONTAINS_INVALID_CONTENT, 400);
            }
        }

        // Check for JavaScript protocols and dangerous schemes
        $dangerousProtocols = [
            'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:',
            'mailto:', 'tel:', 'sms:', 'callto:', 'chrome:', 'chrome-extension:'
        ];

        foreach ($dangerousProtocols as $protocol) {
            if (strpos($lowerString, $protocol) !== false) {
                ResponseHelper::error(MessageHelper::VALIDATION_CONTAINS_INVALID_CONTENT, 400);
            }
        }

        // Check for dangerous event handlers
        $dangerousEvents = [
            'onerror', 'onclick', 'onload', 'onmouseover', 'onmouseout', 'onfocus',
            'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown',
            'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove',
            'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop', 'onfocusin',
            'onfocusout', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown',
            'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata',
            'onloadstart', 'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave',
            'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel',
            'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpaste', 'onpause',
            'onplay', 'onplaying', 'onpopstate', 'onprogress', 'onratechange',
            'onreset', 'onresize', 'onscroll', 'onsearch', 'onseeked', 'onseeking',
            'onselect', 'onstalled', 'onstorage', 'onsubmit', 'onsuspend', 'ontimeupdate',
            'ontoggle', 'onunload', 'onvolumechange', 'onwaiting', 'onwheel'
        ];

        foreach ($dangerousEvents as $event) {
            if (strpos($lowerString, $event) !== false) {
                ResponseHelper::error(MessageHelper::VALIDATION_CONTAINS_INVALID_CONTENT, 400);
            }
        }

        // Check for dangerous attributes
        $dangerousAttributes = [
            'src=', 'href=', 'action=', 'background=', 'dynsrc=', 'lowsrc=',
            'codebase=', 'classid=', 'data=', 'formaction=', 'poster=', 'archive=',
            'usemap=', 'profile=', 'manifest=', 'xlink:href=', 'xml:base=',
            'style=', 'class=', 'id=', 'name=', 'value=', 'onclick=', 'onload='
        ];

        foreach ($dangerousAttributes as $attr) {
            if (strpos($lowerString, $attr) !== false) {
                ResponseHelper::error(MessageHelper::VALIDATION_CONTAINS_INVALID_CONTENT, 400);
            }
        }

        // Check for common XSS patterns
        $xssPatterns = [
            '/<[^>]*>[^<]*<[^>]*>/', // Nested tags
            '/expression\s*\(/i', // CSS expression
            '/@import/i', // CSS import
            '/url\s*\(/i', // CSS URL
            '/&#\w+;/', // HTML entities
            '/\\x[0-9a-f]{2}/', // Hex encoding
            '/%[0-9a-f]{2}/i', // URL encoding
        ];

        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $string)) {
                ResponseHelper::error(MessageHelper::VALIDATION_CONTAINS_INVALID_PATTERN, 400);
            }
        }

        // Check for encoded/obfuscated attacks
        if (preg_match('/&[#\w]+;/', $string)) {
            $decoded = html_entity_decode($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($decoded !== $string) {
                // Recursive check on decoded content
                self::sanitize($decoded, $maxLength);
                return;
            }
        }

        // Final sanitization with proper encoding
        return htmlspecialchars($string, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }

    /**
     * Validate password dengan comprehensive security checks
     */
    public static function password($password) {
        if (empty($password)) {
            ResponseHelper::error(MessageHelper::VALIDATION_PASSWORD_REQUIRED, 400);
        }

        if (strlen($password) < 8) {
            ResponseHelper::error(MessageHelper::VALIDATION_PASSWORD_TOO_SHORT, 400);
        }

        if (strlen($password) > 128) {
            ResponseHelper::error(MessageHelper::VALIDATION_PASSWORD_TOO_LONG, 400);
        }

        // Password complexity requirements
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasLower = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);
        $hasSpecial = preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>\/\\\\?]/', $password);

        if (!$hasUpper || !$hasLower || !$hasNumber) {
            ResponseHelper::error(MessageHelper::VALIDATION_PASSWORD_MISSING_COMPLEXITY, 400);
        }

        // Check for exact common passwords (not containing them)
        $commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
        if (in_array(strtolower($password), $commonPasswords)) {
            ResponseHelper::error(MessageHelper::VALIDATION_PASSWORD_TOO_COMMON, 400);
        }

        return $password;
    }

    /**
     * Validate nama dengan sanitasi komprehensif
     */
    public static function name($name, $maxLength = 100) {
        if (empty($name)) {
            ResponseHelper::error(MessageHelper::VALIDATION_NAME_REQUIRED, 400);
        }

        $trimmedName = trim($name);
        if (strlen($trimmedName) < 2) {
            ResponseHelper::error(MessageHelper::VALIDATION_NAME_TOO_SHORT, 400);
        }

        return self::sanitize($trimmedName, $maxLength);
    }

    /**
     * Validate numeric input
     */
    public static function numeric($value, $min = null, $max = null) {
        if (!is_numeric($value)) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_NUMBER, 400);
        }

        $numValue = (float)$value;

        if ($min !== null && $numValue < $min) {
            ResponseHelper::error(MessageHelper::minValue($min), 400);
        }

        if ($max !== null && $numValue > $max) {
            ResponseHelper::error(MessageHelper::maxValue($max), 400);
        }

        return $numValue;
    }

    /**
     * Validate integer input
     */
    public static function integer($value, $min = null, $max = null) {
        if (!filter_var($value, FILTER_VALIDATE_INT)) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_INTEGER, 400);
        }

        $intValue = (int)$value;

        if ($min !== null && $intValue < $min) {
            ResponseHelper::error(MessageHelper::minValue($min), 400);
        }

        if ($max !== null && $intValue > $max) {
            ResponseHelper::error(MessageHelper::maxValue($max), 400);
        }

        return $intValue;
    }

    /**
     * Validate ID yang bisa berupa string atau integer
     * Flexible validation untuk user ID yang bisa dikirim sebagai "user_123_hash" atau 123
     */
    public static function flexibleId($value, $min = 1) {
        // Handle null/empty values
        if ($value === null || $value === '') {
            ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400);
        }

        // Convert to string for consistent processing
        $stringValue = (string)$value;

        // Support string IDs like "user_123456_abc123"
        if (preg_match('/^[a-zA-Z0-9_-]+$/', $stringValue)) {
            // String IDs are valid if they match the pattern
            return $stringValue;
        }

        // Check if it's a valid numeric string or integer (legacy support)
        if (is_numeric($stringValue)) {
            // Check for decimal points (not allowed for IDs)
            if (strpos($stringValue, '.') !== false) {
                ResponseHelper::error(MessageHelper::VALIDATION_INVALID_INTEGER, 400);
            }

            $intValue = (int)$stringValue;

            // Validasi nilai minimal
            if ($intValue < $min) {
                ResponseHelper::error(MessageHelper::minValue($min), 400);
            }

            return $intValue;
        }

        ResponseHelper::error(MessageHelper::ERROR_VALIDATION_FAILED, 400);
    }

    /**
     * Validate URL dengan sanitasi
     */
    public static function url($url) {
        if (empty($url)) {
            return $url;
        }

        $url = trim($url);

        if (!filter_var($url, FILTER_VALIDATE_URL)) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_URL, 400);
        }

        // Additional security checks
        $parsed = parse_url($url);
        if (!isset($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'])) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_URL_SCHEME, 400);
        }

        return $url;
    }

    /**
     * Validate text dengan length limits
     */
    public static function text($text, $minLength = 0, $maxLength = 1000) {
        if ($text === null) {
            return $text;
        }

        $trimmedText = trim($text);
        $length = strlen($trimmedText);

        if ($length < $minLength) {
            ResponseHelper::error(MessageHelper::textTooShort($minLength), 400);
        }

        if ($length > $maxLength) {
            ResponseHelper::error(MessageHelper::textTooLong($maxLength), 400);
        }

        return self::sanitize($trimmedText, $maxLength);
    }

    /**
     * Validate boolean input
     */
    public static function boolean($value, $default = false) {
        if ($value === null || $value === '') {
            return $default;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Validate array input
     */
    public static function array($value, $maxItems = 100) {
        if (!is_array($value)) {
            ResponseHelper::error(MessageHelper::VALIDATION_INVALID_ARRAY, 400);
        }

        if (count($value) > $maxItems) {
            ResponseHelper::error(MessageHelper::arrayTooManyItems($maxItems), 400);
        }

        return $value;
    }

    /**
     * Generate CSRF token
     */
    public static function generateCSRFToken() {
        if (!isset($_SESSION)) {
            session_start();
        }

        $token = bin2hex(random_bytes(32));
        $_SESSION['csrf_token'] = $token;

        return $token;
    }

    /**
     * Validate CSRF token
     */
    public static function validateCSRFToken($token) {
        if (!isset($_SESSION)) {
            session_start();
        }

        if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
            ResponseHelper::error('Invalid CSRF token', 403);
        }

        return true;
    }
}