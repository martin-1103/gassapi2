<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Folder endpoints
 * - Folder management membutuhkan authentication
 */
class FolderTest extends BaseTest {
    private $email;
    private $password;
    private $authToken = null;
    private $testUserId = null;
    private $projectId = null;
    private $testFolders = [];

    protected function setUp() {
        parent::setUp();
        $this->email = 'foldertest_' . time() . '@example.com';
        $this->password = 'FolderTest123456';
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
            'name' => 'Folder Test User'
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

        // Create project for folder tests
        $this->setupTestProject();
    }

    /**
     * Setup test project
     */
    private function setupTestProject() {
        $projectData = [
            'name' => 'Folder Test Project ' . time(),
            'description' => 'Created for folder testing'
        ];

        $result = $this->testHelper->post('projects', $projectData);
        if ($result['status'] === 201 && isset($result['data']['id'])) {
            $this->projectId = $result['data']['id'];
        }
    }

    /**
     * Test create folder
     */
    protected function testCreateFolder() {
        $this->printHeader("Create Folder Test");

        if (!$this->projectId) {
            return $this->skip("Create Folder - No project ID available");
            
        }

        $folderData = [
            'name' => 'Test Folder ' . time(),
            'description' => 'Folder created by automated test',
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

        $result = $this->testHelper->post('folder_create', $folderData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Folder", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $this->testFolders[] = [
                'id' => $result['data']['id'],
                'project_id' => $this->projectId
            ];
        }

        return $success;
    }

    /**
     * Test list folders
     */
    protected function testListFolders() {
        $this->printHeader("List Folders Test");

        if (!$this->projectId) {
            return $this->skip("List Folders - No project ID available");
            
        }

        $result = $this->testHelper->get('folders_list', [], $this->projectId);
        $success = $this->testHelper->printResult("List Folders", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            // data is array of folders directly
            $folders = is_array($result['data']) ? $result['data'] : [];
            echo "[INFO] Found " . count($folders) . " folders\n";
        }

        return $success;
    }

    /**
     * Test get folder details
     */
    protected function testGetFolder() {
        $this->printHeader("Get Folder Test");

        if (empty($this->testFolders)) {
            return $this->skip("Get Folder - No test folders available");
            
        }

        $folder = $this->testFolders[0];
        $result = $this->testHelper->get('folder_get', [], $folder['id']);
        $success = $this->testHelper->printResult("Get Folder", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'id');
            $this->testHelper->assertEquals($result['data'], 'id', $folder['id']);
        }

