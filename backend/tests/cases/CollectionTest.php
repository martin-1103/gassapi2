<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Collection endpoints
 * - Collection management membutuhkan authentication
 */
class CollectionTest extends BaseTest {
    private $email;
    private $password;
    private $authToken = null;
    private $testUserId = null;
    private $projectId = null;
    private $testCollections = [];

    protected function setUp() {
        parent::setUp();
        $this->email = 'collectiontest_' . time() . '@example.com';
        $this->password = 'CollectionTest123456';
        $this->setupTestUser();
    }

    /**
     * Setup test user dan project
     */
    private function setupTestUser() {
        // Register user
        $userData = [
            'email' => $this->email,
            'password' => $this->password,
            'name' => 'Collection Test User'
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

        // Create project for collection tests
        $this->setupTestProject();
    }

    /**
     * Setup test project
     */
    private function setupTestProject() {
        $projectData = [
            'name' => 'Collection Test Project ' . time(),
            'description' => 'Created for collection testing'
        ];

        $result = $this->testHelper->post('projects', $projectData);
        if ($result['status'] === 201 && isset($result['data']['id'])) {
            $this->projectId = $result['data']['id'];
        }
    }

    /**
     * Test create collection
     */
    protected function testCreateCollection() {
        $this->printHeader("Create Collection Test");

        if (!$this->projectId) {
            return $this->skip("Create Collection - No project ID available");
            
        }

        $collectionData = [
            'name' => 'Test Collection ' . time(),
            'description' => 'Collection created by automated test',
            'headers' => [
                'Content-Type' => 'application/json',
                'X-API-Key' => '{{api_key}}'
            ],
            'variables' => [
                'base_url' => 'https://api.example.com',
                'api_key' => 'test_key_123'
            ],
            'is_default' => false
        ];

        $result = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Collection", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $this->testCollections[] = [
                'id' => $result['data']['id'],
                'project_id' => $this->projectId
            ];
        }

