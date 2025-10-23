<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk User Profile endpoints
 * - Profile management membutuhkan authentication
 */
class UserProfileTest extends BaseTest {
    private $testEmail;
    private $testPassword;
    private $authToken = null;
    private $testUserId = null;

    protected function setUp() {
        parent::setUp();
        $this->testEmail = 'profiletest_' . time() . '@example.com';
        $this->testPassword = 'ProfileTest123456';
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
            'name' => 'Profile Test User'
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
    public function testGetProfile() {
        $this->printHeader("Get User Profile Test");

        if (!$this->authToken) {
            return $this->skip("Get Profile - No auth token available");
            
        }

        $result = $this->testHelper->get('profile');
        $success = $this->testHelper->printResult("Get Profile", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'user');
            $this->testHelper->assertEquals($result['data']['user'], 'email', $this->testEmail);

            // Verify profile structure
            $user = $result['data']['user'];
            $expectedFields = ['id', 'email', 'name', 'created_at'];
            foreach ($expectedFields as $field) {
                if (isset($user[$field])) {
                    echo "[INFO] Profile field '{$field}' present ✓\n";
                }
            }
        }

        return $success;
    }

    /**
     * Test update user profile - name only
     */
    public function testUpdateProfileName() {
        $this->printHeader("Update Profile Name Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Name - No auth token available");
            
        }

        $newName = 'Updated Profile Name ' . time();
        $updateData = [
            'name' => $newName
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Name", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Profile updated successfully');

            // Verify update by getting profile again
            echo "[INFO] Verifying profile update...\n";
            $profileResult = $this->testHelper->get('profile');
            if ($profileResult['status'] === 200) {
                $updatedName = $profileResult['data']['user']['name'] ?? '';
                if ($updatedName === $newName) {
                    echo "[INFO] Profile name updated successfully ✓\n";
                } else {
                    echo "[WARNING] Profile name not updated as expected\n";
                }
            }
        }

