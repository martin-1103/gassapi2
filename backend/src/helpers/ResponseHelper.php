<?php
namespace App\Helpers;

/**
 * Enhanced Response helper dengan consistent error handling dan security headers
 */
class ResponseHelper {

    /**
     * JSON response helper dengan security headers
     */
    public static function json($data, $status = 200, $message = 'success') {
        // Set security headers
        self::setSecurityHeaders();

        // Normalize status code
        $status = (int)$status;

        // Format response consistently
        $response = [
            'success' => $status < 400,
            'status_code' => $status,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s'),
            'request_id' => self::generateRequestId()
        ];

        // Add data only if present
        if ($data !== null) {
            $response['data'] = $data;
        }

        // Add error details for debugging (in development)
        if ($status >= 400 && self::isDevelopment()) {
            $response['debug'] = [
                'error_type' => self::getErrorType($status),
                'suggestion' => self::getErrorSuggestion($status)
            ];
        }

        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /**
     * Enhanced error response helper
     */
    public static function error($message, $status = 400, $errorCode = null) {
        $enhancedMessage = self::enhanceErrorMessage($message, $status, $errorCode);
        self::json(null, $status, $enhancedMessage);
    }

    /**
     * Success response helper
     */
    public static function success($data, $message = 'success') {
        self::json($data, 200, $message);
    }

    /**
     * Created response helper
     */
    public static function created($data, $message = 'Resource created successfully') {
        self::json($data, 201, $message);
    }

    /**
     * Unauthorized response helper
     */
    public static function unauthorized($message = 'Authentication required') {
        self::json(null, 401, $message);
    }

    /**
     * Forbidden response helper
     */
    public static function forbidden($message = 'Access denied') {
        self::json(null, 403, $message);
    }

    /**
     * Not found response helper
     */
    public static function notFound($message = 'Resource not found') {
        self::json(null, 404, $message);
    }

    /**
     * Validation error response helper
     */
    public static function validationError($errors, $message = 'Validation failed') {
        $data = [
            'validation_errors' => is_array($errors) ? $errors : ['general' => $errors],
            'field_count' => is_array($errors) ? count($errors) : 1
        ];
        self::json($data, 422, $message);
    }

    /**
     * Rate limit response helper
     */
    public static function rateLimit($message = 'Too many requests', $retryAfter = 60) {
        header("Retry-After: {$retryAfter}");
        self::json(['retry_after' => $retryAfter], 429, $message);
    }

    /**
     * Server error response helper
     */
    public static function serverError($message = 'Internal server error') {
        self::json(null, 500, $message);
    }

    /**
     * Set security headers untuk setiap response
     */
    private static function setSecurityHeaders() {
        // Prevent XSS attacks
        header('X-Content-Type-Options: nosniff');
        header('X-Frame-Options: DENY');
        header('X-XSS-Protection: 1; mode=block');

        // Prevent clickjacking
        header('Content-Security-Policy: default-src \'self\'');

        // Prevent MIME type sniffing
        header('X-Content-Type-Options: nosniff');

        // HSTS (HTTPS only)
        if (self::isHTTPS()) {
            header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
        }

        // CORS headers (adjust as needed)
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-CSRF-Token, X-XSRF-Token');

        // Hide server information
        header('Server: GASS-API');
        header('X-Powered-By: PHP');
    }

    /**
     * Generate unique request ID untuk tracking
     */
    private static function generateRequestId() {
        return uniqid('req_', true);
    }

    /**
     * Check if environment is development
     */
    private static function isDevelopment() {
        return (getenv('APP_ENV') ?: 'development') === 'development' ||
               (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'development');
    }

    /**
     * Check if request is HTTPS
     */
    private static function isHTTPS() {
        return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ||
               $_SERVER['SERVER_PORT'] == 443 ||
               (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
    }

    /**
     * Get error type berdasarkan status code
     */
    private static function getErrorType($status) {
        if ($status >= 400 && $status < 500) {
            return 'client_error';
        } elseif ($status >= 500) {
            return 'server_error';
        }
        return 'unknown';
    }

    /**
     * Get error suggestion berdasarkan status code
     */
    private static function getErrorSuggestion($status) {
        $suggestions = [
            400 => 'Periksa format data yang dikirim',
            401 => 'Periksa kembali token otentikasi Anda',
            403 => 'Anda tidak memiliki izin untuk akses resource ini',
            404 => 'Resource yang diminta tidak ditemukan',
            422 => 'Periksa kembali field yang wajib diisi',
            429 => 'Tunggu beberapa saat sebelum mencoba kembali',
            500 => 'Terjadi kesalahan server, coba lagi nanti'
        ];

        return $suggestions[$status] ?? 'Hubungi administrator untuk bantuan';
    }

    /**
     * Enhance error message dengan konteks tambahan
     */
    private static function enhanceErrorMessage($message, $status, $errorCode) {
        // Add error code if provided
        if ($errorCode) {
            $message = "[{$errorCode}] {$message}";
        }

        // Add status context for common errors
        switch ($status) {
            case 400:
                return "Permintaan tidak valid: {$message}";
            case 401:
                return "Otentikasi gagal: {$message}";
            case 403:
                return "Akses ditolak: {$message}";
            case 404:
                return "Tidak ditemukan: {$message}";
            case 422:
                return "Validasi gagal: {$message}";
            default:
                return $message;
        }
    }
}