        return $success;
    }

    /**
     * Test list collections
     */
    protected function testListCollections() {
        $this->printHeader("List Collections Test");

        if (!$this->projectId) {
            return $this->skip("List Collections - No project ID available");
            
        }

        $result = $this->testHelper->get('collections_list', [], $this->projectId);
        $success = $this->testHelper->printResult("List Collections", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            // data is array of collections directly
            $collections = is_array($result['data']) ? $result['data'] : [];
            echo "[INFO] Found " . count($collections) . " collections\n";
        }

        return $success;
    }

    /**
     * Test get collection details
     */
    protected function testGetCollection() {
        $this->printHeader("Get Collection Test");

        if (empty($this->testCollections)) {
            return $this->skip("Get Collection - No test collections available");
            
        }

        $collection = $this->testCollections[0];
        $result = $this->testHelper->get('collection_get', [], $collection['id']);
        $success = $this->testHelper->printResult("Get Collection", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'id');
            $this->testHelper->assertEquals($result['data'], 'id', $collection['id']);
        }

        return $success;
    }

    /**
     * Test update collection
     */
    protected function testUpdateCollection() {
        $this->printHeader("Update Collection Test");

        if (empty($this->testCollections)) {
            return $this->skip("Update Collection - No test collections available");
            
        }

        $collection = $this->testCollections[0];
        $updateData = [
            'name' => 'Updated Collection ' . time(),
            'description' => 'Updated by automated test',
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer {{token}}',
                'X-Updated' => 'true'
            ],
            'variables' => [
                'base_url' => 'https://updated-api.example.com',
                'api_key' => 'updated_key_456',
                'version' => 'v2'
            ],
            'is_default' => true
        ];

        $result = $this->testHelper->put('collection_update', $updateData, [], $collection['id']);
        $success = $this->testHelper->printResult("Update Collection", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Collection updated successfully');
        }

        return $success;
    }

    /**
     * Test create nested collection
     */
    protected function testCreateNestedCollection() {
        $this->printHeader("Create Nested Collection Test");

        if (!$this->projectId || empty($this->testCollections)) {
            return $this->skip("Nested Collection - No project or parent collection available");
            
        }

        $parentCollection = $this->testCollections[0];
        $nestedData = [
            'name' => 'Nested Collection ' . time(),
            'description' => 'Child collection for testing',
            'parent_id' => $parentCollection['id'],
            'variables' => [
                'nested_var' => 'nested_value'
            ]
        ];

        $result = $this->testHelper->post('collection_create', $nestedData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Nested Collection", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $this->testCollections[] = [
                'id' => $result['data']['id'],
                'project_id' => $this->projectId,
                'parent_id' => $parentCollection['id']
            ];
        }

        return $success;
    }

    /**
     * Test delete collection
     */
    protected function testDeleteCollection() {
        $this->printHeader("Delete Collection Test");

        if (empty($this->testCollections)) {
            return $this->skip("Delete Collection - No test collections available");
            
        }

        // Use the last collection for deletion test
        $collectionToDelete = array_pop($this->testCollections);
        $result = $this->testHelper->delete('collection_delete', [], $collectionToDelete['id']);
        $success = $this->testHelper->printResult("Delete Collection", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Collection deleted successfully');
        }

        return $success;
    }

    /**
     * Test collection with invalid data
     */
    protected function testCreateCollectionInvalid() {
        $this->printHeader("Create Collection Invalid Data Test");

        if (!$this->projectId) {
            return $this->skip("Create Collection Invalid - No project ID available");
            
        }

        $results = [];

        // Test with missing name
        $data1 = [
            'description' => 'Collection without name'
        ];
        $result1 = $this->testHelper->post('collection_create', $data1, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Collection Missing Name", $result1, 400);

        // Test with empty name
        $data2 = [
            'name' => '',
            'description' => 'Collection with empty name'
        ];
        $result2 = $this->testHelper->post('collection_create', $data2, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Collection Empty Name", $result2, 400);

        // Test with invalid parent_id
        $data3 = [
            'name' => 'Test Collection',
            'parent_id' => 'invalid_parent_id'
        ];
        $result3 = $this->testHelper->post('collection_create', $data3, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Collection Invalid Parent", $result3, 400);

        return !in_array(false, $results);
    }

    /**
     * Test collection without authentication
     */
    protected function testCollectionUnauthorized() {
        $this->printHeader("Collection Without Authentication Test");

        if (!$this->projectId) {
            return $this->skip("Collection Unauthorized - No project ID available");
            
        }

        // Clear token for unauthorized test
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test create collection without auth
        $collectionData = ['name' => 'Unauthorized Collection'];
        $result1 = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Collection Without Auth", $result1, 401);

        // Test list collections without auth
        $result2 = $this->testHelper->get('collections_list', [], $this->projectId);
        $results[] = $this->testHelper->printResult("List Collections Without Auth", $result2, 401);

        // Test get collection without auth
        if (!empty($this->testCollections)) {
            $result3 = $this->testHelper->get('collection_get', [], $this->testCollections[0]['id']);
            $results[] = $this->testHelper->printResult("Get Collection Without Auth", $result3, 401);
        }

        // Restore token for other tests
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    /**
     * Test collection headers inheritance
     */
    protected function testCollectionHeaders() {
        $this->printHeader("Collection Headers Test");

        if (!$this->projectId) {
            return $this->skip("Collection Headers - No project ID available");
            
        }

        $collectionData = [
            'name' => 'Headers Test Collection ' . time(),
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer {{token}}',
                'X-API-Version' => 'v1.0',
                'X-Custom-Header' => 'custom-value'
            ],
            'variables' => [
                'token' => 'test_token_123'
            ]
        ];

        $result = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Collection with Headers", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $collectionId = $result['data']['id'];
            $this->testCollections[] = ['id' => $collectionId, 'project_id' => $this->projectId];

            // Verify headers are stored correctly
            $getResult = $this->testHelper->get('collection_get', [], $collectionId);
            if ($getResult['status'] === 200) {
                $headers = $getResult['data']['headers'] ?? '';
                if (strpos($headers, 'Content-Type') !== false && strpos($headers, 'X-API-Version') !== false) {
                    echo "[INFO] Headers stored correctly ✓\n";
                } else {
                    echo "[WARNING] Headers might not be stored as expected\n";
                }
            }
        }

        return $success;
    }

    /**
     * Test collection variables functionality
     */
    protected function testCollectionVariables() {
        $this->printHeader("Collection Variables Test");

        if (!$this->projectId) {
            return $this->skip("Collection Variables - No project ID available");
            
        }

        $collectionData = [
            'name' => 'Variables Test Collection ' . time(),
            'variables' => [
                'base_url' => 'https://api.example.com',
                'api_key' => 'secret_key_789',
                'timeout' => '30',
                'environment' => 'production'
            ]
        ];

        $result = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Collection with Variables", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $collectionId = $result['data']['id'];
            $this->testCollections[] = ['id' => $collectionId, 'project_id' => $this->projectId];

            // Verify variables are stored correctly
            $getResult = $this->testHelper->get('collection_get', [], $collectionId);
            if ($getResult['status'] === 200) {
                $variables = $getResult['data']['variables'] ?? '';
                if (strpos($variables, 'base_url') !== false && strpos($variables, 'api_key') !== false) {
                    echo "[INFO] Variables stored correctly ✓\n";
                } else {
                    echo "[WARNING] Variables might not be stored as expected\n";
                }
            }
        }

        return $success;
    }

    /**
     * Test collection permission (access other project's collection)
     */
    protected function testCollectionPermission() {
        $this->printHeader("Collection Permission Test");

        if (empty($this->testCollections)) {
            return $this->skip("Collection Permission - No test collections available");
            
        }

        // Create a different user and try to access our collection
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

                // Try to access our collection (should fail)
                $collection = $this->testCollections[0];
                $result = $this->testHelper->get('collection_get', [], $collection['id']);
                $success = $this->testHelper->printResult("Access Other User Collection", $result, 403);

                if ($result['status'] === 403) {
                    echo "[INFO] Permission test passed - Cannot access other user's collection\n";
                }
                
                // Restore original token
                if ($this->authToken) {
                    $this->testHelper->setAuthToken($this->authToken);
                }
                
                return $success;
            }
        }

        return $this->skip("Permission test - Could not create different user");
        
    }

    protected function tearDown() {
        // Cleanup: Delete all test collections
        foreach ($this->testCollections as $collection) {
            $this->testHelper->delete('collection_delete', [], $collection['id']);
        }

        // Cleanup: Delete test project
        if ($this->projectId) {
            $this->testHelper->delete('project_delete', [], $this->projectId);
        }

        // Cleanup: Logout test user
        if ($this->authToken) {
            $this->testHelper->post('logout');
        }

        return parent::tearDown();
    }
}