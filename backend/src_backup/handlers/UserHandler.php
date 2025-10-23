<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Helpers\JwtHelper;

/**
 * User management handler dengan repository pattern
 */
class UserHandler {

    private $userRepository;
    private $authService;

    public function __construct() {
        $this->userRepository = new UserRepository();
        $this->authService = new AuthService();
    }

    /**
     * Get all users
     */
    public function getAll() {
        // Check authentication
        $token = JwtHelper::getTokenFromRequest();
        if (!$token || !JwtHelper::validateAccessToken($token)) {
            ResponseHelper::error('Authentication required', 401);
        }

        $input = $_GET; // GET parameters for filtering/pagination

        $page = (int)($input['page'] ?? 1);
        $limit = (int)($input['limit'] ?? 10);
        $search = $input['search'] ?? null;
        $activeOnly = ($input['active_only'] ?? 'false') === 'true';

        try {
            if ($search) {
                $users = $this->userRepository->search($search, $limit);
                $sanitizedUsers = $this->userRepository->sanitizeMany($users);

                ResponseHelper::success([
                    'data' => $sanitizedUsers,
                    'total' => count($sanitizedUsers),
                    'search_query' => $search
                ]);
            } elseif ($activeOnly) {
                $users = $this->userRepository->findActiveUsers($limit);
                $sanitizedUsers = $this->userRepository->sanitizeMany($users);

                ResponseHelper::success([
                    'data' => $sanitizedUsers,
                    'total' => count($sanitizedUsers)
                ]);
            } else {
                $result = $this->userRepository->paginate($page, $limit, 'created_at DESC');
                $result['data'] = $this->userRepository->sanitizeMany($result['data']);

                ResponseHelper::success($result);
            }
        } catch (\Exception $e) {
            error_log("Get users error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve users', 500);
        }
    }

    /**
     * Get user by ID
     */
    public function getById($id) {
        if (empty($id)) {
            ResponseHelper::error('User ID is required', 400);
        }

        try {
            $user = $this->userRepository->findByIdSanitized($id);

            if (!$user) {
                ResponseHelper::error('User not found', 404);
            }

            ResponseHelper::success($user);
        } catch (\Exception $e) {
            error_log("Get user error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve user', 500);
        }
    }

    /**
     * Update user (admin only)
     */
    public function update($id) {
        if (empty($id)) {
            ResponseHelper::error('User ID is required', 400);
        }

        $input = ValidationHelper::getJsonInput();

        try {
            // Check if user exists
            $existingUser = $this->userRepository->findById($id);
            if (!$existingUser) {
                ResponseHelper::error('User not found', 404);
            }

            // Validate update data
            if (!empty($input)) {
                $this->userRepository->update($id, $input);
            }

            // Return updated user
            $updatedUser = $this->userRepository->findByIdSanitized($id);
            ResponseHelper::success($updatedUser, 'User updated successfully');
        } catch (\Exception $e) {
            error_log("Update user error: " . $e->getMessage());
            ResponseHelper::error('Failed to update user', 500);
        }
    }

    /**
     * Delete user (admin only)
     */
    public function delete($id) {
        if (empty($id)) {
            ResponseHelper::error('User ID is required', 400);
        }

        try {
            // Check if user exists
            $user = $this->userRepository->findById($id);
            if (!$user) {
                ResponseHelper::error('User not found', 404);
            }

            // Delete user
            $this->userRepository->delete($id);
            ResponseHelper::success(null, 'User deleted successfully');
        } catch (\Exception $e) {
            error_log("Delete user error: " . $e->getMessage());
            ResponseHelper::error('Failed to delete user', 500);
        }
    }

    /**
     * Activate/Deactivate user (admin only)
     */
    public function toggleStatus($id) {
        if (empty($id)) {
            ResponseHelper::error('User ID is required', 400);
        }

        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['is_active']);

        try {
            $user = $this->userRepository->findById($id);
            if (!$user) {
                ResponseHelper::error('User not found', 404);
            }

            $isActive = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);
            $this->userRepository->setActive($id, $isActive);

            $status = $isActive ? 'activated' : 'deactivated';
            ResponseHelper::success(null, "User $status successfully");
        } catch (\Exception $e) {
            error_log("Toggle user status error: " . $e->getMessage());
            ResponseHelper::error('Failed to update user status', 500);
        }
    }

    
    /**
     * Get current user profile (authenticated user)
     */
    public function profile() {
        try {
            // Get user from JWT token
            $token = JwtHelper::getTokenFromRequest();
            if (!$token) {
                ResponseHelper::error('No access token provided', 401);
            }

            $user = $this->authService->validateAccessToken($token);
            ResponseHelper::success($user, 'Profile retrieved successfully');
        } catch (\Exception $e) {
            error_log("Profile error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve profile', 500);
        }
    }

    /**
     * Update current user profile (authenticated user)
     */
    public function updateProfile() {
        try {
            // Get user from JWT token
            $token = JwtHelper::getTokenFromRequest();
            if (!$token) {
                ResponseHelper::error('No access token provided', 401);
            }

            $user = $this->authService->validateAccessToken($token);
            $input = ValidationHelper::getJsonInput();

            $result = $this->authService->updateProfile($user['id'], $input);
            ResponseHelper::success($result, 'Profile updated successfully');
        } catch (\Exception $e) {
            error_log("Update profile error: " . $e->getMessage());
            ResponseHelper::error('Failed to update profile', 500);
        }
    }

    /**
     * Get user statistics (admin only)
     */
    public function getStats() {
        try {
            $totalUsers = $this->userRepository->count();
            $activeUsers = $this->userRepository->count(['is_active' => 1]);

            ResponseHelper::success([
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $totalUsers - $activeUsers
            ]);
        } catch (\Exception $e) {
            error_log("Get stats error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve statistics', 500);
        }
    }
}