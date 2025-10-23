<?php
namespace App\Helpers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * JWT Helper untuk JWT token generation dan validation
 */
class JwtHelper {

    private static $accessSecret = null;
    private static $refreshSecret = null;

    /**
     * Get JWT secrets from environment
     */
    private static function getAccessSecret() {
        if (self::$accessSecret === null) {
            self::$accessSecret = $_ENV['JWT_ACCESS_SECRET'] ?? 'default_access_secret_key_change_in_production';
        }
        return self::$accessSecret;
    }

    private static function getRefreshSecret() {
        if (self::$refreshSecret === null) {
            self::$refreshSecret = $_ENV['JWT_REFRESH_SECRET'] ?? 'default_refresh_secret_key_change_in_production';
        }
        return self::$refreshSecret;
    }

    /**
     * Generate access token
     */
    public static function generateAccessToken($userId, $email, $tokenVersion = 0, $expiresInMinutes = 15) {
        $payload = [
            'iss' => $_ENV['APP_NAME'] ?? 'GASSAPI', // Issuer
            'aud' => $_ENV['APP_URL'] ?? 'localhost', // Audience
            'iat' => time(), // Issued at
            'exp' => time() + ($expiresInMinutes * 60), // Expiration
            'sub' => $userId, // Subject (user ID)
            'email' => $email,
            'type' => 'access',
            'version' => (int)$tokenVersion
        ];

        return JWT::encode($payload, self::getAccessSecret(), 'HS256');
    }

    /**
     * Generate refresh token
     */
    public static function generateRefreshToken($userId, $tokenVersion = 0, $expiresInDays = 7) {
        $payload = [
            'iss' => $_ENV['APP_NAME'] ?? 'GASSAPI',
            'aud' => $_ENV['APP_URL'] ?? 'localhost',
            'iat' => time(),
            'exp' => time() + ($expiresInDays * 24 * 60 * 60), // Days to seconds
            'sub' => $userId,
            'type' => 'refresh',
            'version' => (int)$tokenVersion
        ];

        return JWT::encode($payload, self::getRefreshSecret(), 'HS256');
    }

    /**
     * Validate and decode access token
     */
    public static function validateAccessToken($token) {
        try {
            $payload = JWT::decode($token, new Key(self::getAccessSecret(), 'HS256'));

            // Validate token type
            if (!isset($payload->type) || $payload->type !== 'access') {
                throw new \Exception('Invalid token type');
            }

            // Check if expired (extra safety)
            if (isset($payload->exp) && $payload->exp < time()) {
                throw new \Exception('Token expired');
            }

            return (array)$payload;
        } catch (\Exception $e) {
            error_log("JWT Access Token Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Validate and decode refresh token
     */
    public static function validateRefreshToken($token) {
        try {
            $payload = JWT::decode($token, new Key(self::getRefreshSecret(), 'HS256'));

            // Validate token type
            if (!isset($payload->type) || $payload->type !== 'refresh') {
                throw new \Exception('Invalid token type');
            }

            // Check if expired
            if (isset($payload->exp) && $payload->exp < time()) {
                throw new \Exception('Token expired');
            }

            return (array)$payload;
        } catch (\Exception $e) {
            error_log("JWT Refresh Token Error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract token from Authorization header
     */
    public static function extractTokenFromHeader($authorizationHeader) {
        if (empty($authorizationHeader)) {
            return null;
        }

        // Expected format: "Bearer <token>"
        if (preg_match('/Bearer\s+(.*)$/i', $authorizationHeader, $matches)) {
            return trim($matches[1]);
        }

        return null;
    }

    /**
     * Get token from request (multiple sources)
     */
    public static function getTokenFromRequest() {
        // Try Authorization header first
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $token = self::extractTokenFromHeader($_SERVER['HTTP_AUTHORIZATION']);
            if ($token) {
                return $token;
            }
        }

        // Try $_GET parameter
        if (isset($_GET['token'])) {
            return $_GET['token'];
        }

        // Try $_POST
        if (isset($_POST['token'])) {
            return $_POST['token'];
        }

        return null;
    }

    /**
     * Generate token pair (access + refresh)
     */
    public static function generateTokenPair($userId, $email, $tokenVersion = 0) {
        return [
            'access_token' => self::generateAccessToken($userId, $email, $tokenVersion),
            'refresh_token' => self::generateRefreshToken($userId, $tokenVersion),
            'token_type' => 'Bearer',
            'expires_in' => 15 * 60 // 15 minutes in seconds
        ];
    }

    /**
     * Get user ID from token
     */
    public static function getUserIdFromToken($token) {
        $payload = self::validateAccessToken($token);
        return $payload['sub'] ?? null;
    }

    /**
     * Create token hash for storage
     */
    public static function createTokenHash($token) {
        return hash('sha256', $token);
    }

    /**
     * Validate token format
     */
    public static function isValidTokenFormat($token) {
        if (empty($token)) {
            return false;
        }

        // Basic JWT format check: should have 3 parts separated by dots
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        // Check if parts are valid base64
        foreach ($parts as $part) {
            if (!base64_decode($part, true)) {
                return false;
            }
        }

        return true;
    }

    // Keep helper surface minimal; add utilities on demand.
}