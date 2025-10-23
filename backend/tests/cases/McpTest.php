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
}
