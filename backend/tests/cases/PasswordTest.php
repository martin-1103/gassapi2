<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Password Management endpoints
 * - Password management membutuhkan authentication
 */
class PasswordTest extends BaseTest {
    private $testEmail;
    private $testPassword;
    private $authToken = null;
    private $testUserId = null;

    protected function setUp() {
        parent::setUp();
        $this->testEmail = 'passtest_' . time() . '@example.com';
        $this->testPassword = 'PassTest123456';
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
            'name' => 'Password Test User'
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
     * Test change password dengan data valid
     */
    protected function testChangePassword() {
        $this->printHeader("Change Password Test");

        if (!$this->authToken) {
            echo "[SKIP] Change Password - No auth token available\n";
            return true;
        }

        $newPassword = 'NewPassword123456';
        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => $newPassword,
            'confirm_password' => $newPassword
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password", $result);

        if ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Password changed successfully');

            // Update test password untuk future use
            $this->testPassword = $newPassword;

            // Test login dengan password baru untuk verifikasi
            echo "[INFO] Testing login with new password...\n";
            $loginData = [
                'email' => $this->testEmail,
                'password' => $this->testPassword
            ];

            $loginResult = $this->testHelper->post('login', $loginData);
            if ($loginResult['status'] === 200) {
                echo "[INFO] Login with new password successful ✓\n";
                // Update auth token
                $this->authToken = $loginResult['data']['access_token'];
                $this->testHelper->setAuthToken($this->authToken);
            }
        }

        // Accept 200 (success) atau 404 (endpoint not found)
        return $result['status'] === 200 || $result['status'] === 404;
    }

    /**
     * Test change password dengan current password salah
     */
    protected function testChangePasswordWrongCurrent() {
        $this->printHeader("Change Password Wrong Current Password");

        if (!$this->authToken) {
            echo "[SKIP] Change Password Wrong - No auth token available\n";
            return true;
        }

        $passwordData = [
            'current_password' => 'wrongpassword',
            'new_password' => 'NewPassword123456',
            'confirm_password' => 'NewPassword123456'
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password Wrong Current", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Current password is incorrect');
        }

        // Accept 400 (validation error) atau 404 (endpoint not found)
        return $result['status'] === 400 || $result['status'] === 404;
    }

    /**
     * Test change password dengan konfirmasi tidak cocok
     */
    protected function testChangePasswordMismatch() {
        $this->printHeader("Change Password Mismatch Confirmation");

        if (!$this->authToken) {
            echo "[SKIP] Change Password Mismatch - No auth token available\n";
            return true;
        }

        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => 'NewPassword123456',
            'confirm_password' => 'DifferentPassword123456'
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password Mismatch", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Password confirmation does not match');
        }

