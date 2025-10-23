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
     * User login dengan enhanced validation
     */
    public function login() {
        $input = ValidationHelper::getJsonInput();

        // Validate required fields
        ValidationHelper::required($input, ['email', 'password']);

        // Enhanced validation
        $email = ValidationHelper::email($input['email']);
        $password = ValidationHelper::password($input['password']);

        try {
            $result = $this->authService->login($email, $password);
            ResponseHelper::success($result, 'Login berhasil');
        } catch (\Exception $e) {
            error_log("Login error: " . $e->getMessage());
            ResponseHelper::error('Login gagal', 401);
        }
    }

    /**
     * User registration dengan enhanced validation
     */
    public function register() {
        $input = ValidationHelper::getJsonInput();

        // Validate required fields
        ValidationHelper::required($input, ['email', 'name', 'password']);

        // Enhanced validation
        $email = ValidationHelper::email($input['email']);
        $name = ValidationHelper::name($input['name'], 100);
        $password = ValidationHelper::password($input['password']);

        try {
            $result = $this->authService->register($email, $name, $password);
            ResponseHelper::created($result, 'User registered successfully');
        } catch (\Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            ResponseHelper::error('Registrasi gagal', 400);
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

        // Add password confirmation validation if provided
        if (isset($input['confirm_password'])) {
            if ($input['new_password'] !== $input['confirm_password']) {
                ResponseHelper::error('New password and confirmation do not match', 400);
            }
        }

        try {
            $result = $this->authService->changePassword(
                $user['id'],
                $input['current_password'],
                $input['new_password']
            );

            // Password change successful - include info about re-authentication
            ResponseHelper::success($result, $result['message'] ?? 'Password changed successfully');
        } catch (\Exception $e) {
            error_log("Password change error: " . $e->getMessage());
            ResponseHelper::error('Password change failed', 500);
        }
    }

    /**
     * Forgot password - send reset link
     */
    public function forgotPassword() {
        $input = ValidationHelper::getJsonInput();

        ValidationHelper::required($input, ['email']);

        // Validate email format
        $email = ValidationHelper::email($input['email']);

        try {
            $result = $this->authService->forgotPassword($email);
            ResponseHelper::success($result, 'Password reset instructions sent to email');
        } catch (\Exception $e) {
            error_log("Forgot password error: " . $e->getMessage());
            ResponseHelper::error('Failed to process password reset request', 500);
        }
    }

    /**
     * Reset password - validate token and set new password
     */
    public function resetPassword() {
        $input = ValidationHelper::getJsonInput();

        ValidationHelper::required($input, ['token', 'email', 'new_password']);

        // Validate email format
        $email = ValidationHelper::email($input['email']);
        $token = $input['token'];
        $newPassword = $input['new_password'];

        // Add password confirmation validation if provided
        if (isset($input['confirm_password'])) {
            if ($newPassword !== $input['confirm_password']) {
                ResponseHelper::error('New password and confirmation do not match', 400);
            }
        }

        try {
            $result = $this->authService->resetPassword($token, $email, $newPassword);
            ResponseHelper::success($result, 'Password reset successfully');
        } catch (\Exception $e) {
            error_log("Reset password error: " . $e->getMessage());
            ResponseHelper::error('Password reset failed', 500);
        }
    }
}