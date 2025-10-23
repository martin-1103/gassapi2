<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\MessageHelper;
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
            ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401);
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
            ResponseHelper::error(MessageHelper::ERROR_USER_RETRIEVAL_FAILED . ': ' . $e->getMessage(), 500);
        } catch (\Exception $e) {
            error_log("Get users error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_USER_RETRIEVAL_FAILED, 500);
        }
    }

    /**
     * Get user by ID
     */
    public function getById($id) {
        // Validate ID (support string dan integer format)
        $userId = ValidationHelper::flexibleId($id, 1);

        // Check authentication first
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401);
        }
        $this->authService->validateAccessToken($token);

        try {
            $user = $this->userRepository->findByIdSanitized($userId);

            if (!$user) {
                ResponseHelper::error(MessageHelper::ERROR_USER_NOT_FOUND, 404);
            }

            ResponseHelper::success(['user' => $user], MessageHelper::SUCCESS_USER_RETRIEVED);
        } catch (\Exception $e) {
            error_log("Get user error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_USER_RETRIEVAL_FAILED, 500);
        }
    }

    /**
     * Update user (admin only) dengan enhanced validation
     */
    public function update($id) {
        if (empty($id)) {
            ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400);
        }

        // Check authentication first
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401);
        }
        $this->authService->validateAccessToken($token);

        // Validate ID (support string dan integer format)
        $userId = ValidationHelper::flexibleId($id, 1);

        // CSRF validation for admin operations
        CSRFMiddleware::validateCSRF();

        $input = ValidationHelper::getJsonInput();

        try {
            // Check if user exists
            $existingUser = $this->userRepository->findById($userId);
            if (!$existingUser) {
                ResponseHelper::error(MessageHelper::ERROR_USER_NOT_FOUND, 404);
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
            ResponseHelper::success($updatedUser, MessageHelper::SUCCESS_USER_UPDATED);
        } catch (\App\Repositories\RepositoryException $e) {
            error_log("Update user validation error: " . $e->getMessage());
            ResponseHelper::error($e->getMessage(), $e->getCode() ?: 400);
        } catch (\Exception $e) {
            error_log("Update user error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_USER_UPDATE_FAILED, 500);
        }
    }

    /**
     * Delete user (admin only) dengan CSRF validation
     */
    public function delete($id) {
        if (empty($id)) {
            ResponseHelper::error(MessageHelper::ERROR_ID_REQUIRED, 400);
        }

        // Check authentication first
        $token = JwtHelper::getTokenFromRequest();
        if (!$token) {
            ResponseHelper::error(MessageHelper::ERROR_AUTH_REQUIRED, 401);
        }
        $this->authService->validateAccessToken($token);

        // Validate ID (support string dan integer format)
        $userId = ValidationHelper::flexibleId($id, 1);

        // CSRF validation for admin operations
        CSRFMiddleware::validateCSRF();

        try {
            // Check if user exists
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                ResponseHelper::error(MessageHelper::ERROR_USER_NOT_FOUND, 404);
            }

            // Delete user
            $this->userRepository->delete($userId);
            ResponseHelper::success(null, MessageHelper::SUCCESS_USER_DELETED);
        } catch (\Exception $e) {
            error_log("Delete user error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_USER_DELETE_FAILED, 500);
        }
    }

    /**
     * Activate/Deactivate user (admin only)
     */
    public function toggleStatus($id) {
        // Validate ID (support string dan integer format)
        $userId = ValidationHelper::flexibleId($id, 1);

        try {
            $user = $this->userRepository->findById($userId);
            if (!$user) {
                ResponseHelper::error(MessageHelper::ERROR_USER_NOT_FOUND, 404);
            }

            $input = ValidationHelper::getJsonInput();

            // If is_active is provided, use it; otherwise toggle current status
            if (isset($input['is_active'])) {
                $isActive = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN);
            } else {
                // Auto-toggle: flip the current status
                $isActive = !$user['is_active'];
            }

            $this->userRepository->setActive($userId, $isActive);

            ResponseHelper::success([
                'id' => $userId,
                'is_active' => $isActive
            ], MessageHelper::userStatusMessage($isActive));
        } catch (\Exception $e) {
            error_log("Toggle user status error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_USER_STATUS_UPDATE_FAILED, 500);
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
                ResponseHelper::error(MessageHelper::ERROR_TOKEN_NOT_FOUND, 401);
            }

            $user = $this->authService->validateAccessToken($token);
            ResponseHelper::success(['user' => $user], MessageHelper::SUCCESS_PROFILE_RETRIEVED);
        } catch (\Exception $e) {
            error_log("Profile error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_PROFILE_RETRIEVAL_FAILED, 500);
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
                ResponseHelper::error(MessageHelper::ERROR_TOKEN_NOT_FOUND, 401);
            }

            $user = $this->authService->validateAccessToken($token);
            $input = ValidationHelper::getJsonInput();

            // Validasi field yang diizinkan untuk update profile
            if (empty($input)) {
                ResponseHelper::error(MessageHelper::ERROR_NO_DATA_TO_UPDATE, 400);
            }

            $result = $this->authService->updateProfile($user['id'], $input);
            ResponseHelper::success(['user' => $result], MessageHelper::SUCCESS_PROFILE_UPDATED);
        } catch (\Exception $e) {
            error_log("Update profile error: " . $e->getMessage());
            ResponseHelper::error(MessageHelper::ERROR_PROFILE_UPDATE_FAILED, 400);
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
            ResponseHelper::error(MessageHelper::ERROR_STATS_RETRIEVAL_FAILED, 500);
        }
    }
}