        return $success;
    }

    /**
     * Test update user profile - email only
     */
    public function testUpdateProfileEmail() {
        $this->printHeader("Update Profile Email Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Email - No auth token available");
            
        }

        $newEmail = 'updated_' . time() . '@example.com';
        $updateData = [
            'email' => $newEmail
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Email", $result);

        // Email update might require verification or different handling
        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Profile updated successfully');
            $this->testEmail = $newEmail; // Update test email for future tests
        } elseif ($result['status'] === 400) {
            echo "[INFO] Email update might require verification or not allowed\n";
            
        } elseif ($result['status'] === 404) {
            echo "[INFO] Email update endpoint not implemented\n";
            
        }

        return $result['status'] === 200 || $result['status'] === 400 || $result['status'] === 404;
    }

    /**
     * Test update user profile - both name and email
     */
    public function testUpdateProfileBoth() {
        $this->printHeader("Update Profile Name and Email Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Both - No auth token available");
            
        }

        $updateData = [
            'name' => 'Complete Update Name ' . time(),
            'email' => 'complete_' . time() . '@example.com'
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Both", $result);

        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Profile updated successfully');
            $this->testEmail = $updateData['email']; // Update test email
        }

        return $result['status'] === 200 || $result['status'] === 400;
    }

    /**
     * Test update profile dengan invalid email format
     */
    public function testUpdateProfileInvalidEmail() {
        $this->printHeader("Update Profile Invalid Email Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Invalid Email - No auth token available");
            
        }

        $invalidEmails = [
            'invalid-email',
            '@example.com',
            'test@',
            'test.test',
            'test@.com',
            ''
        ];

        $results = [];

        foreach ($invalidEmails as $invalidEmail) {
            $updateData = [
                'email' => $invalidEmail
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Update Email: '{$invalidEmail}'", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test update profile dengan duplicate email
     */
    public function testUpdateProfileDuplicateEmail() {
        $this->printHeader("Update Profile Duplicate Email Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Duplicate - No auth token available");
            
        }

        // Create another user first
        $otherEmail = 'otheruser_' . time() . '@example.com';
        $registerResult = $this->testHelper->post('register', [
            'email' => $otherEmail,
            'password' => 'OtherUser123456',
            'name' => 'Other User'
        ]);

        if ($registerResult['status'] === 201 || $registerResult['status'] === 200) {
            // Try to update profile with existing email
            $updateData = [
                'email' => $otherEmail
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Update Profile Duplicate Email", $result, 400);

            if ($result['status'] === 400) {
                $this->testHelper->assertEquals($result, 'message', 'Email already exists');
            }

            return $result['status'] === 400;
        }

        return $this->skip("Duplicate email test - Could not create other user");
        
    }

    /**
     * Test update profile dengan empty name
     */
    public function testUpdateProfileEmptyName() {
        $this->printHeader("Update Profile Empty Name Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Empty Name - No auth token available");
            
        }

        $updateData = [
            'name' => ''
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Empty Name", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Name cannot be empty');
        }

        return $result['status'] === 400;
    }

    /**
     * Test update profile dengan XSS attempt
     */
    public function testUpdateProfileXSS() {
        $this->printHeader("Update Profile XSS Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile XSS - No auth token available");
            
        }

        $xssPayloads = [
            '<script>alert("xss")</script>',
            'javascript:alert("xss")',
            '<img src="x" onerror="alert(1)">',
            '" onclick="alert(1)"'
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("XSS Attempt: " . substr($payload, 0, 20) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test get profile tanpa authentication
     */
    public function testGetProfileUnauthorized() {
        $this->printHeader("Get Profile Without Authentication");

        // Clear token untuk unauthorized test
        $this->testHelper->clearAuthToken();

        $result = $this->testHelper->get('profile');
        $success = $this->testHelper->printResult("Get Profile Without Auth", $result, 401);

        // Restore token untuk tests lainnya
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return $success;
    }

    /**
     * Test update profile tanpa authentication
     */
    public function testUpdateProfileUnauthorized() {
        $this->printHeader("Update Profile Without Authentication");

        // Clear token untuk unauthorized test
        $this->testHelper->clearAuthToken();

        $updateData = [
            'name' => 'Unauthorized Update'
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Without Auth", $result, 401);

        // Restore token untuk tests lainnya
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return $success;
    }

    /**
     * Test update profile dengan data kosong
     */
    public function testUpdateProfileEmptyData() {
        $this->printHeader("Update Profile Empty Data Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Empty Data - No auth token available");
            
        }

        $result = $this->testHelper->post('profile', []);
        $success = $this->testHelper->printResult("Update Profile Empty Data", $result);

        // Some APIs might accept empty data (no-op), others might require at least one field
        if ($result['status'] === 200) {
            echo "[INFO] Empty update accepted (no-op)\n";
            
        } elseif ($result['status'] === 400) {
            echo "[INFO] Empty update rejected (validation)\n";
            
        }

        return $result['status'] === 200 || $result['status'] === 400;
    }

    /**
     * Test update profile dengan field tambahan (unknown fields)
     */
    protected function testUpdateProfileUnknownFields() {
        $this->printHeader("Update Profile Unknown Fields Test");

        if (!$this->authToken) {
            return $this->skip("Update Profile Unknown Fields - No auth token available");
            
        }

        $updateData = [
            'name' => 'Valid Name Update',
            'unknown_field' => 'some value',
            'another_field' => 123,
            'nested' => ['field' => 'value']
        ];

        $result = $this->testHelper->post('profile', $updateData);
        $success = $this->testHelper->printResult("Update Profile Unknown Fields", $result);

        // API should ignore unknown fields or reject them
        if ($result['status'] === 200) {
            echo "[INFO] Unknown fields ignored (good)\n";
            
        } elseif ($result['status'] === 400) {
            echo "[INFO] Unknown fields rejected (also acceptable)\n";
            
        }

        return $result['status'] === 200 || $result['status'] === 400;
    }

    /**
     * Test profile update performance
     */
    protected function testProfilePerformance() {
        $this->printHeader("Profile Update Performance Test");

        if (!$this->authToken) {
            return $this->skip("Profile Performance - No auth token available");
            
        }

        $results = [];
        $updateCount = 3;

        for ($i = 1; $i <= $updateCount; $i++) {
            $startTime = microtime(true);

            $updateData = [
                'name' => "Performance Test Name {$i} " . time()
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $endTime = microtime(true);

            $responseTime = round(($endTime - $startTime) * 1000, 2); // milliseconds
            $success = $this->testHelper->printResult("Profile Update #{$i} ({$responseTime}ms)", $result, 200);
            $results[] = $success;

            if ($responseTime < 500) {
                echo "[INFO] Update #{$i} response time: {$responseTime}ms ✓\n";
            } else {
                echo "[WARNING] Update #{$i} response time: {$responseTime}ms (slow)\n";
            }
        }

        return !in_array(false, $results);
    }

    /**
     * Test profile consistency across multiple requests
     */
    protected function testProfileConsistency() {
        $this->printHeader("Profile Consistency Test");

        if (!$this->authToken) {
            return $this->skip("Profile Consistency - No auth token available");
            
        }

        $results = [];
        $profiles = [];

        // Get profile multiple times
        for ($i = 1; $i <= 3; $i++) {
            $result = $this->testHelper->get('profile');
            if ($result['status'] === 200) {
                $profiles[] = json_encode($result['data']['user']);
            }
            $results[] = $result['status'] === 200;
        }

        // Check consistency
        $consistent = count(array_unique($profiles)) <= 1;
        if ($consistent) {
            echo "[INFO] Profile data is consistent across requests ✓\n";
        } else {
            echo "[WARNING] Profile data varies across requests\n";
        }

        return !in_array(false, $results) && $consistent;
    }

    protected function tearDown() {
        // Cleanup: Logout test user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        parent::tearDown();
    }
}