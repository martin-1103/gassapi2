<?php
namespace App\Services;

use App\Repositories\UserRepository;
use App\Repositories\RefreshTokenRepository;
use App\Helpers\ResponseHelper;
use App\Helpers\JwtHelper;

/**
 * Authentication Service untuk centralize auth logic
 */
class AuthService {

    private $userRepository;
    private $refreshTokenRepository;

    public function __construct() {
        $this->userRepository = new UserRepository();
        $this->refreshTokenRepository = new RefreshTokenRepository();
    }

    /**
     * User login
     */
    public function login($email, $password) {
        // Validate input
        $this->validateLoginInput($email, $password);

        // Find user
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            ResponseHelper::error('Invalid credentials', 401);
        }

        // Verify password
        if (!password_verify($password, $user['password_hash'])) {
            ResponseHelper::error('Invalid credentials', 401);
        }

        // Check if user is active
        if (!$user['is_active']) {
            ResponseHelper::error('Account is disabled', 403);
        }

        // Generate tokens
        $tokens = JwtHelper::generateTokenPair(
            $user['id'],
            $user['email'],
            $user['token_version'] ?? 0
        );

        // Store refresh token
        $this->refreshTokenRepository->create(
            $user['id'],
            JwtHelper::createTokenHash($tokens['refresh_token']),
            $this->refreshTokenRepository->getExpirationTime()
        );

        // Update last login
        $this->userRepository->updateLastLogin($user['id']);

