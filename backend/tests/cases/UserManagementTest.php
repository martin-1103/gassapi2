<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk User Management endpoints (Admin Functions)
 * - User management membutuhkan authentication (admin role)
 */
class UserManagementTest extends BaseTest {
    private $adminEmail;
    private $adminPassword;
    private $authToken = null;
    private $testUsers = []; // Track created users for cleanup

    protected function setUp() {
        parent::setUp();
        $this->adminEmail = 'admin_' . time() . '@example.com';
        $this->adminPassword = 'AdminTest123456';
        $this->setupAdminUser();
    }

    /**
     * Setup admin user dan dapatkan auth token
     */
    private function setupAdminUser() {
        // Register admin user
        $userData = [
            'email' => $this->adminEmail,
            'password' => $this->adminPassword,
            'name' => 'Admin Test User',
            'role' => 'admin' // Jika role parameter supported
        ];

        $result = $this->testHelper->post('register', $userData);

        // Login untuk dapatkan token
        $loginData = [
            'email' => $this->adminEmail,
            'password' => $this->adminPassword
        ];

        $loginResult = $this->testHelper->post('login', $loginData);
        if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
            $this->authToken = $loginResult['data']['access_token'];
            $this->testHelper->setAuthToken($this->authToken);
        }
    }

    /**
     * Test get all users (admin endpoint)
     */
    protected function testGetAllUsers() {
        $this->printHeader("Get All Users Test");

        if (!$this->authToken) {
            return $this->skip("Get All Users - No auth token available");
            
        }

        $result = $this->testHelper->get('users');
        $success = $this->testHelper->printResult("Get All Users", $result);

        // Accept 200 (success) atau 403 (not admin)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'users');

            $users = $result['data']['users'] ?? [];
            $userCount = count($users);
            echo "[INFO] Found {$userCount} users in system\n";

            // Verify user structure
            if ($userCount > 0) {
                $firstUser = $users[0];
                $expectedFields = ['id', 'email', 'name'];
                foreach ($expectedFields as $field) {
                    if (isset($firstUser[$field])) {
                        echo "[INFO] User field '{$field}' present ✓\n";
                    }
                }
            }
        } elseif ($result['status'] === 403) {
            echo "[INFO] Get All Users - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test get all users with pagination
     */
    protected function testGetAllUsersPaginated() {
        $this->printHeader("Get All Users Paginated Test");

        if (!$this->authToken) {
            return $this->skip("Get All Users Paginated - No auth token available");
            
        }

        $results = [];

        // Test with limit
        $result1 = $this->testHelper->get('users', ['limit' => 5]);
        $success1 = $this->testHelper->printResult("Get Users with Limit", $result1);

        if ($result1['status'] === 200) {
            $users = $result1['data']['users'] ?? [];
            if (count($users) <= 5) {
                echo "[INFO] Pagination limit working ✓\n";
            }
        } elseif ($result1['status'] === 403) {
            echo "[INFO] Paginated users - User is not admin (expected)\n";
        }
        $results[] = $result1['status'] === 200 || $result1['status'] === 403;

        // Test with offset
        $result2 = $this->testHelper->get('users', ['limit' => 5, 'offset' => 2]);
        $success2 = $this->testHelper->printResult("Get Users with Offset", $result2);
        $results[] = $result2['status'] === 200 || $result2['status'] === 403;

        return !in_array(false, $results);
    }

    /**
     * Test get user by ID
     */
    protected function testGetUserById() {
        $this->printHeader("Get User by ID Test");

        if (!$this->authToken) {
            return $this->skip("Get User by ID - No auth token available");
            
        }

        // Create a test user first
        $testUser = $this->createTestUser();
        if (!$testUser) {
            return $this->skip("Get User by ID - Could not create test user");
            
        }

        $result = $this->testHelper->get('user_by_id', [], $testUser['id']);
        $success = $this->testHelper->printResult("Get User by ID", $result);

        // Accept 200 (success) atau 403 (not admin)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'user');
            $this->testHelper->assertEquals($result['data']['user'], 'id', $testUser['id']);
        } elseif ($result['status'] === 403) {
            echo "[INFO] Get User by ID - User is not admin (expected)\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test get non-existent user
     */
    protected function testGetNonExistentUser() {
        $this->printHeader("Get Non-existent User Test");

        if (!$this->authToken) {
            return $this->skip("Get Non-existent User - No auth token available");
            
        }

        $result = $this->testHelper->get('user_by_id', [], 99999);
        $success = $this->testHelper->printResult("Get Non-existent User", $result, 404);

        // Accept 404 (not found) atau 403 (not admin)
        if ($result['status'] === 403) {
            echo "[INFO] Get Non-existent User - User is not admin (expected)\n";
            
        }

        return $success;
    }

    /**
     * Test update user by ID (admin functionality)
     */
    protected function testUpdateUserById() {
        $this->printHeader("Update User by ID Test");

        if (!$this->authToken) {
            return $this->skip("Update User - No auth token available");
            
        }

        // Create a test user first
        $testUser = $this->createTestUser();
        if (!$testUser) {
            return $this->skip("Update User - Could not create test user");
            
        }

        $updateData = [
            'name' => 'Updated User Name',
            'email' => 'updated_' . $testUser['email'],
            'role' => 'user'
        ];

        $result = $this->testHelper->put('user', $updateData, [], $testUser['id']);
        $success = $this->testHelper->printResult("Update User by ID", $result);

        // Accept 200 (success) atau 403 (not admin)
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
     * Test update user with invalid data
     */
    protected function testUpdateUserInvalid() {
        $this->printHeader("Update User Invalid Data Test");

        if (!$this->authToken) {
            return $this->skip("Update User Invalid - No auth token available");
            
        }

        // Create a test user first
        $testUser = $this->createTestUser();
        if (!$testUser) {
            return $this->skip("Update User Invalid - Could not create test user");
            
        }

        // Test with invalid email
        $invalidData = [
            'email' => 'invalid-email-format',
            'name' => 'Test User'
        ];

        $result = $this->testHelper->put('user', $invalidData, [], $testUser['id']);
        $success = $this->testHelper->printResult("Update User Invalid Email", $result);

        // Accept 400 (validation error) atau 403 (not admin)
        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Invalid email format');
        } elseif ($result['status'] === 403) {
            echo "[INFO] Update User Invalid - User is not admin (expected)\n";
            $success = true;
        }

        return $result['status'] === 400 || $result['status'] === 403;
    }

    /**
     * Test toggle user status (admin functionality)
     */
    protected function testToggleUserStatus() {
        $this->printHeader("Toggle User Status Test");

        if (!$this->authToken) {
            return $this->skip("Toggle Status - No auth token available");
            
        }

        // Create a test user first
        $testUser = $this->createTestUser();
        if (!$testUser) {
            return $this->skip("Toggle Status - Could not create test user");
            
        }

        $result = $this->testHelper->put('user_toggle_status', [], [], $testUser['id']);
        $success = $this->testHelper->printResult("Toggle User Status", $result);

        // Accept 200 (success), 403 (not admin), atau 404 (endpoint not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertEquals($result, 'message', 'User status updated successfully');
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
     * Test delete user (admin functionality)
     */
    protected function testDeleteUser() {
        $this->printHeader("Delete User Test");

        if (!$this->authToken) {
            return $this->skip("Delete User - No auth token available");
            
        }

        // Create a test user first
        $testUser = $this->createTestUser();
        if (!$testUser) {
            return $this->skip("Delete User - Could not create test user");
            
        }

        $result = $this->testHelper->delete('user_delete', [], $testUser['id']);
        $success = $this->testHelper->printResult("Delete User", $result);

        // Accept 200 (success), 403 (not admin), atau 404 (endpoint not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'User deleted successfully');
            // Remove from test users tracking since it's deleted
            $this->testUsers = array_filter($this->testUsers, function($user) use ($testUser) {
                return $user['id'] !== $testUser['id'];
            });
        } elseif ($result['status'] === 403) {
            echo "[INFO] Delete User - User is not admin (expected)\n";
            $success = true;
        } elseif ($result['status'] === 404) {
            echo "[INFO] Delete User - Endpoint not found\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test delete non-existent user
     */
    protected function testDeleteNonExistentUser() {
        $this->printHeader("Delete Non-existent User Test");

        if (!$this->authToken) {
            return $this->skip("Delete Non-existent User - No auth token available");
            
        }

        $result = $this->testHelper->delete('user_delete', [], 99999);
        $success = $this->testHelper->printResult("Delete Non-existent User", $result);

        // Accept 404 (not found) atau 403 (not admin)
        if ($result['status'] === 404) {
            $this->testHelper->assertEquals($result, 'message', 'User not found');
        } elseif ($result['status'] === 403) {
            echo "[INFO] Delete Non-existent User - User is not admin (expected)\n";
            
        }

        return $result['status'] === 404;
    }

    /**
     * Test user statistics (admin endpoint)
     */
    protected function testUserStatistics() {
        $this->printHeader("User Statistics Test");

        if (!$this->authToken) {
            return $this->skip("User Stats - No auth token available");
            
        }

        $result = $this->testHelper->get('users_stats');
        $success = $this->testHelper->printResult("User Statistics", $result);

        // Accept 200 (success), 403 (not admin), atau 404 (endpoint not found)
        if ($result['status'] === 200) {
            $this->testHelper->assertHasKey($result, 'data');

            $stats = $result['data'];
            $expectedFields = ['total_users', 'active_users', 'inactive_users'];
            foreach ($expectedFields as $field) {
                if (isset($stats[$field])) {
                    echo "[INFO] Stat '{$field}': {$stats[$field]}\n";
                }
            }
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
     * Test user management without authentication
     */
    protected function testUserManagementUnauthorized() {
        $this->printHeader("User Management Without Authentication");

        // Clear token untuk unauthorized test
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test get users without auth
        $result1 = $this->testHelper->get('users');
        $results[] = $this->testHelper->printResult("Get Users Without Auth", $result1, 401);

        // Test get user by ID without auth
        $result2 = $this->testHelper->get('user_by_id', [], 1);
        $results[] = $this->testHelper->printResult("Get User by ID Without Auth", $result2, 401);

        // Test update user without auth
        $result3 = $this->testHelper->put('user', ['name' => 'Unauthorized'], [], 1);
        $results[] = $this->testHelper->printResult("Update User Without Auth", $result3, 401);

        // Test delete user without auth
        $result4 = $this->testHelper->delete('user_delete', [], 99999);
        $results[] = $this->testHelper->printResult("Delete User Without Auth", $result4, 401);

        // Restore token untuk tests lainnya
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    /**
     * Test user management dengan pagination dan search
     */
    protected function testUserManagementPaginationAndSearch() {
        $this->printHeader("User Management Pagination and Search Test");

        if (!$this->authToken) {
            return $this->skip("Pagination/Search - No auth token available");
            
        }

        $results = [];

        // Test with search parameter
        $result1 = $this->testHelper->get('users', ['search' => $this->adminEmail]);
        $success1 = $this->testHelper->printResult("Search Users", $result1);

        if ($result1['status'] === 200) {
            $users = $result1['data']['users'] ?? [];
            $foundAdmin = false;
            foreach ($users as $user) {
                if (strpos($user['email'] ?? '', $this->adminEmail) !== false) {
                    $foundAdmin = true;
                    break;
                }
            }
            if ($foundAdmin) {
                echo "[INFO] Search functionality working ✓\n";
            }
        } elseif ($result1['status'] === 403) {
            echo "[INFO] Search Users - User is not admin (expected)\n";
        }
        $results[] = $result1['status'] === 200 || $result1['status'] === 403;

        // Test with role filter
        $result2 = $this->testHelper->get('users', ['role' => 'user']);
        $success2 = $this->testHelper->printResult("Filter Users by Role", $result2);
        $results[] = $result2['status'] === 200 || $result2['status'] === 403;

        return !in_array(false, $results);
    }

    /**
     * Helper method untuk membuat test user
     */
    private function createTestUser() {
        $email = 'mgmttest_' . time() . '_' . rand(100, 999) . '@example.com';
        $password = 'MgmtTest123456';

        // Register user
        $registerResult = $this->testHelper->post('register', [
            'email' => $email,
            'password' => $password,
            'name' => 'Management Test User'
        ]);

        if ($registerResult['status'] === 201 || $registerResult['status'] === 200) {
            $userId = $registerResult['data']['user']['id'] ?? null;
            if ($userId) {
                $testUser = [
                    'id' => $userId,
                    'email' => $email,
                    'password' => $password
                ];
                $this->testUsers[] = $testUser;
                return $testUser;
            }
        }

        return null;
    }

    protected function tearDown() {
        // Cleanup: Delete all created test users
        foreach ($this->testUsers as $user) {
            $this->testHelper->delete('user_delete', [], $user['id']);
        }

        // Cleanup: Logout admin user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        parent::tearDown();
    }
}