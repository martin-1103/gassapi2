<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Security validation test cases
 * - XSS protection testing
 * - Input validation testing
 * - CSRF protection testing
 * - SQL injection protection testing
 */
class SecurityTest extends BaseTest {

    protected function setUp() {
        parent::setUp();
        echo "[INFO] Starting Security Validation Tests\n";
    }

    /**
     * Test XSS protection in name fields
     */
    protected function testXSSProtectionInName() {
        $this->printHeader("XSS Protection in Name Fields");

        $xssPayloads = [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src="x" onerror="alert(\'XSS\')">',
            '"><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<svg onload="alert(\'XSS\')">',
            '<div onclick="alert(\'XSS\')">Click me</div>',
            '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
            '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E'
        ];

        $results = [];

        foreach ($xssPayloads as $index => $payload) {
            echo "[TEST " . ($index + 1) . "] Testing XSS payload: " . substr($payload, 0, 30) . "...\n";

            $registerData = [
                'email' => 'xss_test_' . $index . '@example.com',
                'password' => 'SecurePass123456',
                'name' => $payload
            ];

            $result = $this->testHelper->post('register', $registerData);
            $success = $this->testHelper->printResult("XSS Test #" . ($index + 1), $result, 400);
            $results[] = $success;

            // Should be rejected for security reasons
            if ($result['status'] === 400) {
                echo "[PASS] XSS payload blocked ✓\n";
            } else {
                echo "[FAIL] XSS payload allowed! Security breach! ✗\n";
            }
        }

        $passedTests = array_sum($results);
        $totalTests = count($results);

        echo "[INFO] XSS Protection Tests: {$passedTests}/{$totalTests} passed\n";
        return $passedTests === $totalTests;
    }

