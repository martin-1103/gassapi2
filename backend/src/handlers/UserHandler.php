<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Repositories\UserRepository;
use App\Services\AuthService;
use App\Helpers\JwtHelper;
use App\Middleware\CSRFMiddleware;

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
        // Check authentication via AuthService for consistency
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error('Authentication required', 401);
        }
        // Will throw response error if invalid/expired
        $this->authService->validateAccessToken($token);

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
                    'users' => $sanitizedUsers,
                    'total' => count($sanitizedUsers),
                    'search_query' => $search
                ]);
            } elseif ($activeOnly) {
                $users = $this->userRepository->findActiveUsers($limit);
                $sanitizedUsers = $this->userRepository->sanitizeMany($users);

                ResponseHelper::success([
                    'users' => $sanitizedUsers,
                    'total' => count($sanitizedUsers)
                ]);
            } else {
                $result = $this->userRepository->paginate($page, $limit, 'created_at DESC');
                $sanitizedUsers = $this->userRepository->sanitizeMany($result['data']);
                
                ResponseHelper::success([
                    'users' => $sanitizedUsers,
                    'pagination' => $result['pagination']
                ]);
            }
        } catch (\App\Repositories\RepositoryException $e) {
            error_log("Get users repository error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve users: ' . $e->getMessage(), 500);
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

            ResponseHelper::success(['user' => $user], 'User retrieved successfully');
        } catch (\Exception $e) {
            error_log("Get user error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve user', 500);
        }
    }

    /**
     * Update user (admin only) dengan enhanced validation
     */
    public function update($id) {
        if (empty($id)) {
            ResponseHelper::error('ID user wajib diisi', 400);
        }

        // Validate ID
        $userId = ValidationHelper::integer($id, 1);

        // CSRF validation for admin operations
        CSRFMiddleware::validateCSRF();

        $input = ValidationHelper::getJsonInput();

        try {
            // Check if user exists
            $existingUser = $this->userRepository->findById($userId);
            if (!$existingUser) {
                ResponseHelper::error('User tidak ditemukan', 404);
            }

            // Allowed fields for admin update
            $allowedFields = ['name', 'email', 'is_active', 'role'];
            $updateData = [];

            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    switch ($field) {
                        case 'name':
                            $updateData[$field] = ValidationHelper::name($input[$field], 100);
                            break;
                        case 'email':
                            $updateData[$field] = ValidationHelper::email($input[$field]);
                            break;
                        case 'is_active':
                            $updateData[$field] = ValidationHelper::boolean($input[$field]);
                            break;
                        case 'role':
                            $updateData[$field] = ValidationHelper::text($input[$field], 2, 50);
                            break;
                    }
                }
            }

            if (!empty($updateData)) {
                $this->userRepository->update($userId, $updateData);
            }

            // Return updated user
            $updatedUser = $this->userRepository->findByIdSanitized($userId);
            ResponseHelper::success($updatedUser, 'User berhasil diperbarui');
        } catch (\App\Repositories\RepositoryException $e) {
            error_log("Update user validation error: " . $e->getMessage());
            ResponseHelper::error($e->getMessage(), $e->getCode() ?: 400);
        } catch (\Exception $e) {
            error_log("Update user error: " . $e->getMessage());
            ResponseHelper::error('Gagal memperbarui user', 500);
        }
    }

    /**
     * Delete user (admin only) dengan CSRF validation
     */
    public function delete($id) {
        if (empty($id)) {
            ResponseHelper::error('ID user wajib diisi', 400);
        }

        // Validate ID
        $userId = ValidationHelper::integer($id, 1);

        // CSRF validation for admin operations
        CSRFMiddleware::validateCSRF();

        try {
            // Check if user exists
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                ResponseHelper::error('User tidak ditemukan', 404);
            }

            // Delete user
            $this->userRepository->delete($userId);
            ResponseHelper::success(null, 'User berhasil dihapus');
        } catch (\Exception $e) {
            error_log("Delete user error: " . $e->getMessage());
            ResponseHelper::error('Gagal menghapus user', 500);
        }
    }

    /**
     * Activate/Deactivate user (admin only)
     */
    public function toggleStatus($id) {
        if (empty($id)) {
            ResponseHelper::error('User ID is required', 400);
        }

        try {
            $user = $this->userRepository->findById($id);
            if (!$user) {
                ResponseHelper::error('User not found', 404);
            }

            $input = ValidationHelper::getJsonInput();
            
            // If is_active is provided, use it; otherwise toggle current status
            if (isset($input['is_active'])) {
                $isActive = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);
            } else {
                // Auto-toggle: flip the current status
                $isActive = !$user['is_active'];
            }
            
            $this->userRepository->setActive($id, $isActive);

            $status = $isActive ? 'activated' : 'deactivated';
            ResponseHelper::success([
                'id' => $id,
                'is_active' => $isActive
            ], "User $status successfully");
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
            ResponseHelper::success(['user' => $user], 'Profile retrieved successfully');
        } catch (\Exception $e) {
            error_log("Profile error: " . $e->getMessage());
            ResponseHelper::error('Failed to retrieve profile', 500);
        }
    }

    /**
     * Update current user profile dengan enhanced validation
     */
    public function updateProfile() {
        try {
            // Get user from JWT token
            $token = JwtHelper::getTokenFromRequest();
            if (!$token) {
                ResponseHelper::error('Token akses tidak ditemukan', 401);
            }

            $user = $this->authService->validateAccessToken($token);
            $input = ValidationHelper::getJsonInput();

            // Validasi field yang diizinkan untuk update profile
            if (empty($input)) {
                ResponseHelper::error('Tidak ada data yang akan diupdate', 400);
            }

            $result = $this->authService->updateProfile($user['id'], $input);
            ResponseHelper::success(['user' => $result], 'Profile berhasil diperbarui');
        } catch (\Exception $e) {
            error_log("Update profile error: " . $e->getMessage());
            ResponseHelper::error('Gagal memperbarui profile', 400);
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