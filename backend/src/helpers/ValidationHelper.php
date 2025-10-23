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
            ResponseHelper::error('Input terlalu besar', 413);
        }

        $decoded = json_decode($input, true);

        // Handle JSON decode errors
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("JSON decode error: " . json_last_error_msg() . " | Input: " . substr($input, 0, 200));
            ResponseHelper::error('Format JSON tidak valid', 400);
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
            ResponseHelper::error('Field wajib diisi: ' . implode(', ', $missing), 400);
        }
    }

    /**
     * Validate email format dengan enhanced security
     */
    public static function email($email) {
        // Basic format validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error('Format email tidak valid', 400);
        }

        // Additional security checks
        $email = strtolower(trim($email));

        // Prevent dangerous characters
        if (preg_match('/[<>"\'\x00-\x1f\x7f-\x9f]/', $email)) {
            ResponseHelper::error('Email mengandung karakter tidak valid', 400);
        }

        // Length validation
        if (strlen($email) > 254) {
            ResponseHelper::error('Email terlalu panjang (maksimal 254 karakter)', 400);
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
            ResponseHelper::error("Input terlalu panjang (maksimal {$maxLength} karakter)", 400);
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
                ResponseHelper::error('Input mengandung konten tidak valid', 400);
            }
        }

        // Check for JavaScript protocols and dangerous schemes
        $dangerousProtocols = [
            'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:',
            'mailto:', 'tel:', 'sms:', 'callto:', 'chrome:', 'chrome-extension:'
        ];

        foreach ($dangerousProtocols as $protocol) {
            if (strpos($lowerString, $protocol) !== false) {
                ResponseHelper::error('Input mengandung konten tidak valid', 400);
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
                ResponseHelper::error('Input mengandung konten tidak valid', 400);
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
                ResponseHelper::error('Input mengandung konten tidak valid', 400);
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
                ResponseHelper::error('Input mengandung pola tidak valid', 400);
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
            ResponseHelper::error('Password wajib diisi', 400);
        }

        if (strlen($password) < 8) {
            ResponseHelper::error('Password minimal 8 karakter', 400);
        }

        if (strlen($password) > 128) {
            ResponseHelper::error('Password maksimal 128 karakter', 400);
        }

        // Password complexity requirements
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasLower = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);
        $hasSpecial = preg_match('/[!@#$%^&*()_+\-=\[\]{};:\'",.<>\/\\\\?]/', $password);

        if (!$hasUpper || !$hasLower || !$hasNumber) {
            ResponseHelper::error('Password harus mengandung huruf besar, huruf kecil, dan angka', 400);
        }

        // Check for common passwords (basic check)
        $commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
        foreach ($commonPasswords as $common) {
            if (stripos($password, $common) !== false) {
                ResponseHelper::error('Password tidak boleh mengandung kata yang umum', 400);
            }
        }

        return $password;
    }

    /**
     * Validate nama dengan sanitasi komprehensif
     */
    public static function name($name, $maxLength = 100) {
        if (empty($name)) {
            ResponseHelper::error('Nama wajib diisi', 400);
        }

        $trimmedName = trim($name);
        if (strlen($trimmedName) < 2) {
            ResponseHelper::error('Nama minimal 2 karakter', 400);
        }

        return self::sanitize($trimmedName, $maxLength);
    }

    /**
     * Validate numeric input
     */
    public static function numeric($value, $min = null, $max = null) {
        if (!is_numeric($value)) {
            ResponseHelper::error('Input harus berupa angka', 400);
        }

        $numValue = (float)$value;

        if ($min !== null && $numValue < $min) {
            ResponseHelper::error("Nilai minimal adalah {$min}", 400);
        }

        if ($max !== null && $numValue > $max) {
            ResponseHelper::error("Nilai maksimal adalah {$max}", 400);
        }

        return $numValue;
    }

    /**
     * Validate integer input
     */
    public static function integer($value, $min = null, $max = null) {
        if (!filter_var($value, FILTER_VALIDATE_INT)) {
            ResponseHelper::error('Input harus berupa bilangan bulat', 400);
        }

        $intValue = (int)$value;

        if ($min !== null && $intValue < $min) {
            ResponseHelper::error("Nilai minimal adalah {$min}", 400);
        }

        if ($max !== null && $intValue > $max) {
            ResponseHelper::error("Nilai maksimal adalah {$max}", 400);
        }

        return $intValue;
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
            ResponseHelper::error('Format URL tidak valid', 400);
        }

        // Additional security checks
        $parsed = parse_url($url);
        if (!isset($parsed['scheme']) || !in_array($parsed['scheme'], ['http', 'https'])) {
            ResponseHelper::error('Hanya URL HTTP/HTTPS yang diizinkan', 400);
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
            ResponseHelper::error("Text minimal {$minLength} karakter", 400);
        }

        if ($length > $maxLength) {
            ResponseHelper::error("Text maksimal {$maxLength} karakter", 400);
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
            ResponseHelper::error('Input harus berupa array', 400);
        }

        if (count($value) > $maxItems) {
            ResponseHelper::error("Array maksimal {$maxItems} item", 400);
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