        // Return tokens directly for test compatibility
        return array_merge($tokens, [
            'user' => $this->userRepository->sanitize($user)
        ]);
    }

    /**
     * User registration
     */
    public function register($email, $name, $password) {
        // Validate input
        $this->validateRegistrationInput($email, $name, $password);

        // Check if user already exists
        if ($this->userRepository->emailExists($email)) {
            ResponseHelper::error('User already exists', 409);
        }

        // Create user
        $userData = [
            'email' => $email,
            'name' => $name,
            'password_hash' => password_hash($password, PASSWORD_BCRYPT, ['cost' => 12])
        ];

        $userId = $this->userRepository->create($userData);

        // Get created user
        $user = $this->userRepository->findByIdSanitized($userId);

        return [
            'user' => $user,
            'message' => 'User registered successfully'
        ];
    }

    /**
     * Refresh access token
     */
    public function refreshToken($refreshToken) {
        // Validate refresh token format
        if (!$this->refreshTokenRepository->validateTokenFormat($refreshToken)) {
            ResponseHelper::error('Invalid refresh token format', 400);
        }

        // Validate JWT refresh token
        $jwtPayload = JwtHelper::validateRefreshToken($refreshToken);
        if (!$jwtPayload) {
            ResponseHelper::error('Invalid refresh token', 401);
        }

        // Find stored refresh token
        $tokenHash = JwtHelper::createTokenHash($refreshToken);
        $storedToken = $this->refreshTokenRepository->findActiveByHash($tokenHash);

        if (!$storedToken) {
            ResponseHelper::error('Refresh token not found or expired', 401);
        }

        // Get user
        $user = $this->userRepository->findById($jwtPayload['sub']);
        if (!$user || !$user['is_active']) {
            ResponseHelper::error('User not found or inactive', 401);
        }

        // Check token version
        $jwtVersion = $jwtPayload['version'] ?? 0;
        $userTokenVersion = $user['token_version'] ?? 0;

        if ($jwtVersion !== $userTokenVersion) {
            // Token version mismatch - deactivate this refresh token
            $this->refreshTokenRepository->deactivateByHash($tokenHash);
            ResponseHelper::error('Refresh token has been invalidated', 401);
        }

        // Generate new token pair
        $newTokens = JwtHelper::generateTokenPair(
            $user['id'],
            $user['email'],
            $user['token_version']
        );

        // Store new refresh token
        $this->refreshTokenRepository->create(
            $user['id'],
            JwtHelper::createTokenHash($newTokens['refresh_token']),
            $this->refreshTokenRepository->getExpirationTime()
        );

        // Deactivate old refresh token (one-time use)
        $this->refreshTokenRepository->deactivateByHash($tokenHash);

        return [
            'tokens' => $newTokens,
            'user' => $this->userRepository->sanitize($user)
        ];
    }

    /**
     * User logout
     */
    public function logout($refreshToken = null) {
        // If refresh token provided, deactivate it
        if ($refreshToken) {
            $tokenHash = JwtHelper::createTokenHash($refreshToken);
            $this->refreshTokenRepository->deactivateByHash($tokenHash);
        }

        return [
            'message' => 'Logout successful'
        ];
    }

    /**
     * Logout from all devices
     */
    public function logoutAll($userId) {
        // Increment token version to invalidate all tokens
        $this->userRepository->incrementTokenVersion($userId);

        // Deactivate all refresh tokens for user
        $this->refreshTokenRepository->deactivateAllForUser($userId);

        return [
            'message' => 'Logged out from all devices'
        ];
    }

    /**
     * Validate access token and return user
     */
    public function validateAccessToken($token) {
        // Extract token from header if needed
        if (is_string($token)) {
            $jwtToken = $token;
        } else {
            $jwtToken = JwtHelper::getTokenFromRequest();
        }

        if (!$jwtToken) {
            ResponseHelper::error('No access token provided', 401);
        }

        // Validate JWT
        $payload = JwtHelper::validateAccessToken($jwtToken);
        if (!$payload) {
            ResponseHelper::error('Invalid or expired access token', 401);
        }

        // Get user
        $user = $this->userRepository->findById($payload['sub']);
        if (!$user) {
            ResponseHelper::error('User not found', 401);
        }

        // Check if user is active
        if (!$user['is_active']) {
            ResponseHelper::error('User account is disabled', 403);
        }

        // Check token version
        $jwtVersion = $payload['version'] ?? 0;
        $userTokenVersion = $user['token_version'] ?? 0;

        if ($jwtVersion !== $userTokenVersion) {
            ResponseHelper::error('Token has been invalidated', 401);
        }

        return $this->userRepository->sanitize($user);
    }

    /**
     * Change user password
     */
    public function changePassword($userId, $currentPassword, $newPassword) {
        // Get user
        $user = $this->userRepository->findById($userId);
        if (!$user) {
            ResponseHelper::error('User not found', 404);
        }

        // Verify current password
        if (!password_verify($currentPassword, $user['password_hash'])) {
            ResponseHelper::error('Current password is incorrect', 400);
        }

        // Update password
        $this->userRepository->updatePassword($userId, $newPassword);

        // Logout from all devices (invalidate tokens)
        $this->logoutAll($userId);

        return [
            'message' => 'Password changed successfully'
        ];
    }

    /**
     * Get user profile
     */
    public function getProfile($userId) {
        $user = $this->userRepository->findByIdSanitized($userId);

        if (!$user) {
            ResponseHelper::error('User not found', 404);
        }

        return $user;
    }

    /**
     * Update user profile
     */
    public function updateProfile($userId, $data) {
        // Handle empty data case
        if (empty($data)) {
            ResponseHelper::error('No update data provided', 400);
        }

        // Allowed fields for profile update
        $allowedFields = ['name', 'email', 'avatar_url'];
        $updateData = [];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        if (empty($updateData)) {
            ResponseHelper::error('No valid fields to update', 400);
        }

        // Validate specific fields
        if (isset($updateData['name'])) {
            $this->validateProfileName($updateData['name']);
        }

        if (isset($updateData['email'])) {
            $this->validateProfileEmail($updateData['email'], $userId);
        }

        // Update user
        $this->userRepository->update($userId, $updateData);

        // Get updated user
        $user = $this->userRepository->findByIdSanitized($userId);

        return $user;
    }

    /**
     * Validate login input
     */
    private function validateLoginInput($email, $password) {
        if (empty($email)) {
            ResponseHelper::error('Email is required', 400);
        }

        if (empty($password)) {
            ResponseHelper::error('Password is required', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error('Invalid email format', 400);
        }
    }

    /**
     * Validate registration input
     */
    private function validateRegistrationInput($email, $name, $password) {
        $this->validateLoginInput($email, $password);

        if (empty($name)) {
            ResponseHelper::error('Name is required', 400);
        }

        if (strlen(trim($name)) < 2) {
            ResponseHelper::error('Name must be at least 2 characters', 400);
        }

        if (strlen($name) > 100) {
            ResponseHelper::error('Name must be less than 100 characters', 400);
        }

        // XSS protection for registration name
        $this->validateXSS($name);

        if (strlen($password) < 8) {
            ResponseHelper::error('Password must be at least 8 characters', 400);
        }

        // Password complexity
        $hasUpper = preg_match('/[A-Z]/', $password);
        $hasLower = preg_match('/[a-z]/', $password);
        $hasNumber = preg_match('/[0-9]/', $password);

        if (!$hasUpper || !$hasLower || !$hasNumber) {
            ResponseHelper::error('Password must contain uppercase, lowercase, and numbers', 400);
        }
    }

    /**
     * Validate profile name
     */
    private function validateProfileName($name) {
        if (empty($name) || trim($name) === '') {
            ResponseHelper::error('Name cannot be empty', 400);
        }

        if (strlen(trim($name)) < 2) {
            ResponseHelper::error('Name must be at least 2 characters', 400);
        }

        if (strlen($name) > 100) {
            ResponseHelper::error('Name must be less than 100 characters', 400);
        }

        // Comprehensive XSS protection
        $this->validateXSS($name);
    }

    /**
     * Comprehensive XSS validation
     */
    private function validateXSS($input) {
        // Convert to lowercase for case-insensitive matching
        $lowerInput = strtolower($input);

        // Check for dangerous HTML tags
        $dangerousTags = [
            'script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea',
            'link', 'meta', 'style', 'applet', 'body', 'html', 'head', 'title',
            'base', 'bgsound', 'blink', 'ilayer', 'layer', 'marquee', 'xml'
        ];

        foreach ($dangerousTags as $tag) {
            if (strpos($lowerInput, '<' . $tag) !== false ||
                strpos($lowerInput, $tag . '>') !== false) {
                ResponseHelper::error('Name contains invalid content', 400);
            }
        }

        // Check for JavaScript protocols (case-insensitive)
        $dangerousProtocols = [
            'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:', 'http:', 'https:'
        ];

        foreach ($dangerousProtocols as $protocol) {
            if (strpos($lowerInput, $protocol) !== false) {
                ResponseHelper::error('Name contains invalid content', 400);
            }
        }

        // Check for dangerous event handlers (case-insensitive)
        $dangerousEvents = [
            'onerror', 'onclick', 'onload', 'onmouseover', 'onmouseout', 'onfocus',
            'onblur', 'onchange', 'onsubmit', 'onreset', 'onselect', 'onkeydown',
            'onkeyup', 'onkeypress', 'onmousedown', 'onmouseup', 'onmousemove',
            'ondblclick', 'oncontextmenu', 'ondrag', 'ondrop', 'onfocusin',
            'onfocusout', 'onhashchange', 'oninput', 'oninvalid', 'onkeydown',
            'onkeypress', 'onkeyup', 'onload', 'onloadeddata', 'onloadedmetadata',
            'onloadstart', 'onmessage', 'onmousedown', 'onmouseenter', 'onmouseleave',
            'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup', 'onmousewheel',
            'onoffline', 'ononline', 'onpagehide', 'onpageshow', 'onpaste', 'onpause',
            'onplay', 'onplaying', 'onpopstate', 'onprogress', 'onratechange',
            'onreset', 'onresize', 'onscroll', 'onsearch', 'onseeked', 'onseeking',
            'onselect', 'onstalled', 'onstorage', 'onsubmit', 'onsuspend', 'ontimeupdate',
            'ontoggle', 'onunload', 'onvolumechange', 'onwaiting', 'onwheel'
        ];

        foreach ($dangerousEvents as $event) {
            if (strpos($lowerInput, $event) !== false) {
                ResponseHelper::error('Name contains invalid content', 400);
            }
        }

        // Check for dangerous attributes (case-insensitive)
        $dangerousAttributes = [
            'src=', 'href=', 'action=', 'background=', 'dynsrc=', 'lowsrc=',
            'codebase=', 'classid=', 'data=', 'formaction=', 'poster=', 'archive=',
            'usemap=', 'profile=', 'manifest=', 'xlink:href=', 'xml:base='
        ];

        foreach ($dangerousAttributes as $attr) {
            if (strpos($lowerInput, $attr) !== false) {
                ResponseHelper::error('Name contains invalid content', 400);
            }
        }

        // Check for encoded/obfuscated attacks
        if (preg_match('/&[#\w]+;/', $input)) {
            // Decode HTML entities and check again
            $decoded = html_entity_decode($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
            if ($decoded !== $input) {
                $this->validateXSS($decoded); // Recursive check
                return;
            }
        }

        // Check for common XSS patterns
        $xssPatterns = [
            '/<[^>]*>[^<]*<[^>]*>/', // Nested tags
            '/expression\s*\(/i', // CSS expression
            '/@import/i', // CSS import
            '/url\s*\(/i', // CSS URL
            '/&#\d+;/', // HTML entities
            '/&#x[0-9a-f]+;/i', // Hex entities
            '/\\u[0-9a-f]{4}/i', // Unicode escapes
            '/%[0-9a-f]{2}/i', // URL encoding
        ];

        foreach ($xssPatterns as $pattern) {
            if (preg_match($pattern, $input)) {
                ResponseHelper::error('Name contains invalid content', 400);
            }
        }

        // Final sanitization check - strip tags should not change the input
        $cleanInput = strip_tags($input);
        $cleanInput = htmlspecialchars($cleanInput, ENT_QUOTES | ENT_HTML5, 'UTF-8');

        // If after sanitization the content is different, it was likely malicious
        if (strip_tags($input) !== $input ||
            htmlspecialchars_decode($cleanInput, ENT_QUOTES | ENT_HTML5) !== $input) {
            ResponseHelper::error('Name contains invalid characters', 400);
        }
    }

    /**
     * Validate profile email
     */
    private function validateProfileEmail($email, $excludeUserId = null) {
        if (empty($email) || trim($email) === '') {
            ResponseHelper::error('Email cannot be empty', 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ResponseHelper::error('Invalid email format', 400);
        }

        // XSS protection for email field
        $this->validateXSS($email);

        // Check if email already exists (exclude current user)
        if ($this->userRepository->emailExists($email, $excludeUserId)) {
            ResponseHelper::error('Email already exists', 400);
        }
    }
}