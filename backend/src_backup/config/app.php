<?php

namespace App\Config;

class App {
    private static $initialized = false;

    public static function get($key, $default = null) {
        return $_ENV[$key] ?? $default;
    }

    public static function getAppName() {
        return self::get('APP_NAME', 'Backend PHP');
    }

    public static function getAppVersion() {
        return self::get('APP_VERSION', '1.0.0');
    }

    public static function isDebugMode() {
        return self::get('APP_DEBUG', 'true') === 'true';
    }

    public static function getTimezone() {
        return self::get('APP_TIMEZONE', 'Asia/Jakarta');
    }

    public static function getEnvironment() {
        return self::get('APP_ENV', 'development');
    }

    public static function init() {
        if (self::$initialized) {
            return;
        }

        // Set timezone
        date_default_timezone_set(self::getTimezone());

        // Error reporting
        if (self::isDebugMode()) {
            error_reporting(E_ALL);
            ini_set('display_errors', 1);
        } else {
            error_reporting(0);
            ini_set('display_errors', 0);
        }

        self::$initialized = true;
    }

    public static function getSecurityConfig() {
        return [
            'bcrypt_rounds' => (int) self::get('BCRYPT_ROUNDS', 12),
            'jwt_secret' => self::get('JWT_SECRET'),
            'jwt_access_expire' => (int) self::get('JWT_ACCESS_EXPIRE', 900),
            'jwt_refresh_expire' => (int) self::get('JWT_REFRESH_EXPIRE', 604800)
        ];
    }

    public static function getApiConfig() {
        return [
            'version' => self::get('API_VERSION', 'v1'),
            'prefix' => self::get('API_PREFIX', '/api/v1'),
            'cors_origin' => self::get('CORS_ORIGIN', 'http://localhost:3000')
        ];
    }

    public static function getServerConfig() {
        return [
            'port' => (int) self::get('SERVER_PORT', 8080),
            'host' => self::get('SERVER_HOST', '0.0.0.0')
        ];
    }

    public static function getLogConfig() {
        return [
            'level' => self::get('LOG_LEVEL', 'info'),
            'file_enabled' => self::get('LOG_FILE_ENABLED', 'false') === 'true',
            'file_path' => self::get('LOG_FILE_PATH', './logs/app.log')
        ];
    }

    public static function isDevMode() {
        return self::getEnvironment() === 'development';
    }

    public static function isSqlDebug() {
        return self::get('DEV_SQL_DEBUG', 'false') === 'true';
    }
}