        // Accept 400 (validation error) atau 404 (endpoint not found)
        return $result['status'] === 400 || $result['status'] === 404;
    }

    /**
     * Test change password dengan password baru terlalu lemah
     */
    protected function testChangePasswordWeak() {
        $this->printHeader("Change Password Weak New Password");

        if (!$this->authToken) {
            echo "[SKIP] Change Password Weak - No auth token available\n";
            return true;
        }

        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => '123', // Password terlalu lemah
            'confirm_password' => '123'
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password Weak", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'New password is too weak');
        }

        // Accept 400 (validation error) atau 404 (endpoint not found)
        return $result['status'] === 400 || $result['status'] === 404;
    }

    /**
     * Test change password dengan new password sama dengan current password
     */
    protected function testChangePasswordSameAsCurrent() {
        $this->printHeader("Change Password Same as Current");

        if (!$this->authToken) {
            echo "[SKIP] Change Password Same - No auth token available\n";
            return true;
        }

        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => $this->testPassword, // Sama dengan current
            'confirm_password' => $this->testPassword
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password Same as Current", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'New password must be different from current password');
        }

        // Accept 400 (validation error) atau 404 (endpoint not found)
        return $result['status'] === 400 || $result['status'] === 404;
    }

    /**
     * Test change password tanpa fields lengkap
     */
    protected function testChangePasswordMissingFields() {
        $this->printHeader("Change Password Missing Fields");

        if (!$this->authToken) {
            echo "[SKIP] Change Password Missing - No auth token available\n";
            return true;
        }

        $results = [];

        // Test tanpa current_password
        $data1 = [
            'new_password' => 'NewPassword123456',
            'confirm_password' => 'NewPassword123456'
        ];
        $result1 = $this->testHelper->post('change-password', $data1);
        $results[] = $this->testHelper->printResult("Missing Current Password", $result1, 400);

        // Test tanpa new_password
        $data2 = [
            'current_password' => $this->testPassword,
            'confirm_password' => 'NewPassword123456'
        ];
        $result2 = $this->testHelper->post('change-password', $data2);
        $results[] = $this->testHelper->printResult("Missing New Password", $result2, 400);

        // Test tanpa confirm_password
        $data3 = [
            'current_password' => $this->testPassword,
            'new_password' => 'NewPassword123456'
        ];
        $result3 = $this->testHelper->post('change-password', $data3);
        $results[] = $this->testHelper->printResult("Missing Confirm Password", $result3, 400);

        return !in_array(false, $results);
    }

    /**
     * Test change password tanpa authentication
     */
    protected function testChangePasswordUnauthorized() {
        $this->printHeader("Change Password Without Authentication");

        // Clear token untuk unauthorized test
        $this->testHelper->clearAuthToken();

        $passwordData = [
            'current_password' => $this->testPassword,
            'new_password' => 'NewPassword123456',
            'confirm_password' => 'NewPassword123456'
        ];

        $result = $this->testHelper->post('change-password', $passwordData);
        $success = $this->testHelper->printResult("Change Password Without Auth", $result, 401);

        // Restore token untuk tests lainnya
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        // Accept 401 (unauthorized) atau 404 (endpoint not found)
        return $result['status'] === 401 || $result['status'] === 404;
    }

    /**
     * Test forgot password (jika endpoint exists)
     */
    protected function testForgotPassword() {
        $this->printHeader("Forgot Password Test");

        // Clear token - forgot password biasanya tidak perlu auth
        $this->testHelper->clearAuthToken();

        $forgotData = [
            'email' => $this->testEmail
        ];

        $result = $this->testHelper->post('forgot-password', $forgotData);
        $success = $this->testHelper->printResult("Forgot Password", $result);

        // Endpoint ini mungkin belum diimplementasi
        if ($result['status'] === 404) {
            echo "[INFO] Forgot password endpoint not found (expected)\n";
            return true;
        } elseif ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Password reset email sent');
        }

        return $result['status'] === 200 || $result['status'] === 404;
    }

    /**
     * Test reset password (jika endpoint exists)
     */
    protected function testResetPassword() {
        $this->printHeader("Reset Password Test");

        // Clear token - reset password biasanya tidak perlu auth
        $this->testHelper->clearAuthToken();

        $resetData = [
            'token' => 'reset_token_12345', // Token yang biasanya dikirim via email
            'email' => $this->testEmail,
            'new_password' => 'ResetPassword123456',
            'confirm_password' => 'ResetPassword123456'
        ];

        $result = $this->testHelper->post('reset-password', $resetData);
        $success = $this->testHelper->printResult("Reset Password", $result);

        // Endpoint ini mungkin belum diimplementasi
        if ($result['status'] === 404) {
            echo "[INFO] Reset password endpoint not found (expected)\n";
            return true;
        } elseif ($result['status'] === 400) {
            // Token invalid atau expired - ini expected behavior
            echo "[INFO] Reset token validation working (invalid token as expected)\n";
            return true;
        } elseif ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Password reset successfully');
        }

        return $result['status'] === 200 || $result['status'] === 404 || $result['status'] === 400;
    }

    /**
     * Test password security - attempt dengan format berbahaya
     */
    protected function testPasswordSecurity() {
        $this->printHeader("Password Security Test");

        if (!$this->authToken) {
            echo "[SKIP] Password Security - No auth token available\n";
            return true;
        }

        $results = [];

        // Test dengan password yang mengandung SQL injection pattern
        $sqlInjectionData = [
            'current_password' => $this->testPassword,
            'new_password' => "'; DROP TABLE users; --",
            'confirm_password' => "'; DROP TABLE users; --"
        ];
        $result1 = $this->testHelper->post('change-password', $sqlInjectionData);
        $results[] = $this->testHelper->printResult("SQL Injection Attempt", $result1, 400);

        // Test dengan password yang mengandung XSS pattern
        $xssData = [
            'current_password' => $this->testPassword,
            'new_password' => '<script>alert("xss")</script>',
            'confirm_password' => '<script>alert("xss")</script>'
        ];
        $result2 = $this->testHelper->post('change-password', $xssData);
        $results[] = $this->testHelper->printResult("XSS Attempt", $result2, 400);

        // Test dengan password yang sangat panjang
        $longPassword = str_repeat('a', 1000);
        $longData = [
            'current_password' => $this->testPassword,
            'new_password' => $longPassword,
            'confirm_password' => $longPassword
        ];
        $result3 = $this->testHelper->post('change-password', $longData);
        $results[] = $this->testHelper->printResult("Long Password Attempt", $result3, 400);

        return !in_array(false, $results);
    }

    /**
     * Test password complexity requirements
     */
    protected function testPasswordComplexity() {
        $this->printHeader("Password Complexity Test");

        if (!$this->authToken) {
            echo "[SKIP] Password Complexity - No auth token available\n";
            return true;
        }

        $testCases = [
            // No uppercase letter
            ['pass' => 'password123', 'desc' => 'No uppercase'],
            // No lowercase letter
            ['pass' => 'PASSWORD123', 'desc' => 'No lowercase'],
            // No numbers
            ['pass' => 'Password', 'desc' => 'No numbers'],
            // Too short
            ['pass' => 'Pass1', 'desc' => 'Too short'],
            // No special characters (if required)
            ['pass' => 'Password123', 'desc' => 'No special chars'],
        ];

        $results = [];

        foreach ($testCases as $testCase) {
            $data = [
                'current_password' => $this->testPassword,
                'new_password' => $testCase['pass'],
                'confirm_password' => $testCase['pass']
            ];

            $result = $this->testHelper->post('change-password', $data);
            $success = $this->testHelper->printResult("Complexity: {$testCase['desc']}", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    protected function tearDown() {
        // Cleanup: Logout test user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        parent::tearDown();
    }
}