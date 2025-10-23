<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Authentication endpoints
 */
class AuthTest extends BaseTest {
    private $testEmail;
    private $testPassword;
    private $authToken = null;

    protected function setUp() {
        parent::setUp();
        $this->testEmail = 'test_' . time() . '@example.com';
        $this->testPassword = 'Test123456!';
    }

    /**
     * Test user registration
     */
    protected function testRegister() {
        $this->printHeader("User Registration Test");

        $userData = [
            'email' => $this->testEmail,
            'password' => $this->testPassword,
            'name' => 'Test User'
        ];

        $result = $this->testHelper->post('register', $userData);
        $success = $this->testHelper->printResult("User Registration", $result, 201);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertEquals($result, 'message', 'User registered successfully');
        }

        return $success;
    }

    /**
     * Test login dengan valid credentials
     */
    protected function testLoginValid() {
        $this->printHeader("Login with Valid Credentials Test");

        $loginData = [
            'email' => $this->testEmail,
            'password' => $this->testPassword
        ];

        $result = $this->testHelper->post('login', $loginData);
        $success = $this->testHelper->printResult("Valid Login", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');

            // Save token untuk test selanjutnya
            if (isset($result['data']['access_token'])) {
                $this->authToken = $result['data']['access_token'];
                $this->testHelper->setAuthToken($this->authToken);
            }

            // Verify response structure
            $expectedKeys = ['access_token', 'token_type', 'expires_in'];
            foreach ($expectedKeys as $key) {
                $this->testHelper->assertHasKey($result['data'], $key);
            }
        }

        return $success;
    }

    /**
     * Test login dengan invalid credentials
     */
    protected function testLoginInvalid() {
        $this->printHeader("Login with Invalid Credentials Test");

        $loginData = [
            'email' => $this->testEmail,
            'password' => 'wrongpassword'
        ];

        $result = $this->testHelper->post('login', $loginData);
        $success = $this->testHelper->printResult("Invalid Login", $result, 401);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Invalid credentials');
        }

        return $success;
    }

    /**
     * Test login dengan missing fields
     */
    protected function testLoginMissingFields() {
        $this->printHeader("Login with Missing Fields Test");

        // Test missing password
        $result1 = $this->testHelper->post('login', ['email' => $this->testEmail]);
        $success1 = $this->testHelper->printResult("Login Missing Password", $result1, 400);

        // Test missing email
        $result2 = $this->testHelper->post('login', ['password' => $this->testPassword]);
        $success2 = $this->testHelper->printResult("Login Missing Email", $result2, 400);

        return $success1 && $success2;
    }

    /**
     * Test login dengan invalid email format
     */
    protected function testLoginInvalidEmail() {
        $this->printHeader("Login with Invalid Email Format Test");

        $loginData = [
            'email' => 'invalid-email',
            'password' => $this->testPassword
        ];

        $result = $this->testHelper->post('login', $loginData);
        $success = $this->testHelper->printResult("Invalid Email Format", $result, 400);

        return $success;
    }

    /**
     * Test logout
     */
    protected function testLogout() {
        $this->printHeader("Logout Test");

        if (!$this->authToken) {
            echo "[SKIP] Logout - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->post('logout');
        $success = $this->testHelper->printResult("Logout", $result, 200);

        if ($success) {
            $this->testHelper->clearAuthToken();
            $this->authToken = null;
        }

        return $success;
    }

    /**
     * Test register dengan duplicate email
     */
    protected function testRegisterDuplicate() {
        $this->printHeader("Register Duplicate Email Test");

        $userData = [
            'email' => $this->testEmail,
            'password' => $this->testPassword,
            'name' => 'Another Test User'
        ];

        $result = $this->testHelper->post('register', $userData);
        $success = $this->testHelper->printResult("Duplicate Registration", $result, 409);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'User already exists');
        }

        return $success;
    }

    /**
     * Test register dengan invalid data
     */
    protected function testRegisterInvalidData() {
        $this->printHeader("Register Invalid Data Test");

        // Test invalid email
        $result1 = $this->testHelper->post('register', [
            'email' => 'invalid-email',
            'password' => $this->testPassword,
            'name' => 'Test User'
        ]);
        $success1 = $this->testHelper->printResult("Register Invalid Email", $result1, 400);

        // Test weak password
        $result2 = $this->testHelper->post('register', [
            'email' => 'test2@example.com',
            'password' => '123',
            'name' => 'Test User'
        ]);
        $success2 = $this->testHelper->printResult("Register Weak Password", $result2, 400);

        // Test missing fields
        $result3 = $this->testHelper->post('register', [
            'email' => 'test3@example.com'
            // missing password and name
        ]);
        $success3 = $this->testHelper->printResult("Register Missing Fields", $result3, 400);

        return $success1 && $success2 && $success3;
    }

    /**
     * Test access protected endpoint without token
     */
    protected function testProtectedEndpointNoToken() {
        $this->printHeader("Protected Endpoint Without Token Test");

        // Clear any existing token
        $this->testHelper->clearAuthToken();

        $result = $this->testHelper->get('profile');
        $success = $this->testHelper->printResult("Protected Without Token", $result, 401);

        return $success;
    }

    /**
     * Test refresh token
     */
    protected function testRefreshToken() {
        $this->printHeader("Refresh Token Test");

        if (!$this->authToken) {
            // Try login first
            $this->testLoginValid();
        }

        if (!$this->authToken) {
            echo "[SKIP] Refresh Token - No auth token available\n";
            return true;
        }

        $result = $this->testHelper->post('refresh');
        $success = $this->testHelper->printResult("Refresh Token", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'access_token');
        }

        return $success;
    }
}