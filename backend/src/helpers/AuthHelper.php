<?php
namespace App\Helpers;

use App\Repositories\McpTokenRepository;
use App\Repositories\ProjectRepository;

/**
 * Universal Authentication Helper - Supports JWT and MCP tokens
 */
class AuthHelper {

    /**
     * Validate universal token (JWT or MCP)
     * Returns user context or null if invalid
     */
    public static function validateUniversalToken($authorizationHeader = null) {
        // Extract token from header if not provided
        if (!$authorizationHeader) {
            $authorizationHeader = self::getAuthHeader();
        }

        if (!$authorizationHeader) {
            return null;
        }

        // Extract token from Bearer format
        $token = JwtHelper::extractTokenFromHeader($authorizationHeader);
        if (!$token) {
            return null;
        }

        // Try JWT validation first
        $jwtPayload = JwtHelper::validateAccessToken($token);
        if ($jwtPayload) {
            return [
                'id' => $jwtPayload['sub'],
                'email' => $jwtPayload['email'] ?? null,
                'token_type' => 'jwt',
                'token_version' => $jwtPayload['version'] ?? 0,
                'exp' => $jwtPayload['exp'] ?? null
            ];
        }

        // Try MCP token validation
        try {
            $mcpRepo = new McpTokenRepository();
            $mcpRecord = $mcpRepo->findActiveByPlainToken($token);

            if ($mcpRecord) {
                // Update last validated timestamp
                $mcpRepo->setLastValidatedNow($mcpRecord['id']);

                // Get project info to return user context
                $projectRepo = new ProjectRepository();
                $project = $projectRepo->findById($mcpRecord['project_id']);

                if ($project) {
                    return [
                        'id' => $project['owner_id'] ?? $project['user_id'], // Return project owner as user
                        'email' => null,
                        'project_id' => $mcpRecord['project_id'],
                        'token_type' => 'mcp',
                        'mcp_token_id' => $mcpRecord['id']
                    ];
                }
            }
        } catch (\Exception $e) {
            error_log("MCP token validation error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get authorization header from various sources
     */
    private static function getAuthHeader() {
        // Try $_SERVER first
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            return $_SERVER['HTTP_AUTHORIZATION'];
        }

        // Try REDIRECT_HTTP_AUTHORIZATION (Apache workaround)
        if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            return $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }

        // Try getallheaders() as fallback for Apache environments
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                return $headers['Authorization'];
            }

            // Case-insensitive fallback
            foreach ($headers as $key => $value) {
                if (strtolower($key) === 'authorization') {
                    return $value;
                }
            }
        }

        return null;
    }

    /**
     * Check if user has access to specific project
     * Works with both JWT and MCP tokens
     */
    public static function validateProjectAccess($projectId) {
        $user = self::validateUniversalToken();
        if (!$user) {
            return null;
        }

        // For MCP tokens, project_id is already in the user context
        if ($user['token_type'] === 'mcp') {
            if ($user['project_id'] === $projectId) {
                return $user;
            }
            return null;
        }

        // For JWT tokens, check if user owns project or is member
        try {
            $projectRepo = new ProjectRepository();
            $project = $projectRepo->findForUser($projectId, $user['id']);

            if ($project) {
                $user['project_id'] = $projectId;
                return $user;
            }
        } catch (\Exception $e) {
            error_log("Project access validation error: " . $e->getMessage());
        }

        return null;
    }

    /**
     * Get current authenticated user (universal)
     */
    public static function getCurrentUser() {
        return self::validateUniversalToken();
    }

    /**
     * Require authentication (sends error response if not authenticated)
     */
    public static function requireAuth() {
        $user = self::validateUniversalToken();
        if (!$user) {
            ResponseHelper::error('Authentication required', 401);
        }
        return $user;
    }

    /**
     * Require project access (sends error response if no access)
     */
    public static function requireProjectAccess($projectId) {
        $user = self::validateProjectAccess($projectId);
        if (!$user) {
            ResponseHelper::error('Project access denied', 403);
        }
        return $user;
    }
}