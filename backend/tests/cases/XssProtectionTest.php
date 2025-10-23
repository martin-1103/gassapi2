<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Comprehensive XSS Protection Test Suite
 * Test untuk memastikan XSS protection bekerja dengan benar
 */
class XssProtectionTest extends BaseTest {
    private $testEmail;
    private $testPassword;
    private $authToken = null;
    private $testUserId = null;

    protected function setUp() {
        parent::setUp();
        $this->testEmail = 'xsstest_' . time() . '@example.com';
        $this->testPassword = 'XssTest123456';
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
            'name' => 'XSS Test User'
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
     * Test basic script tag injection
     */
    public function testBasicScriptInjection() {
        $this->printHeader("Basic Script Injection Test");

        if (!$this->authToken) {
            echo "[SKIP] Basic Script Injection - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            '<script>alert("XSS")</script>',
            '<SCRIPT>alert("XSS")</SCRIPT>',
            '<script>alert(String.fromCharCode(88,83,83))</script>',
            '<script src="evil.js"></script>',
            '<script>alert(document.domain)</script>',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Script: " . substr($payload, 0, 30) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test JavaScript protocol injection
     */
    public function testJavaScriptProtocolInjection() {
        $this->printHeader("JavaScript Protocol Injection Test");

        if (!$this->authToken) {
            echo "[SKIP] JavaScript Protocol - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            'javascript:alert("XSS")',
            'JAVASCRIPT:alert("XSS")',
            'JavaScript:alert("XSS")',
            'javascript:alert(document.cookie)',
            'javascript:void(0);alert("XSS")',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Protocol: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test event handler injection
     */
    public function testEventHandlerInjection() {
        $this->printHeader("Event Handler Injection Test");

        if (!$this->authToken) {
            echo "[SKIP] Event Handler - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            '<img src="x" onerror="alert(1)">',
            '<div onclick="alert(1)">click me</div>',
            '<body onload="alert(1)">',
            '<svg onload="alert(1)">',
            '<iframe onload="alert(1)">',
            '<input onfocus="alert(1)" autofocus>',
            '" onclick="alert(1)"',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Event: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test encoded/obfuscated attacks
     */
    public function testEncodedObfuscatedAttacks() {
        $this->printHeader("Encoded/Obfuscated Attacks Test");

        if (!$this->authToken) {
            echo "[SKIP] Encoded Attacks - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;',
            '%3Cscript%3Ealert%28%22XSS%22%29%3C%2Fscript%3E',
            '&#60;script&#62;alert&#40;&#34;XSS&#34;&#41;&#60;&#47;script&#62;',
            '<img src=x onerror=alert(1)>',
            '<script>alert(String.fromCharCode(88,83,83))</script>',
            '<scr\x00ipt>alert(1)</scr\x00ipt>',
            '<scr\0ipt>alert(1)</scr\0ipt>',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Encoded: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test CSS-based XSS attacks
     */
    public function testCssBasedAttacks() {
        $this->printHeader("CSS-Based XSS Attacks Test");

        if (!$this->authToken) {
            echo "[SKIP] CSS Attacks - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            '<style>@import url("javascript:alert(1)");</style>',
            '<style>body{background:url("javascript:alert(1)")}</style>',
            '<style>div{expression(alert(1))}</style>',
            '<link rel="stylesheet" href="javascript:alert(1)">',
            '<style>-moz-binding:url("javascript:alert(1)")</style>',
            '<div style="background:url(javascript:alert(1))">test</div>',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("CSS: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test DOM-based XSS attacks
     */
    public function testDomBasedAttacks() {
        $this->printHeader("DOM-Based XSS Attacks Test");

        if (!$this->authToken) {
            echo "[SKIP] DOM Attacks - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            'document.write("<script>alert(1)</script>")',
            'window.location="javascript:alert(1)"',
            'eval("alert(1)")',
            'setTimeout("alert(1)", 100)',
            'setInterval("alert(1)", 100)',
            'Function("alert(1)")()',
            'innerHTML="<script>alert(1)</script>"',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("DOM: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test data URL attacks
     */
    public function testDataUrlAttacks() {
        $this->printHeader("Data URL Attacks Test");

        if (!$this->authToken) {
            echo "[SKIP] Data URL - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            'data:text/html,<script>alert(1)</script>',
            'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
            'data:image/svg+xml,<script>alert(1)</script>',
            'data:application/javascript,alert(1)',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Data URL: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test advanced obfuscation techniques
     */
    public function testAdvancedObfuscation() {
        $this->printHeader("Advanced Obfuscation Test");

        if (!$this->authToken) {
            echo "[SKIP] Advanced Obfuscation - No auth token available\n";
            return true;
        }

        $xssPayloads = [
            '<script>alert(String.fromCharCode(88,83,83))</script>',
            '<script>alert(String.fromCharCode(0x58,0x53,0x53))</script>',
            '<script>alert(\u0058\u0053\u0053)</script>',
            '<script>alert(/XSS/.source)</script>',
            '<script>alert`XSS`</script>',
            '<script>[][(![]+[])[+[]]+([]+{})[!+[]+!![]])</script>',
        ];

        $results = [];

        foreach ($xssPayloads as $payload) {
            $updateData = [
                'name' => $payload
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Advanced: " . substr($payload, 0, 25) . "...", $result, 400);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test valid inputs still work (ensure not blocking legitimate content)
     */
    public function testValidInputs() {
        $this->printHeader("Valid Inputs Test");

        if (!$this->authToken) {
            echo "[SKIP] Valid Inputs - No auth token available\n";
            return true;
        }

        $validInputs = [
            'John Doe',
            'Jane Smith-Johnson',
            'José García',
            'François Müller',
            '张伟', // Chinese characters
            'محمد علي', // Arabic characters
            'O\'Connor',
            'Anne-Marie',
            'John Jr.',
            'Dr. Smith MD',
            'The "Great" Developer',
            'User@Company.com',
            'Test with & symbols',
            'Special chars: !@#$%^&*()',
        ];

        $results = [];

        foreach ($validInputs as $input) {
            $updateData = [
                'name' => $input
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $success = $this->testHelper->printResult("Valid: '" . substr($input, 0, 20) . "...'", $result, 200);
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test boundary cases
     */
    public function testBoundaryCases() {
        $this->printHeader("Boundary Cases Test");

        if (!$this->authToken) {
            echo "[SKIP] Boundary Cases - No auth token available\n";
            return true;
        }

        $boundaryInputs = [
            '', // Empty string
            ' ', // Only space
            'a', // Single character (should be rejected - min 2 chars)
            'ab', // Minimum valid length
            str_repeat('a', 100), // Maximum valid length
            str_repeat('a', 101), // Over maximum length
            'normal<script>alert(1)</script>name', // Mixed valid/invalid
            'test\nname', // Newline character
            'test\tname', // Tab character
            'test\x00name', // Null byte
        ];

        $expectedResults = [
            400, // Empty - should be rejected
            400, // Only space - should be rejected
            400, // Single char - should be rejected
            200, // Min valid - should be accepted
            200, // Max valid - should be accepted
            400, // Over max - should be rejected
            400, // Mixed valid/invalid - should be rejected
            400, // Newline - should be rejected
            400, // Tab - should be rejected
            400, // Null byte - should be rejected
        ];

        $results = [];

        foreach ($boundaryInputs as $index => $input) {
            $updateData = [
                'name' => $input
            ];

            $result = $this->testHelper->post('profile', $updateData);
            $expected = $expectedResults[$index];

            $success = $this->testHelper->printResult(
                "Boundary: " . (strlen($input) > 20 ? substr($input, 0, 20) . "..." : var_export($input, true)),
                $result,
                $expected
            );
            $results[] = $success;
        }

        return !in_array(false, $results);
    }

    /**
     * Test XSS protection during registration
     */
    public function testRegistrationXssProtection() {
        $this->printHeader("Registration XSS Protection Test");

        $xssPayloads = [
            '<script>alert("XSS")</script>',
            'javascript:alert(1)',
            '<img src=x onerror=alert(1)>',
        ];

        $results = [];

        foreach ($xssPayloads as $index => $payload) {
            $testEmail = 'xsstest' . $index . '_' . time() . '@example.com';
            $userData = [
                'email' => $testEmail,
                'password' => 'TestPassword123',
                'name' => $payload
            ];

            $result = $this->testHelper->post('register', $userData);
            $success = $this->testHelper->printResult("Reg XSS: " . substr($payload, 0, 20) . "...", $result, 400);
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