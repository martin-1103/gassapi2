<?php

namespace App\Config;

class Database {
    private static $config = null;

    public static function getConfig() {
        if (self::$config === null) {
            self::$config = [
                'host' => $_ENV['DB_HOST'] ?? 'localhost',
                'username' => $_ENV['DB_USERNAME'] ?? 'root',
                'password' => $_ENV['DB_PASSWORD'] ?? '',
                'database' => $_ENV['DB_DATABASE'] ?? 'testdb',
                'port' => $_ENV['DB_PORT'] ?? 3306,
                'charset' => $_ENV['DB_CHARSET'] ?? 'utf8mb4',
                'collation' => $_ENV['DB_COLLATION'] ?? 'utf8mb4_unicode_ci'
            ];
        }
        return self::$config;
    }

    public static function getMysqliDbConfig() {
        $config = self::getConfig();
        return [
            'host' => $config['host'],
            'username' => $config['username'],
            'password' => $config['password'],
            'db' => $config['database'],
            'port' => $config['port'],
            'charset' => $config['charset']
        ];
    }

    public static function updateConfig($newConfig) {
        self::$config = array_merge(self::getConfig(), $newConfig);
    }
}