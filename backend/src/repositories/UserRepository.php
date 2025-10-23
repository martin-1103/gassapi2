<?php
namespace App\Repositories;

use App\Repositories\RepositoryException;

/**
 * User Repository untuk semua user-related database operations
 */
class UserRepository extends BaseRepository {

    protected function getTableName() {
        return 'users';
    }

    /**
     * Find user by email
     */
    public function findByEmail($email) {
        return $this->findBy('email', $email);
    }

    /**
     * Check if email exists
     */
    public function emailExists($email) {
        return $this->exists('email', $email);
    }

    /**
     * Find user by ID with sanitization
     */
    public function findByIdSanitized($id) {
        $user = $this->findById($id);
        return $this->sanitize($user);
    }

    /**
     * Get all users with sanitization
     */
    public function allSanitized($limit = null, $orderBy = 'created_at DESC') {
        $users = $this->all($limit, $orderBy);
        return array_map([$this, 'sanitize'], $users);
    }

    /**
     * Create new user with validation
     */
    public function create($userData) {
        // Validate required fields
        $this->validateCreateData($userData);

        // Generate unique ID if not provided
        if (!isset($userData['id'])) {
            $userData['id'] = 'user_' . time() . '_' . substr(md5(uniqid()), 0, 6);
        }

        // Set default values
        $userData = array_merge([
            'is_active' => 1,
            'token_version' => 0
        ], $userData);

        return parent::create($userData);
    }

    /**
     * Update user with validation
     */
    public function update($id, $data) {
        // Validate update data
        $this->validateUpdateData($data);

        // Remove sensitive fields that shouldn't be updated directly
        unset($data['password_hash'], $data['id']);

        return parent::update($id, $data);
    }

    /**
     * Update user password
     */
    public function updatePassword($id, $newPassword) {
        $this->validatePassword($newPassword);

        $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        return parent::update($id, [
            'password_hash' => $hashedPassword,
            'token_version' => $this->getTokenVersion($id) + 1 // Invalidate all tokens
        ]);
    }

    /**
     * Update last login timestamp
     */
    public function updateLastLogin($id) {
        return parent::update($id, [
            'last_login_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Activate/Deactivate user
     */
    public function setActive($id, $isActive) {
        return parent::update($id, [
            'is_active' => $isActive ? 1 : 0
        ]);
    }

  
    /**
     * Increment token version (invalidates all existing tokens)
     */
    public function incrementTokenVersion($id) {
        $currentVersion = $this->getTokenVersion($id);
        return parent::update($id, [
            'token_version' => $currentVersion + 1
        ]);
    }

    /**
     * Get user token version
     */
    public function getTokenVersion($id) {
        $user = $this->findById($id);
        return $user ? (int)($user['token_version'] ?? 0) : 0;
    }

    /**
     * Get active users only
     */
    public function findActiveUsers($limit = null) {
        $db = self::getConnection();
        $db->where('is_active', 1);

        return $db->get($this->getTableName(), $limit);
    }

    /**
     * Search users by name or email
     */
    public function search($query, $limit = 10) {
        $db = self::getConnection();
        $db->where('is_active', 1);
        $db->where("(`name` LIKE ? OR `email` LIKE ?)", ["%$query%", "%$query%"]);

        return $db->get($this->getTableName(), $limit);
    }

    /**
     * Remove sensitive data from user
     */
    public function sanitize($user) {
        if (!$user) {
            return null;
        }

        unset($user['password_hash']);
        return $user;
    }

    /**
     * Remove sensitive data from array of users
     */
    public function sanitizeMany($users) {
        if (!is_array($users)) {
            return [];
        }

        return array_map([$this, 'sanitize'], $users);
    }

    /**
     * Validate user creation data
     */
    private function validateCreateData($data) {
        $required = ['email', 'name', 'password_hash'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                throw new RepositoryException("Field '$field' is required", 400);
            }
        }

        // Validate email format
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            throw new RepositoryException('Invalid email format', 400);
        }

        // Check unique email
        if ($this->emailExists($data['email'])) {
            throw new RepositoryException('Email already exists', 409);
        }

        // Validate name
        if (strlen(trim($data['name'])) < 2) {
            throw new RepositoryException('Name must be at least 2 characters', 400);
        }
    }

    /**
     * Validate user update data
     */
    private function validateUpdateData($data) {
        // Validate email if provided
        if (isset($data['email'])) {
            if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                throw new RepositoryException('Invalid email format', 400);
            }

            // Check if email is taken by another user
            $existingUser = $this->findByEmail($data['email']);
            if ($existingUser && $existingUser['id'] !== ($data['id'] ?? null)) {
                throw new RepositoryException('Email already exists', 409);
            }
        }

        // Validate name if provided
        if (isset($data['name']) && strlen(trim($data['name'])) < 2) {
            throw new RepositoryException('Name must be at least 2 characters', 400);
        }

        // Validate is_active if provided
        if (isset($data['is_active']) && !in_array($data['is_active'], [0, 1])) {
            throw new RepositoryException('is_active must be 0 or 1', 400);
        }
    }

    /**
     * Validate password
     */
    private function validatePassword($password) {
        if (strlen($password) < 8) {
            throw new RepositoryException('Password must be at least 8 characters', 400);
        }

        // Add more password validation as needed
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasLower = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);

        if (!$hasUpper || !$hasLower || !$hasNumber) {
            throw new RepositoryException('Password must contain uppercase, lowercase, and numbers', 400);
        }
    }
}