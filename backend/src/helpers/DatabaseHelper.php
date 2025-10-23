<?php
namespace App\Helpers;

use App\Config\Database;

/**
 * Database helper untuk basic database connection dan utility functions
 * Note: Untuk model-specific operations, gunakan Repository Pattern
 */
class DatabaseHelper {

    private static $db = null;

    /**
     * Get database connection instance
     */
    public static function getConnection() {
        if (self::$db === null) {
            try {
                self::$db = new \MysqliDb(Database::getMysqliDbConfig());
            } catch (\Exception $e) {
                error_log("Database connection failed: " . $e->getMessage());
                ResponseHelper::error('Database connection failed', 500);
            }
        }
        return self::$db;
    }

    /**
     * Test database connection
     */
    public static function testConnection() {
        try {
            $db = self::getConnection();
            $db->rawQuery("SELECT 1");
            return true;
        } catch (\Exception $e) {
            error_log("Database connection test failed: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get database connection info
     */
    public static function getConnectionInfo() {
        try {
            $db = self::getConnection();
            $info = $db->getConnectionInfo();

            return [
                'connected' => true,
                'host' => $info['host'] ?? 'localhost',
                'database' => $info['database'] ?? 'unknown',
                'driver' => 'mysqli'
            ];
        } catch (\Exception $e) {
            return [
                'connected' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Execute raw SQL query
     * Use with caution - prefer Repository Pattern for model operations
     */
    public static function executeQuery($sql, $params = []) {
        $db = self::getConnection();

        try {
            if (!empty($params)) {
                // Handle parameterized queries
                $result = $db->rawQuery($sql, $params);
            } else {
                $result = $db->rawQuery($sql);
            }

            return $result;
        } catch (\Exception $e) {
            error_log("Query execution failed: " . $e->getMessage());
            throw new \Exception("Database query failed");
        }
    }


    /**
     * Get last database error
     */
    public static function getLastError() {
        $db = self::getConnection();
        return $db->getLastError();
    }

    /**
     * Get last insert ID
     */
    public static function getLastInsertId() {
        $db = self::getConnection();
        return $db->getInsertId();
    }

    /**
     * Get affected rows count
     */
    public static function getAffectedRows() {
        $db = self::getConnection();
        return $db->count;
    }

    /**
     * Escape string for SQL
     * Note: Better to use parameterized queries through repositories
     */
    public static function escape($string) {
        $db = self::getConnection();
        return $db->escape($string);
    }

    /**
     * Check if table exists
     */
    public static function tableExists($tableName) {
        $db = self::getConnection();
        $db->rawQuery("SHOW TABLES LIKE '$tableName'");
        return $db->count > 0;
    }

    /**
     * Get table schema info
     */
    public static function getTableSchema($tableName) {
        $db = self::getConnection();
        $db->rawQuery("DESCRIBE $tableName");
        return $db->getResults();
    }

    /**
     * Close database connection
     */
    public static function closeConnection() {
        if (self::$db) {
            self::$db = null;
        }
    }

    // Note: Model-specific operations should be implemented in Repositories
}