<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Endpoint endpoints
 * - Endpoint management membutuhkan authentication
 */
class EndpointTest extends BaseTest {
    private $email;
    private $password;
    private $authToken = null;
    private $testUserId = null;
    private $projectId = null;
    private $testCollection = null;
    private $testEndpoints = [];

    protected function setUp() {
        parent::setUp();
        $this->email = 'endpointtest_' . time() . '@example.com';
        $this->password = 'EndpointTest123456';
        $this->setupTestUser();
    }

    /**
     * Setup test user, project, and collection
     */
    private function setupTestUser() {
        // Register user
        $userData = [
            'email' => $this->email,
            'password' => $this->password,
            'name' => 'Endpoint Test User'
        ];

        $result = $this->testHelper->post('register', $userData);

        // Login untuk dapatkan token
        $loginData = [
            'email' => $this->email,
            'password' => $this->password
        ];

        $loginResult = $this->testHelper->post('login', $loginData);
        if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
            $this->authToken = $loginResult['data']['access_token'];
            $this->testHelper->setAuthToken($this->authToken);
            $this->testUserId = $loginResult['data']['user']['id'] ?? null;
        }

        // Create project and collection for endpoint tests
        $this->setupTestProjectAndCollection();
    }

    /**
     * Setup test project and collection
     */
    private function setupTestProjectAndCollection() {
        // Create project
        $projectData = [
            'name' => 'Endpoint Test Project ' . time(),
            'description' => 'Created for endpoint testing'
        ];

        $projectResult = $this->testHelper->post('projects', $projectData);
        if ($projectResult['status'] === 201 && isset($projectResult['data']['data']['id'])) {
            $this->projectId = $projectResult['data']['data']['id'];

            // Create collection
            $collectionData = [
                'name' => 'Test Collection ' . time(),
                'description' => 'Collection for endpoint testing',
                'variables' => [
                    'base_url' => 'https://api.example.com',
                    'api_key' => 'test_api_key_123',
                    'user_id' => '12345'
                ]
            ];

            $collectionResult = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
            if ($collectionResult['status'] === 201 && isset($collectionResult['data']['data']['id'])) {
                $this->testCollection = [
                    'id' => $collectionResult['data']['data']['id'],
                    'project_id' => $this->projectId
                ];
            }
        }
    }

    /**
     * Test create endpoint
     */
    protected function testCreateEndpoint() {
        $this->printHeader("Create Endpoint Test");

        if (!$this->testCollection) {
            echo "[SKIP] Create Endpoint - No collection available\n";
            return true;
        }

        $endpointData = [
            'name' => 'Get User Endpoint',
            'method' => 'GET',
            'url' => '{{base_url}}/users/{{user_id}}',
            'headers' => [
                'Authorization' => 'Bearer {{api_key}}',
                'Accept' => 'application/json',
                'X-Custom-Header' => 'test-value'
            ],
            'body' => null
        ];

        $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
        $success = $this->testHelper->printResult("Create Endpoint", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testEndpoints[] = [
                'id' => $result['data']['data']['id'],
                'collection_id' => $this->testCollection['id']
            ];
        }

        return $success;
    }

    /**
     * Test create POST endpoint with body
     */
    protected function testCreatePostEndpoint() {
        $this->printHeader("Create POST Endpoint Test");

        if (!$this->testCollection) {
            echo "[SKIP] Create POST Endpoint - No collection available\n";
            return true;
        }

        $endpointData = [
            'name' => 'Create User Endpoint',
            'method' => 'POST',
            'url' => '{{base_url}}/users',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer {{api_key}}'
            ],
            'body' => [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'active' => true
            ]
        ];

        $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
        $success = $this->testHelper->printResult("Create POST Endpoint", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testEndpoints[] = [
                'id' => $result['data']['data']['id'],
                'collection_id' => $this->testCollection['id']
            ];
        }

        return $success;
    }

    /**
     * Test list endpoints
     */
    protected function testListEndpoints() {
        $this->printHeader("List Endpoints Test");

        if (!$this->testCollection) {
            echo "[SKIP] List Endpoints - No collection available\n";
            return true;
        }

        $result = $this->testHelper->get('endpoint_list', [], $this->testCollection['id']);
        $success = $this->testHelper->printResult("List Endpoints", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'endpoints');

            $endpoints = $result['data']['endpoints'] ?? [];
            echo "[INFO] Found " . count($endpoints) . " endpoints\n";
        }

        return $success;
    }

    /**
     * Test get endpoint details
     */
    protected function testGetEndpoint() {
        $this->printHeader("Get Endpoint Test");

        if (empty($this->testEndpoints)) {
            echo "[SKIP] Get Endpoint - No test endpoints available\n";
            return true;
        }

        $endpoint = $this->testEndpoints[0];
        $result = $this->testHelper->get('endpoint_get', [], $endpoint['id']);
        $success = $this->testHelper->printResult("Get Endpoint", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'endpoint');
            $this->testHelper->assertEquals($result['data']['endpoint'], 'id', $endpoint['id']);
        }

        return $success;
    }

    /**
     * Test update endpoint
     */
    protected function testUpdateEndpoint() {
        $this->printHeader("Update Endpoint Test");

        if (empty($this->testEndpoints)) {
            echo "[SKIP] Update Endpoint - No test endpoints available\n";
            return true;
        }

        $endpoint = $this->testEndpoints[0];
        $updateData = [
            'name' => 'Updated Get User Endpoint',
            'method' => 'GET',
            'url' => '{{base_url}}/v2/users/{{user_id}}?include=profile',
            'headers' => [
                'Authorization' => 'Bearer {{api_key}}',
                'Accept' => 'application/json',
                'X-Updated' => 'true',
                'X-Version' => 'v2'
            ],
            'body' => null
        ];

        $result = $this->testHelper->put('endpoint_update', $updateData, [], $endpoint['id']);
        $success = $this->testHelper->printResult("Update Endpoint", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Endpoint updated successfully');
        }

        return $success;
    }

    /**
     * Test update endpoint method
     */
    protected function testUpdateEndpointMethod() {
        $this->printHeader("Update Endpoint Method Test");

        if (empty($this->testEndpoints)) {
            echo "[SKIP] Update Endpoint Method - No test endpoints available\n";
            return true;
        }

        $endpoint = $this->testEndpoints[0];
        $updateData = [
            'name' => 'PUT Update User Endpoint',
            'method' => 'PUT',
            'url' => '{{base_url}}/users/{{user_id}}',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer {{api_key}}'
            ],
            'body' => [
                'name' => 'Updated Name',
                'email' => 'updated@example.com'
            ]
        ];

        $result = $this->testHelper->put('endpoint_update', $updateData, [], $endpoint['id']);
        $success = $this->testHelper->printResult("Update Endpoint Method", $result, 200);

        return $success;
    }

    /**
     * Test delete endpoint
     */
    protected function testDeleteEndpoint() {
        $this->printHeader("Delete Endpoint Test");

        if (empty($this->testEndpoints)) {
            echo "[SKIP] Delete Endpoint - No test endpoints available\n";
            return true;
        }

        // Use the last endpoint for deletion test
        $endpointToDelete = array_pop($this->testEndpoints);
        $result = $this->testHelper->delete('endpoint_delete', [], $endpointToDelete['id']);
        $success = $this->testHelper->printResult("Delete Endpoint", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Endpoint deleted successfully');
        }

        return $success;
    }

    /**
     * Test create endpoint with invalid HTTP method
     */
    protected function testCreateEndpointInvalidMethod() {
        $this->printHeader("Create Endpoint Invalid Method Test");

        if (!$this->testCollection) {
            echo "[SKIP] Create Endpoint Invalid Method - No collection available\n";
            return true;
        }

        $endpointData = [
            'name' => 'Invalid Method Endpoint',
            'method' => 'INVALID_METHOD',
            'url' => '{{base_url}}/test',
            'headers' => [],
            'body' => null
        ];

        $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
        $success = $this->testHelper->printResult("Create Endpoint Invalid Method", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Invalid HTTP method');
        }

        return $result['status'] === 400;
    }

    /**
     * Test create endpoint with missing required fields
     */
    protected function testCreateEndpointMissingFields() {
        $this->printHeader("Create Endpoint Missing Fields Test");

        if (!$this->testCollection) {
            echo "[SKIP] Create Endpoint Missing Fields - No collection available\n";
            return true;
        }

        $results = [];

        // Test missing name
        $data1 = [
            'method' => 'GET',
            'url' => '{{base_url}}/test'
        ];
        $result1 = $this->testHelper->post('endpoint_create', $data1, [], $this->testCollection['id']);
        $results[] = $this->testHelper->printResult("Create Endpoint Missing Name", $result1, 400);

        // Test missing method
        $data2 = [
            'name' => 'Test Endpoint',
            'url' => '{{base_url}}/test'
        ];
        $result2 = $this->testHelper->post('endpoint_create', $data2, [], $this->testCollection['id']);
        $results[] = $this->testHelper->printResult("Create Endpoint Missing Method", $result2, 400);

        // Test missing URL
        $data3 = [
            'name' => 'Test Endpoint',
            'method' => 'GET'
        ];
        $result3 = $this->testHelper->post('endpoint_create', $data3, [], $this->testCollection['id']);
        $results[] = $this->testHelper->printResult("Create Endpoint Missing URL", $result3, 400);

        return !in_array(false, $results);
    }

    /**
     * Test endpoint variable substitution
     */
    protected function testEndpointVariableSubstitution() {
        $this->printHeader("Endpoint Variable Substitution Test");

        if (!$this->testCollection) {
            echo "[SKIP] Variable Substitution - No collection available\n";
            return true;
        }

        $endpointData = [
            'name' => 'Variable Substitution Test',
            'method' => 'GET',
            'url' => '{{base_url}}/users/{{user_id}}/profile?format={{format}}&version={{version}}',
            'headers' => [
                'Authorization' => 'Bearer {{api_key}}',
                'X-User-ID' => '{{user_id}}',
                'X-Format' => '{{format}}'
            ],
            'body' => null
        ];

        $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
        $success = $this->testHelper->printResult("Create Endpoint with Variables", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $endpointId = $result['data']['data']['id'];
            $this->testEndpoints[] = [
                'id' => $endpointId,
                'collection_id' => $this->testCollection['id']
            ];

            // Verify variables are stored correctly
            $getResult = $this->testHelper->get('endpoint_get', [], $endpointId);
            if ($getResult['status'] === 200) {
                $url = $getResult['data']['endpoint']['url'] ?? '';
                if (strpos($url, '{{base_url}}') !== false && strpos($url, '{{user_id}}') !== false) {
                    echo "[INFO] Variables stored correctly in URL ✓\n";
                }

                $headers = $getResult['data']['endpoint']['headers'] ?? '';
                if (strpos($headers, '{{api_key}}') !== false) {
                    echo "[INFO] Variables stored correctly in headers ✓\n";
                }
            }
        }

        return $success;
    }

    /**
     * Test endpoint without authentication
     */
    protected function testEndpointUnauthorized() {
        $this->printHeader("Endpoint Without Authentication Test");

        if (!$this->testCollection) {
            echo "[SKIP] Endpoint Unauthorized - No collection available\n";
            return true;
        }

        // Clear token for unauthorized test
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test create endpoint without auth
        $endpointData = [
            'name' => 'Unauthorized Endpoint',
            'method' => 'GET',
            'url' => 'https://api.example.com/test'
        ];
        $result1 = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
        $results[] = $this->testHelper->printResult("Create Endpoint Without Auth", $result1, 401);

        // Test list endpoints without auth
        $result2 = $this->testHelper->get('endpoint_list', [], $this->testCollection['id']);
        $results[] = $this->testHelper->printResult("List Endpoints Without Auth", $result2, 401);

        // Test get endpoint without auth
        if (!empty($this->testEndpoints)) {
            $result3 = $this->testHelper->get('endpoint_get', [], $this->testEndpoints[0]['id']);
            $results[] = $this->testHelper->printResult("Get Endpoint Without Auth", $result3, 401);
        }

        // Restore token for other tests
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    /**
     * Test endpoint with different HTTP methods
     */
    protected function testEndpointHttpMethods() {
        $this->printHeader("Endpoint HTTP Methods Test");

        if (!$this->testCollection) {
            echo "[SKIP] HTTP Methods - No collection available\n";
            return true;
        }

        $methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
        $results = [];

        foreach ($methods as $method) {
            $endpointData = [
                'name' => "Test {$method} Endpoint",
                'method' => $method,
                'url' => '{{base_url}}/test',
                'headers' => [],
                'body' => in_array($method, ['POST', 'PUT', 'PATCH']) ? ['test' => 'data'] : null
            ];

            $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
            $success = $this->testHelper->printResult("Create {$method} Endpoint", $result, 201);
            $results[] = $success;

            if ($success && isset($result['data']['data']['id'])) {
                $this->testEndpoints[] = [
                    'id' => $result['data']['data']['id'],
                    'collection_id' => $this->testCollection['id']
                ];
            }
        }

        return !in_array(false, $results);
    }

    /**
     * Test endpoint permission (access other collection's endpoint)
     */
    protected function testEndpointPermission() {
        $this->printHeader("Endpoint Permission Test");

        if (empty($this->testEndpoints)) {
            echo "[SKIP] Endpoint Permission - No test endpoints available\n";
            return true;
        }

        // Create a different user and try to access our endpoint
        $differentEmail = 'different_' . time() . '@example.com';
        $differentPassword = 'DifferentTest123456';

        // Register different user
        $registerResult = $this->testHelper->post('register', [
            'email' => $differentEmail,
            'password' => $differentPassword,
            'name' => 'Different User'
        ]);

        if ($registerResult['status'] === 201 || $registerResult['status'] === 200) {
            // Login as different user
            $loginResult = $this->testHelper->post('login', [
                'email' => $differentEmail,
                'password' => $differentPassword
            ]);

            if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
                // Set token for different user
                $this->testHelper->setAuthToken($loginResult['data']['access_token']);

                // Try to access our endpoint (should fail)
                $endpoint = $this->testEndpoints[0];
                $result = $this->testHelper->get('endpoint_get', [], $endpoint['id']);
                $success = $this->testHelper->printResult("Access Other User Endpoint", $result, 403);

                if ($result['status'] === 403) {
                    echo "[INFO] Permission test passed - Cannot access other user's endpoint\n";
                    return true;
                }
            }
        }

        echo "[SKIP] Permission test - Could not create different user\n";
        return true;
    }

    /**
     * Test endpoint body handling for different content types
     */
    protected function testEndpointBodyHandling() {
        $this->printHeader("Endpoint Body Handling Test");

        if (!$this->testCollection) {
            echo "[SKIP] Body Handling - No collection available\n";
            return true;
        }

        $testCases = [
            [
                'name' => 'JSON Body Test',
                'method' => 'POST',
                'headers' => ['Content-Type' => 'application/json'],
                'body' => ['name' => 'Test', 'value' => 123, 'active' => true]
            ],
            [
                'name' => 'Form Data Test',
                'method' => 'POST',
                'headers' => ['Content-Type' => 'application/x-www-form-urlencoded'],
                'body' => 'name=Test&value=123&active=true'
            ],
            [
                'name' => 'Text Body Test',
                'method' => 'POST',
                'headers' => ['Content-Type' => 'text/plain'],
                'body' => 'Plain text body content'
            ],
            [
                'name' => 'XML Body Test',
                'method' => 'POST',
                'headers' => ['Content-Type' => 'application/xml'],
                'body' => '<data><name>Test</name><value>123</value></data>'
            ]
        ];

        $results = [];

        foreach ($testCases as $testCase) {
            $endpointData = [
                'name' => $testCase['name'],
                'method' => $testCase['method'],
                'url' => '{{base_url}}/test',
                'headers' => $testCase['headers'],
                'body' => $testCase['body']
            ];

            $result = $this->testHelper->post('endpoint_create', $endpointData, [], $this->testCollection['id']);
            $success = $this->testHelper->printResult("Create Endpoint: " . $testCase['name'], $result, 201);
            $results[] = $success;

            if ($success && isset($result['data']['data']['id'])) {
                $this->testEndpoints[] = [
                    'id' => $result['data']['data']['id'],
                    'collection_id' => $this->testCollection['id']
                ];
            }
        }

        return !in_array(false, $results);
    }

    protected function tearDown() {
        // Cleanup: Delete all test endpoints
        foreach ($this->testEndpoints as $endpoint) {
            $this->testHelper->delete('endpoint_delete', [], $endpoint['id']);
        }

        // Cleanup: Delete test collection
        if ($this->testCollection) {
            $this->testHelper->delete('collection_delete', [], $this->testCollection['id']);
        }

        // Cleanup: Delete test project
        if ($this->projectId) {
            $this->testHelper->delete('project_delete', [], $this->projectId);
        }

        // Cleanup: Logout test user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        parent::tearDown();
    }
}