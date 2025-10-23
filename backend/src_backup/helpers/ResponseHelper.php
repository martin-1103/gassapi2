<?php
namespace App\Helpers;

/**
 * Response helper untuk API responses
 */
class ResponseHelper {

    /**
     * JSON response helper
     */
    public static function json($data, $status = 200, $message = 'success') {
        http_response_code($status);
        echo json_encode([
            'status' => $status < 400 ? 'success' : 'error',
            'message' => $message,
            'data' => $data,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit;
    }

    /**
     * Error response helper
     */
    public static function error($message, $status = 400) {
        self::json(null, $status, $message);
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
}