<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\DatabaseHelper;

/**
 * Health check handler
 */
class HealthHandler {

    /**
     * Get application health status
     */
    public function getStatus() {
        try {
            $db = DatabaseHelper::getConnection();
            $dbStatus = $db ? 'connected' : 'disconnected';

            $status = [
                'app' => 'Backend PHP API',
                'version' => '1.0.0',
                'timestamp' => date('Y-m-d H:i:s'),
                'environment' => $_ENV['APP_ENV'] ?? 'unknown',
                'database' => $dbStatus,
                'memory_usage' => memory_get_usage(true),
                'peak_memory' => memory_get_peak_usage(true)
            ];

            ResponseHelper::success($status);
        } catch (\Exception $e) {
            ResponseHelper::error('Health check failed: ' . $e->getMessage(), 500);
        }
    }
}