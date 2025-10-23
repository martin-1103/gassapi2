<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Services\AuthService;
use App\Helpers\JwtHelper;

/**
 * Authentication handler dengan repository pattern
 */
class AuthHandler {

    private $authService;

    public function __construct() {
        $this->authService = new AuthService();
    }

    /**
     * User login
     */
    public function login() {
        $input = ValidationHelper::getJsonInput();

        // Validate required fields
        ValidationHelper::required($input, ['email', 'password']);

        // Validate email format
        $email = ValidationHelper::email($input['email']);
        $password = $input['password']; // AuthService handles validation

        try {
            $result = $this->authService->login($email, $password);

            ResponseHelper::success($result, 'Login successful');
        } catch (\Exception $e) {
            // AuthService already handles response errors with ResponseHelper
            // This catch is for unexpected errors only
            error_log("Login error: " . $e->getMessage());
            ResponseHelper::error('Login failed', 500);
        }
    }

    /**
     * User registration
     */
    public function register() {
        $input = ValidationHelper::getJsonInput();

        // Validate required fields
        ValidationHelper::required($input, ['email', 'name', 'password']);

        // Validate email format
        $email = ValidationHelper::email($input['email']);
        $name = ValidationHelper::sanitize($input['name']);
        $password = $input['password']; // AuthService handles validation

        try {
            $result = $this->authService->register($email, $name, $password);

            ResponseHelper::created($result, 'User registered successfully');
        } catch (\Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            ResponseHelper::error('Registration failed', 500);
        }
    }

    /**
     * Refresh access token
     */
    public function refresh() {
        $input = ValidationHelper::getJsonInput();

        // Validate required fields
        ValidationHelper::required($input, ['refresh_token']);

        try {
            $result = $this->authService->refreshToken($input['refresh_token']);

            ResponseHelper::success($result, 'Token refreshed successfully');
        } catch (\Exception $e) {
            error_log("Token refresh error: " . $e->getMessage());
            ResponseHelper::error('Token refresh failed', 500);
        }
    }

    /**
     * User logout
     */
    public function logout() {
        $input = ValidationHelper::getJsonInput();
        $refreshToken = $input['refresh_token'] ?? null;

        try {
            $result = $this->authService->logout($refreshToken);

            ResponseHelper::success($result, 'Logout successful');
        } catch (\Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            ResponseHelper::error('Logout failed', 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAll() {
        // Get user from current token
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error('No access token provided', 401);
        }

        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) {
            ResponseHelper::error('Invalid access token', 401);
        }

        $userId = $payload['sub'];

        try {
            $result = $this->authService->logoutAll($userId);

            ResponseHelper::success($result, 'Logged out from all devices');
        } catch (\Exception $e) {
            error_log("Logout all error: " . $e->getMessage());
            ResponseHelper::error('Logout from all devices failed', 500);
        }
    }

    /**
     * Get current user profile
     */
    public function profile() {
        // Get user from current token
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error('No access token provided', 401);
        }

        $user = $this->authService->validateAccessToken($token);

        ResponseHelper::success($user, 'Profile retrieved successfully');
    }

    /**
     * Update user profile
     */
    public function updateProfile() {
        // Get user from current token
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error('No access token provided', 401);
        }

        $user = $this->authService->validateAccessToken($token);
        $input = ValidationHelper::getJsonInput();

        try {
            $result = $this->authService->updateProfile($user['id'], $input);

            ResponseHelper::success($result, 'Profile updated successfully');
        } catch (\Exception $e) {
            error_log("Profile update error: " . $e->getMessage());
            ResponseHelper::error('Profile update failed', 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword() {
        // Get user from current token
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error('No access token provided', 401);
        }

        $user = $this->authService->validateAccessToken($token);
        $input = ValidationHelper::getJsonInput();

        ValidationHelper::required($input, ['current_password', 'new_password']);

        try {
            $result = $this->authService->changePassword(
                $user['id'],
                $input['current_password'],
                $input['new_password']
            );

            ResponseHelper::success($result, 'Password changed successfully');
        } catch (\Exception $e) {
            error_log("Password change error: " . $e->getMessage());
            ResponseHelper::error('Password change failed', 500);
        }
    }
}