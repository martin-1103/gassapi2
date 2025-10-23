<?php
namespace App\Repositories;

/**
 * RefreshToken Repository untuk JWT refresh token management
 */
class RefreshTokenRepository extends BaseRepository {

    protected function getTableName() {
        return 'refresh_tokens';
    }

    /**
     * Create new refresh token
     */
    public function create($data) {
        // Handle backward compatibility for calls with individual parameters
        if (func_num_args() === 3) {
            $args = func_get_args();
            $data = [
                'id' => 'rt_' . time() . '_' . substr(md5(uniqid()), 0, 8),
                'user_id' => $args[0],
                'token_hash' => $args[1],
                'expires_at' => $args[2],
                'is_active' => 1
            ];
        } else {
            // Ensure required fields
            if (!isset($data['id'])) {
                $data['id'] = 'rt_' . time() . '_' . substr(md5(uniqid()), 0, 8);
            }
            if (!isset($data['is_active'])) {
                $data['is_active'] = 1;
            }
        }

        return parent::create($data);
    }

    /**
     * Create new refresh token with individual parameters (helper method)
     */
    public function createToken($userId, $tokenHash, $expiresAt) {
        return $this->create([
            'user_id' => $userId,
            'token_hash' => $tokenHash,
            'expires_at' => $expiresAt
        ]);
    }

    /**
     * Find active refresh token by hash
     */
    public function findActiveByHash($tokenHash) {
        $db = self::getConnection();
        $db->where('token_hash', $tokenHash);
        $db->where('is_active', 1);
        $db->where('expires_at', date('Y-m-d H:i:s'), '>');

        return $db->getOne($this->getTableName());
    }

    /**
     * Find all refresh tokens for user
     */
    public function findByUserId($userId, $activeOnly = false) {
        $db = self::getConnection();
        $db->where('user_id', $userId);

        if ($activeOnly) {
            $db->where('is_active', 1);
            $db->where('expires_at', date('Y-m-d H:i:s'), '>');
        }

        $db->orderBy('created_at', 'DESC');

        return $db->get($this->getTableName());
    }

    /**
     * Deactivate refresh token by hash
     */
    public function deactivateByHash($tokenHash) {
        $db = self::getConnection();
        $db->where('token_hash', $tokenHash);

        $result = $db->update($this->getTableName(), ['is_active' => 0]);

        if (!$result) {
            error_log("Failed to deactivate refresh token: " . $db->getLastError());
        }

        return $result;
    }

    /**
     * Deactivate all refresh tokens for user
     */
    public function deactivateAllForUser($userId) {
        $db = self::getConnection();
        $db->where('user_id', $userId);
        $db->where('is_active', 1);

        $result = $db->update($this->getTableName(), ['is_active' => 0]);

        if (!$result) {
            error_log("Failed to deactivate all refresh tokens for user $userId: " . $db->getLastError());
        }

        return $result;
    }

    /**
     * Delete expired tokens
     */
    public function deleteExpired() {
        $db = self::getConnection();
        $db->where('expires_at', date('Y-m-d H:i:s'), '<');

        return $db->delete($this->getTableName());
    }

    /**
     * Delete inactive tokens
     */
    public function deleteInactive() {
        $db = self::getConnection();
        $db->where('is_active', 0);

        return $db->delete($this->getTableName());
    }

    /**
     * Cleanup old tokens (expired + inactive)
     */
    public function cleanup() {
        $expiredCount = $this->deleteExpired();
        $inactiveCount = $this->deleteInactive();

        return [
            'expired_deleted' => $expiredCount,
            'inactive_deleted' => $inactiveCount,
            'total_deleted' => $expiredCount + $inactiveCount
        ];
    }

    /**
     * Count active tokens for user
     */
    public function countActiveForUser($userId) {
        $db = self::getConnection();
        $db->where('user_id', $userId);
        $db->where('is_active', 1);
        $db->where('expires_at', date('Y-m-d H:i:s'), '>');

        return $db->getValue($this->getTableName(), "COUNT(*)");
    }

    /**
     * Check if user has too many active tokens
     */
    public function hasTooManyTokens($userId, $maxTokens = 5) {
        return $this->countActiveForUser($userId) >= $maxTokens;
    }

    /**
     * Deactivate oldest tokens for user (keep only N most recent)
     */
    public function deactivateOldestTokens($userId, $keepCount = 3) {
        $db = self::getConnection();

        // Get tokens to keep (N most recent)
        $db->where('user_id', $userId);
        $db->where('is_active', 1);
        $db->where('expires_at', date('Y-m-d H:i:s'), '>');
        $db->orderBy('created_at', 'DESC');
        $db->limit($keepCount);

        $tokensToKeep = $db->get($this->getTableName(), null, 'id');

        if (empty($tokensToKeep)) {
            return 0;
        }

        $keepIds = array_column($tokensToKeep, 'id');

        // Deactivate all others
        $db = self::getConnection();
        $db->where('user_id', $userId);
        $db->where('is_active', 1);

        if (!empty($keepIds)) {
            $placeholders = str_repeat('?,', count($keepIds) - 1) . '?';
            $db->where("id NOT IN ($placeholders)", $keepIds);
        }

        $result = $db->update($this->getTableName(), ['is_active' => 0]);

        return $result !== false ? $db->count : 0;
    }

    /**
     * Validate refresh token format
     */
    public function validateTokenFormat($token) {
        if (empty($token)) {
            return false;
        }

        // Basic validation - token should be at least 32 characters
        if (strlen($token) < 32) {
            return false;
        }

        // Should only contain alphanumeric characters
        return ctype_alnum($token);
    }

    /**
     * Generate secure token hash
     */
    public function generateTokenHash($token) {
        return hash('sha256', $token);
    }

    /**
     * Get token expiration timestamp
     */
    public function getExpirationTime($days = 7) {
        return date('Y-m-d H:i:s', strtotime("+$days days"));
    }

    /**
     * Check if token is expired
     */
    public function isTokenExpired($token) {
        if (!$token || !isset($token['expires_at'])) {
            return true;
        }

        return strtotime($token['expires_at']) <= time();
    }

    /**
     * Get token with user info
     */
    public function findWithUser($tokenHash) {
        $db = self::getConnection();
        $db->where('rt.token_hash', $tokenHash);
        $db->where('rt.is_active', 1);
        $db->where('rt.expires_at', date('Y-m-d H:i:s'), '>');

        $db->join('users u', 'rt.user_id = u.id', 'LEFT');
        $db->orderBy('rt.created_at', 'DESC');

        return $db->getOne($this->getTableName() . ' rt', 'rt.*, u.email, u.name, u.is_active as user_active');
    }
}