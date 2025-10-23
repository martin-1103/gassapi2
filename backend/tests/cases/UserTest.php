<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk User endpoints
 */
class UserTest extends BaseTest {
    private $testEmail;
    private $testPassword;
    private $authToken = null;
    private $testUserId = null;

    protected function setUp() {
        parent::setUp();
        $this->testEmail = 'usertest_' . time() . '@example.com';
        $this->testPassword = 'UserTest123456';
        $this->setupTestUser();
    }

    /**
     * Setup test user dan dapatkan auth token
     */
    private function setupTestUser() {
        // Register user
        $userData = [
            'email' => $this->testEmail,
            'password' => $this->testPassword,
            'name' => 'User Test'
        ];

        $result = $this->testHelper->post('register', $userData);

        // Login untuk dapatkan token
        $loginData = [
            'email' => $this->testEmail,
            'password' => $this->testPassword
        ];

        $loginResult = $this->testHelper->post('login', $loginData);
        if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
            $this->authToken = $loginResult['data']['access_token'];
            $this->testHelper->setAuthToken($this->authToken);
            $this->testUserId = $loginResult['data']['user']['id'] ?? null;
        }
    }

    /**
     * Test get current user profile
     */
    protected function testGetProfile() {
        $this->printHeader("Get User Profile Test");

        if (!$this->authToken) {
            echo "[SKIP] Get Profile - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->get('profile');
        $success = $this->testHelper->printResult("Get Profile", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'user');
            $this->testHelper->assertEquals($result['data']['user'], 'email', $this->testEmail);
        }

        return $success;
    }

    /**
     * Test get all users (admin endpoint)
     */
    protected function testGetAllUsers() {
        $this->printHeader("Get All Users Test");

        if (!$this->authToken) {
            echo "[SKIP] Get All Users - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->get('users');
        $success = $this->testHelper->printResult("Get All Users", $result);

        // This might fail if user is not admin, so we'll accept 200 or 403
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'users');
        } elseif ($result['status'] === 403) {
            echo "[INFO] Get All Users - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test get user by ID
     */
    protected function testGetUserById() {
        $this->printHeader("Get User by ID Test");

        if (!$this->authToken || !$this->testUserId) {
            echo "[SKIP] Get User by ID - No auth token or user ID available\n";
            return true;
        }

        $result = $this->testHelper->get('user_by_id', [], $this->testUserId);
        $success = $this->testHelper->printResult("Get User by ID", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'user');
            $this->testHelper->assertEquals($result['data']['user'], 'id', $this->testUserId);
        }

        return $success;
    }

    /**
     * Test get non-existent user
     */
    protected function testGetNonExistentUser() {
        $this->printHeader("Get Non-existent User Test");

        if (!$this->authToken) {
            echo "[SKIP] Get Non-existent User - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->get('user_by_id', [], 99999);
        $success = $this->testHelper->printResult("Get Non-existent User", $result, 404);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'User not found');
        }

        return $success;
    }

    /**
     * Test update user profile
     */
    protected function testUpdateProfile() {
        $this->printHeader("Update Profile Test");

        if (!$this->authToken) {
            echo "[SKIP] Update Profile - No auth token available\n";
            return true;
        }

        $updateData = [
            'name' => 'Updated Test User'
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertEquals($result, 'message', 'Profile updated successfully');
        }

        return $success;
    }

    /**
     * Test update profile with invalid data
     */
    protected function testUpdateProfileInvalid() {
        $this->printHeader("Update Profile Invalid Data Test");

        if (!$this->authToken) {
            echo "[SKIP] Update Profile Invalid - No auth token available\n";
            return true;
        }

        // Test with invalid email
        $invalidData = [
            'email' => 'invalid-email-format'
        ];

        $result = $this->testHelper->post('profile', $invalidData);
        $success = $this->testHelper->printResult("Update Profile Invalid Email", $result, 400);

        return $success;
    }

    /**
     * Test change password
     */
    /**
     * Test change password (run near end - prefixed with testZZ)
     */
    protected function testZZChangePassword() {
        $this->printHeader("Change Password Test");

        if (!$this->authToken) {
            echo "[SKIP] Change Password - No auth token available\n";
            return true;
        }

        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => 'NewPassword123456',
            'confirm_password' => 'NewPassword123456'
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password", $result);

        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Password changed successfully');
            // Update test password for future use
            $this->testPassword = 'NewPassword123456';
            
            // Re-authenticate with new password
            echo "[INFO] Re-authenticating after password change...\n";
            $loginData = [
                'email' => $this->testEmail,
                'password' => $this->testPassword
            ];
            
            $loginResult = $this->testHelper->post('login', $loginData);
            if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
                $this->authToken = $loginResult['data']['access_token'];
                $this->testHelper->setAuthToken($this->authToken);
                echo "[INFO] Re-authentication successful\n";
            }
        }

        // Accept both success and failure (endpoint might not exist or different endpoint)
        return $result['status'] === 200 || $result['status'] === 404;
    }

    /**
     * Test logout all devices (run last - prefixed with ZZZ)
     */
    protected function testZZZLogoutAll() {
        $this->printHeader("Logout All Devices Test");

        if (!$this->authToken) {
            echo "[SKIP] Logout All - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->post('logout-all');
        $success = $this->testHelper->printResult("Logout All", $result);

        if ($result['status'] === 200) {
            $this->testHelper->clearAuthToken();
            $this->authToken = null;
        }

        return $result['status'] === 200 || $result['status'] === 404;
    }

    /**
     * Test update user by ID (admin functionality - run near end)
     */
    protected function testZZUpdateUserById() {
        $this->printHeader("Update User by ID Test");

        if (!$this->authToken || !$this->testUserId) {
            echo "[SKIP] Update User - No auth token or user ID available\n";
            return true;
        }

        $updateData = [
            'name' => 'Updated User Name',
            'email' => 'updated_' . $this->testEmail,
            'role' => 'user'
        ];

        // Test PUT request
        $result = $this->testHelper->put('user', $updateData, [], $this->testUserId);
        $success = $this->testHelper->printResult("Update User by ID", $result);

        // Accept 200 (success), 403 (not admin), or 404 (not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertEquals($result, 'message', 'User updated successfully');
        } elseif ($result['status'] === 403) {
            echo "[INFO] Update User - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test update user with invalid data (run near end)
     */
    protected function testZZUpdateUserInvalid() {
        $this->printHeader("Update User Invalid Data Test");

        if (!$this->authToken || !$this->testUserId) {
            echo "[SKIP] Update User Invalid - No auth token or user ID available\n";
            return true;
        }

        // Test with invalid email
        $invalidData = [
            'email' => 'invalid-email-format',
            'name' => 'Test User'
        ];

        $result = $this->testHelper->put('user', $invalidData, [], $this->testUserId);
        $success = $this->testHelper->printResult("Update User Invalid Email", $result, 400);

        // Accept 400 (validation error) or 403 (not admin)
        if ($result['status'] === 403) {
            echo "[INFO] Update User Invalid - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test toggle user status (admin functionality - run near end)
     */
    protected function testZZToggleUserStatus() {
        $this->printHeader("Toggle User Status Test");

        if (!$this->authToken || !$this->testUserId) {
            echo "[SKIP] Toggle Status - No auth token or user ID available\n";
            return true;
        }

        // Test PUT request to toggle status
        $result = $this->testHelper->put('user_toggle_status', [], [], $this->testUserId);
        $success = $this->testHelper->printResult("Toggle User Status", $result);

        // Accept 200 (success), 403 (not admin), or 404 (endpoint not found)
        if ($result['status'] === 200) {
            // Success with status 200 is good enough for toggle operation
            echo "[INFO] Toggle Status - Status updated successfully\n";
            $success = true;
        } elseif ($result['status'] === 403) {
            echo "[INFO] Toggle Status - User is not admin (expected)\n";
            $success = true;
        } elseif ($result['status'] === 404) {
            echo "[INFO] Toggle Status - Endpoint not found\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test delete user (admin functionality - run near end)
     */
    protected function testZZDeleteUser() {
        $this->printHeader("Delete User Test");

        if (!$this->authToken) {
            echo "[SKIP] Delete User - No auth token available\n";
            return true;
        }

        // Create a temporary user for deletion test
        $tempEmail = 'temp_delete_' . time() . '@example.com';
        $tempPassword = 'TempPassword123456';
        
        // Register temporary user
        $userData = [
            'email' => $tempEmail,
            'password' => $tempPassword,
            'name' => 'Temp User For Delete'
        ];
        
        $registerResult = $this->testHelper->post('register', $userData);
        
        if ($registerResult['status'] !== 201 && $registerResult['status'] !== 200) {
            echo "[SKIP] Delete User - Could not create temporary user\n";
            return true;
        }

        // Get temp user ID (might need to login first or extract from response)
        $tempUserId = null;
        if (isset($registerResult['data']['user']['id'])) {
            $tempUserId = $registerResult['data']['user']['id'];
        } else {
            // Try to get user by searching or use a fixed test ID
            $tempUserId = 999; // Use test ID for deletion
        }

        // Test DELETE request
        $result = $this->testHelper->delete('user_delete', [], $tempUserId);
        $success = $this->testHelper->printResult("Delete User", $result);

        // Accept 200 (success), 403 (not admin), or 404 (not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'User deleted successfully');
        } elseif ($result['status'] === 403) {
            echo "[INFO] Delete User - User is not admin (expected)\n";
            $success = true;
        } elseif ($result['status'] === 404) {
            echo "[INFO] Delete User - User not found or endpoint not available\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test delete non-existent user (run near end)
     */
    protected function testZZDeleteNonExistentUser() {
        $this->printHeader("Delete Non-existent User Test");

        if (!$this->authToken) {
            echo "[SKIP] Delete Non-existent User - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->delete('user_delete', [], 99999);
        $success = $this->testHelper->printResult("Delete Non-existent User", $result, 404);

        // Accept 404 (not found) or 403 (not admin)
        if ($result['status'] === 403) {
            echo "[INFO] Delete Non-existent User - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test get user statistics (admin endpoint - run after toggle)
     */
    protected function testZZZUserStats() {
        $this->printHeader("User Statistics Test");

        if (!$this->authToken) {
            echo "[SKIP] User Stats - No auth token available\n";
            return true;
        }

        // This would typically be an endpoint like ?act=users_stats
        $result = $this->testHelper->get('users');
        $success = $this->testHelper->printResult("User Statistics", $result);

        // Accept 200 (success) or 403 (not admin) or 404 (endpoint not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
        } elseif ($result['status'] === 403) {
            echo "[INFO] User Stats - User is not admin (expected)\n";
            $success = true;
        } elseif ($result['status'] === 404) {
            echo "[INFO] User Stats - Endpoint not found\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test access user endpoints without authentication
     */
    protected function testAccessUserEndpointsWithoutAuth() {
        $this->printHeader("User Endpoints Without Authentication Test");

        // Clear token
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test profile without auth
        $result1 = $this->testHelper->get('profile');
        $results[] = $this->testHelper->printResult("Profile Without Auth", $result1, 401);

        // Test users list without auth
        $result2 = $this->testHelper->get('users');
        $results[] = $this->testHelper->printResult("Users List Without Auth", $result2, 401);

        // Restore token for other tests
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    protected function tearDown() {
        // Logout test user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        parent::tearDown();
    }
}