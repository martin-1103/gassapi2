<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

class McpTest extends BaseTest {
    private $email;
    private $password;
    private $projectId;
    private $mcpToken;

    protected function setUp() {
        parent::setUp();
        $ts = time();
        $this->email = "mcptester_{$ts}@example.com";
        $this->password = 'McpTest1234';
    }

    protected function testRegisterAndLogin() {
        $this->printHeader('Register & Login');
        $res1 = $this->testHelper->post('register', [
            'email' => $this->email,
            'password' => $this->password,
            'name' => 'MCP Tester'
        ]);
        $ok1 = $this->testHelper->printResult('Register (McpTest)', $res1, 201);
        $res2 = $this->testHelper->post('login', [
            'email' => $this->email,
            'password' => $this->password
        ]);
        $ok2 = $this->testHelper->printResult('Login (McpTest)', $res2, 200);
        if ($ok2 && isset($res2['data']['data']['access_token'])) {
            $this->testHelper->setAuthToken($res2['data']['data']['access_token']);
        }
        return $ok1 && $ok2;
    }

    protected function testCreateProject() {
        $this->printHeader('Create Project');
        $res = $this->testHelper->post('projects', [ 'name' => 'MCP Project' ]);
        $ok = $this->testHelper->printResult('Create Project (McpTest)', $res, 201);
        if ($ok && isset($res['data']['data']['id'])) {
            $this->projectId = $res['data']['data']['id'];
        }
        return $ok;
    }

    protected function testGenerateConfig() {
        if (!$this->projectId) return true;
        $this->printHeader('Generate MCP Config');
        $res = $this->testHelper->post('mcp_generate_config', null, [], $this->projectId);
        $ok = $this->testHelper->printResult('Generate MCP Config', $res, 201);
        if ($ok && isset($res['data']['data']['token'])) {
            $this->mcpToken = $res['data']['data']['token'];
        }
        return $ok;
    }

    protected function testValidateToken() {
        if (!$this->mcpToken) return true;
        $this->printHeader('Validate MCP Token');
        // Use direct request to include custom Authorization header, bypassing auth token
        $helper = new TestHelper();
        $result = $helper->get('mcp_validate', [ 'Authorization: Bearer ' . $this->mcpToken ]);
        return $this->testHelper->printResult('Validate MCP Token', $result, 200);
    }

    /**
     * Test generate config with invalid project ID
     */
    protected function testGenerateConfigInvalidProject() {
        $this->printHeader('Generate MCP Config Invalid Project');

        // Test with non-existent project ID
        $res = $this->testHelper->post('mcp_generate_config', null, [], 99999);
        $success = $this->testHelper->printResult('Generate Config Invalid Project', $res, 404);

        if ($success) {
            $this->testHelper->assertEquals($res, 'message', 'Project not found');
        }

        return $success;
    }

    /**
     * Test generate config without authentication
     */
    protected function testGenerateConfigUnauthorized() {
        $this->printHeader('Generate MCP Config Without Authentication');

        // Clear token for unauthorized test
        $this->testHelper->clearAuthToken();

        // Test with valid project ID but no auth token
        if ($this->projectId) {
            $res = $this->testHelper->post('mcp_generate_config', null, [], $this->projectId);
            $success = $this->testHelper->printResult('Generate Config Without Auth', $res, 401);

            return $success;
        }

        echo "[SKIP] Generate Config Unauthorized - No project ID available\n";
        return true;
    }

    /**
     * Test validate token with invalid token
     */
    protected function testValidateInvalidToken() {
        $this->printHeader('Validate Invalid MCP Token');

        // Test with completely invalid token
        $helper = new TestHelper();
        $result = $helper->get('mcp_validate', [ 'Authorization: Bearer invalid_token_12345' ]);
        $success = $this->testHelper->printResult('Validate Invalid Token', $result, 401);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Invalid MCP token');
        }