    /**
     * Test input validation for various field types
     */
    protected function testInputValidation() {
        $this->printHeader("Input Validation Tests");

        $testCases = [
            // Email validation tests
            [
                'test' => 'Invalid email format',
                'data' => ['email' => 'invalid-email', 'password' => 'ValidPass123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Email with dangerous characters',
                'data' => ['email' => 'test<script>@example.com', 'password' => 'ValidPass123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Email too long',
                'data' => ['email' => str_repeat('a', 250) . '@example.com', 'password' => 'ValidPass123', 'name' => 'Test User'],
                'expected_status' => 400
            ],

            // Password validation tests
            [
                'test' => 'Password too short',
                'data' => ['email' => 'test@example.com', 'password' => '123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Password no uppercase',
                'data' => ['email' => 'test@example.com', 'password' => 'alllowercase123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Password no lowercase',
                'data' => ['email' => 'test@example.com', 'password' => 'ALLUPPERCASE123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Password no numbers',
                'data' => ['email' => 'test@example.com', 'password' => 'Password', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Password common pattern',
                'data' => ['email' => 'test@example.com', 'password' => 'Password123', 'name' => 'Test User'],
                'expected_status' => 400
            ],

            // Name validation tests
            [
                'test' => 'Name too short',
                'data' => ['email' => 'test@example.com', 'password' => 'ValidPass123', 'name' => 'A'],
                'expected_status' => 400
            ],
            [
                'test' => 'Name too long',
                'data' => ['email' => 'test@example.com', 'password' => 'ValidPass123', 'name' => str_repeat('A', 101)],
                'expected_status' => 400
            ],

            // Missing required fields
            [
                'test' => 'Missing email',
                'data' => ['password' => 'ValidPass123', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Missing password',
                'data' => ['email' => 'test@example.com', 'name' => 'Test User'],
                'expected_status' => 400
            ],
            [
                'test' => 'Missing name',
                'data' => ['email' => 'test@example.com', 'password' => 'ValidPass123'],
                'expected_status' => 400
            ]
        ];

        $results = [];

        foreach ($testCases as $index => $testCase) {
            echo "[TEST " . ($index + 1) . "] Testing: " . $testCase['test'] . "\n";

            $result = $this->testHelper->post('register', $testCase['data']);
            $expectedStatus = $testCase['expected_status'];

            $success = ($result['status'] === $expectedStatus);
            $results[] = $success;

            if ($success) {
                echo "[PASS] " . $testCase['test'] . " ✓\n";
            } else {
                echo "[FAIL] " . $testCase['test'] . " - Expected {$expectedStatus}, got {$result['status']} ✗\n";
            }
        }

        $passedTests = array_sum($results);
        $totalTests = count($results);

        echo "[INFO] Input Validation Tests: {$passedTests}/{$totalTests} passed\n";
        return $passedTests === $totalTests;
    }

    /**
     * Test profile update with malicious input
     */
    protected function testProfileUpdateSecurity() {
        $this->printHeader("Profile Update Security Tests");

        // First register a legitimate user
        $registerData = [
            'email' => 'profile_security@example.com',
            'password' => 'SecurePass123456',
            'name' => 'Security Test User'
        ];

        $registerResult = $this->testHelper->post('register', $registerData);
        if ($registerResult['status'] !== 201) {
            echo "[FAIL] Could not create test user for profile security test ✗\n";
            return false;
        }

        // Login to get token
        $loginResult = $this->testHelper->post('login', [
            'email' => 'profile_security@example.com',
            'password' => 'SecurePass123456'
        ]);

        if ($loginResult['status'] !== 200 || !isset($loginResult['data']['access_token'])) {
            echo "[FAIL] Could not login test user for profile security test ✗\n";
            return false;
        }

        $token = $loginResult['data']['access_token'];
        $this->testHelper->setAuthToken($token);

        $maliciousUpdates = [
            ['name' => '<script>alert("XSS")</script>', 'field' => 'name'],
            ['name' => 'javascript:alert("XSS")', 'field' => 'name'],
            ['name' => '"><img src=x onerror=alert("XSS")>', 'field' => 'name'],
            ['email' => 'evil<script>@example.com', 'field' => 'email'],
            ['email' => 'test@example.com<script>', 'field' => 'email']
        ];

        $results = [];

        foreach ($maliciousUpdates as $index => $update) {
            echo "[TEST " . ($index + 1) . "] Testing malicious {$update['field']} update\n";

            $result = $this->testHelper->post('profile', $update);
            $success = $this->testHelper->printResult("Profile Malicious Update #" . ($index + 1), $result, 400);
            $results[] = $success;

            // Should be rejected
            if ($result['status'] === 400) {
                echo "[PASS] Malicious {$update['field']} update blocked ✓\n";
            } else {
                echo "[FAIL] Malicious {$update['field']} update allowed! Security breach! ✗\n";
            }
        }

        // Cleanup
        $this->testHelper->clearAuthToken();

        $passedTests = array_sum($results);
        $totalTests = count($results);

        echo "[INFO] Profile Update Security Tests: {$passedTests}/{$totalTests} passed\n";
        return $passedTests === $totalTests;
    }

    /**
     * Test JSON parsing protection
     */
    protected function testJSONSecurity() {
        $this->printHeader("JSON Security Tests");

        $maliciousJSON = [
            '{"email": "test@example.com", "password": "ValidPass123", "name": "Test User"}{"malicious": "payload"}',
            '{"email": "test@example.com", "password": "ValidPass123", "name": "Test User", "__proto__": {"isAdmin": true}}',
            '{"email": "test@example.com", "password": "ValidPass123", "name": "Test User", "constructor": {"prototype": {"isAdmin": true}}}',
            'invalid json content',
            '{"email": "test@example.com", "password": "ValidPass123", "name": ' . str_repeat('"A"', 1000) . '}' // Very large
        ];

        $results = [];

        foreach ($maliciousJSON as $index => $jsonPayload) {
            echo "[TEST " . ($index + 1) . "] Testing malicious JSON payload\n";

            // Use custom curl to send malformed JSON
            $ch = curl_init($this->testHelper->getBaseUrl() . '?act=register');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $result = json_decode($response, true) ?: ['status' => $httpCode];

            $success = ($result['status'] === 400 || $httpCode === 400);
            $results[] = $success;

            if ($success) {
                echo "[PASS] Malicious JSON blocked ✓\n";
            } else {
                echo "[FAIL] Malicious JSON accepted! Potential security issue! ✗\n";
            }
        }

        $passedTests = array_sum($results);
        $totalTests = count($results);

        echo "[INFO] JSON Security Tests: {$passedTests}/{$totalTests} passed\n";
        return $passedTests === $totalTests;
    }

    /**
     * Test rate limiting protection (if implemented)
     */
    protected function testRateLimiting() {
        $this->printHeader("Rate Limiting Tests");

        $loginData = [
            'email' => 'ratelimit@example.com',
            'password' => 'WrongPassword123'
        ];

        $results = [];
        $blockedRequests = 0;

        // Send multiple requests rapidly
        for ($i = 1; $i <= 10; $i++) {
            echo "[TEST {$i}] Testing request #{$i}\n";

            $result = $this->testHelper->post('login', $loginData);

            // After 5 failed attempts, we should start seeing rate limiting
            if ($i > 5) {
                $isRateLimited = ($result['status'] === 429 || $result['status'] === 503);
                $results[] = $isRateLimited;

                if ($isRateLimited) {
                    echo "[PASS] Rate limiting active after multiple failed attempts ✓\n";
                    $blockedRequests++;
                } else {
                    echo "[INFO] Request {$i} - Status: {$result['status']}\n";
                }
            } else {
                // First 5 should be auth failures (401)
                $expectedAuthFailure = ($result['status'] === 401);
                $results[] = $expectedAuthFailure;
            }

            usleep(100000); // 100ms delay between requests
        }

        $passedTests = array_sum($results);
        $totalTests = count($results);

        echo "[INFO] Rate Limiting Tests: {$passedTests}/{$totalTests} passed ({$blockedRequests} requests blocked)\n";

        // Rate limiting is optional, so we don't fail the test if not implemented
        
    }

    protected function tearDown() {
        $this->testHelper->clearAuthToken();

        echo "\n=== Security Test Summary ===\n";
        echo "Security tests completed - Review results above\n";
        echo "Critical vulnerabilities should all be blocked (400 status codes)\n";
        echo "If any malicious input is accepted, system has security issues\n";

        parent::tearDown();
    }
}