        return $success;
    }

    /**
     * Test update folder
     */
    protected function testUpdateFolder() {
        $this->printHeader("Update Folder Test");

        if (empty($this->testFolders)) {
            return $this->skip("Update Folder - No test folders available");
            
        }

        $folder = $this->testFolders[0];
        $updateData = [
            'name' => 'Updated Folder ' . time(),
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

        $result = $this->testHelper->put('folder_update', $updateData, [], $folder['id']);
        $success = $this->testHelper->printResult("Update Folder", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Folder updated successfully');
        }

        return $success;
    }

    /**
     * Test create nested folder
     */
    protected function testCreateNestedFolder() {
        $this->printHeader("Create Nested Folder Test");

        if (!$this->projectId || empty($this->testFolders)) {
            return $this->skip("Nested Folder - No project or parent folder available");
            
        }

        $parentFolder = $this->testFolders[0];
        $nestedData = [
            'name' => 'Nested Folder ' . time(),
            'description' => 'Child folder for testing',
            'parent_id' => $parentFolder['id'],
            'variables' => [
                'nested_var' => 'nested_value'
            ]
        ];

        $result = $this->testHelper->post('folder_create', $nestedData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Nested Folder", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $this->testFolders[] = [
                'id' => $result['data']['id'],
                'project_id' => $this->projectId,
                'parent_id' => $parentFolder['id']
            ];
        }

        return $success;
    }

    /**
     * Test delete folder
     */
    protected function testDeleteFolder() {
        $this->printHeader("Delete Folder Test");

        if (empty($this->testFolders)) {
            return $this->skip("Delete Folder - No test folders available");
            
        }

        // Use the last folder for deletion test
        $folderToDelete = array_pop($this->testFolders);
        $result = $this->testHelper->delete('folder_delete', [], $folderToDelete['id']);
        $success = $this->testHelper->printResult("Delete Folder", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Folder deleted successfully');
        }

        return $success;
    }

    /**
     * Test folder with invalid data
     */
    protected function testCreateFolderInvalid() {
        $this->printHeader("Create Folder Invalid Data Test");

        if (!$this->projectId) {
            return $this->skip("Create Folder Invalid - No project ID available");
            
        }

        $results = [];

        // Test with missing name
        $data1 = [
            'description' => 'Folder without name'
        ];
        $result1 = $this->testHelper->post('folder_create', $data1, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Folder Missing Name", $result1, 400);

        // Test with empty name
        $data2 = [
            'name' => '',
            'description' => 'Folder with empty name'
        ];
        $result2 = $this->testHelper->post('folder_create', $data2, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Folder Empty Name", $result2, 400);

        // Test with invalid parent_id
        $data3 = [
            'name' => 'Test Folder',
            'parent_id' => 'invalid_parent_id'
        ];
        $result3 = $this->testHelper->post('folder_create', $data3, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Folder Invalid Parent", $result3, 400);

        return !in_array(false, $results);
    }

    /**
     * Test folder without authentication
     */
    protected function testFolderUnauthorized() {
        $this->printHeader("Folder Without Authentication Test");

        if (!$this->projectId) {
            return $this->skip("Folder Unauthorized - No project ID available");
            
        }

        // Clear token for unauthorized test
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test create folder without auth
        $folderData = ['name' => 'Unauthorized Folder'];
        $result1 = $this->testHelper->post('folder_create', $folderData, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Folder Without Auth", $result1, 401);

        // Test list folders without auth
        $result2 = $this->testHelper->get('folders_list', [], $this->projectId);
        $results[] = $this->testHelper->printResult("List Folders Without Auth", $result2, 401);

        // Test get folder without auth
        if (!empty($this->testFolders)) {
            $result3 = $this->testHelper->get('folder_get', [], $this->testFolders[0]['id']);
            $results[] = $this->testHelper->printResult("Get Folder Without Auth", $result3, 401);
        }

        // Restore token for other tests
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    /**
     * Test folder headers inheritance
     */
    protected function testFolderHeaders() {
        $this->printHeader("Folder Headers Test");

        if (!$this->projectId) {
            return $this->skip("Folder Headers - No project ID available");
            
        }

        $folderData = [
            'name' => 'Headers Test Folder ' . time(),
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

        $result = $this->testHelper->post('folder_create', $folderData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Folder with Headers", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $folderId = $result['data']['id'];
            $this->testFolders[] = ['id' => $folderId, 'project_id' => $this->projectId];

            // Verify headers are stored correctly
            $getResult = $this->testHelper->get('folder_get', [], $folderId);
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
     * Test folder variables functionality
     */
    protected function testFolderVariables() {
        $this->printHeader("Folder Variables Test");

        if (!$this->projectId) {
            return $this->skip("Folder Variables - No project ID available");
            
        }

        $folderData = [
            'name' => 'Variables Test Folder ' . time(),
            'variables' => [
                'base_url' => 'https://api.example.com',
                'api_key' => 'secret_key_789',
                'timeout' => '30',
                'environment' => 'production'
            ]
        ];

        $result = $this->testHelper->post('folder_create', $folderData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Folder with Variables", $result, 201);

        if ($success && isset($result['data']['id'])) {
            $folderId = $result['data']['id'];
            $this->testFolders[] = ['id' => $folderId, 'project_id' => $this->projectId];

            // Verify variables are stored correctly
            $getResult = $this->testHelper->get('folder_get', [], $folderId);
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
     * Test folder permission (access other project's folder)
     */
    protected function testFolderPermission() {
        $this->printHeader("Folder Permission Test");

        if (empty($this->testFolders)) {
            return $this->skip("Folder Permission - No test folders available");
            
        }

        // Create a different user and try to access our folder
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

                // Try to access our folder (should fail)
                $folder = $this->testFolders[0];
                $result = $this->testHelper->get('folder_get', [], $folder['id']);
                $success = $this->testHelper->printResult("Access Other User Folder", $result, 403);

                if ($result['status'] === 403) {
                    echo "[INFO] Permission test passed - Cannot access other user's folder\n";
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
        // Cleanup: Delete all test folders
        foreach ($this->testFolders as $folder) {
            $this->testHelper->delete('folder_delete', [], $folder['id']);
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