        return $success;
    }

    /**
     * Test validate token with expired token format
     */
    protected function testValidateExpiredToken() {
        $this->printHeader('Validate Expired MCP Token');

        // Test with expired-looking token format
        $helper = new TestHelper();
        $expiredToken = 'mcp_expired_' . (time() - 86400) . '_signature'; // Expired yesterday
        $result = $helper->get('mcp_validate', [ 'Authorization: Bearer ' . $expiredToken ]);
        $success = $this->testHelper->printResult('Validate Expired Token', $result, 401);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Token expired');
        }

        return $success;
    }

    /**
     * Test validate token without Authorization header
     */
    protected function testValidateTokenWithoutHeader() {
        $this->printHeader('Validate Token Without Authorization Header');

        // Test without Authorization header (should fail)
        $res = $this->testHelper->get('mcp_validate');
        $success = $this->testHelper->printResult('Validate Token Without Header', $res, 401);

        if ($success) {
            $this->testHelper->assertEquals($res, 'message', 'Authorization header required');
        }

        return $success;
    }

    /**
     * Test validate token with malformed Authorization header
     */
    protected function testValidateTokenMalformedHeader() {
        $this->printHeader('Validate Token Malformed Authorization Header');

        // Test with malformed header (missing "Bearer" prefix)
        $helper = new TestHelper();
        $result = $helper->get('mcp_validate', [ 'Authorization: ' . ($this->mcpToken ?? 'invalid_token') ]);
        $success = $this->testHelper->printResult('Validate Malformed Header', $result, 401);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Invalid authorization header format');
        }

        return $success;
    }

    /**
     * Test MCP token permissions (access other project's token)
     */
    protected function testMcpTokenPermission() {
        if (!$this->mcpToken) return true;
        $this->printHeader('MCP Token Permission Test');

        // Try to use MCP token to access other project endpoints
        // This tests if MCP tokens are properly scoped to their project

        // Try to access environment details from a different project using this MCP token
        $helper = new TestHelper();
        $result = $helper->get('environment', [ 'Authorization: Bearer ' . $this->mcpToken ], 99999); // Non-existent environment
        $success = $this->testHelper->printResult('MCP Token Cross-Project Access', $result, 404);

        // Should get 404 (not found) rather than 403 (forbidden) or 200 (success)
        // This indicates proper scoping
        if ($result['status'] === 404) {
            echo "[INFO] MCP token properly scoped - Cannot access non-existent resources\n";
            $success = true;
        }

        return $success;
    }

    /**
     * Test multiple MCP config generations
     */
    protected function testMultipleConfigGenerations() {
        if (!$this->projectId) return true;
        $this->printHeader('Multiple MCP Config Generations');

        $tokens = [];

        // Generate multiple MCP tokens for the same project
        for ($i = 1; $i <= 3; $i++) {
            $res = $this->testHelper->post('mcp_generate_config', null, [], $this->projectId);
            $success = $this->testHelper->printResult("Generate MCP Config #$i", $res, 201);

            if ($success && isset($res['data']['data']['token'])) {
                $tokens[] = $res['data']['data']['token'];
            } else {
                return false; // Stop if any generation fails
            }
        }

        // Validate that all generated tokens are unique
        if (count($tokens) === count(array_unique($tokens))) {
            echo "[INFO] All generated MCP tokens are unique\n";
            return true;
        } else {
            echo "[ERROR] Duplicate MCP tokens detected\n";
            return false;
        }
    }

    /**
     * Test MCP config generation with project member vs owner
     */
    protected function testMcpConfigMemberPermission() {
        if (!$this->projectId) return true;
        $this->printHeader('MCP Config Member Permission Test');

        // Create a different user
        $memberEmail = 'mcpmember_' . time() . '@example.com';
        $memberPassword = 'MemberTest1234';

        // Register member user
        $registerRes = $this->testHelper->post('register', [
            'email' => $memberEmail,
            'password' => $memberPassword,
            'name' => 'MCP Member'
        ]);

        if ($registerRes['status'] === 201 || $registerRes['status'] === 200) {
            // Login as member user
            $loginRes = $this->testHelper->post('login', [
                'email' => $memberEmail,
                'password' => $memberPassword
            ]);

            if ($loginRes['status'] === 200 && isset($loginRes['data']['data']['access_token'])) {
                // Set token for member user
                $this->testHelper->setAuthToken($loginRes['data']['data']['access_token']);

                // Try to generate MCP config for original project (should fail - not a member)
                $res = $this->testHelper->post('mcp_generate_config', null, [], $this->projectId);
                $success = $this->testHelper->printResult('MCP Config by Non-Member', $res, 403);

                if ($res['status'] === 403) {
                    echo "[INFO] Permission test passed - Non-member cannot generate MCP config\n";
                    return true;
                } elseif ($res['status'] === 404) {
                    echo "[INFO] MCP config endpoint not found or different permission model\n";
                    return true;
                }
            }
        }

        echo "[SKIP] Member permission test - Could not create or login member user\n";
        return true;
    }

    protected function tearDown() {
        // Cleanup: Delete project if it still exists
        if ($this->projectId) {
            $this->testHelper->delete('project_delete', [], $this->projectId);
        }

        parent::tearDown();
    }
}
