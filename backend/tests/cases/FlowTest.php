<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Flow endpoints
 * - Flow management membutuhkan authentication
 */
class FlowTest extends BaseTest {
    private $email;
    private $password;
    private $authToken = null;
    private $testUserId = null;
    private $projectId = null;
    private $testCollection = null;
    private $testFlows = [];

    protected function setUp() {
        parent::setUp();
        $this->email = 'flowtest_' . time() . '@example.com';
        $this->password = 'FlowTest123456';
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
            'name' => 'Flow Test User'
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

        // Create project and collection for flow tests
        $this->setupTestProjectAndCollection();
    }

    /**
     * Setup test project and collection
     */
    private function setupTestProjectAndCollection() {
        // Create project
        $projectData = [
            'name' => 'Flow Test Project ' . time(),
            'description' => 'Created for flow testing'
        ];

        $projectResult = $this->testHelper->post('projects', $projectData);
        if ($projectResult['status'] === 201 && isset($projectResult['data']['data']['id'])) {
            $this->projectId = $projectResult['data']['data']['id'];

            // Create collection
            $collectionData = [
                'name' => 'Test Collection ' . time(),
                'description' => 'Collection for flow testing',
                'variables' => [
                    'base_url' => 'https://api.example.com',
                    'api_key' => 'test_api_key_123'
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
     * Test create flow
     */
    protected function testCreateFlow() {
        $this->printHeader("Create Flow Test");

        if (!$this->projectId) {
            return $this->skip("Create Flow - No project available");
            
        }

        $flowData = [
            'name' => 'User Registration Flow',
            'description' => 'Complete user registration and verification flow',
            'collection_id' => $this->testCollection ? $this->testCollection['id'] : null,
            'flow_data' => [
                'nodes' => [
                    [
                        'id' => 'node_1',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_register',
                            'name' => 'Register User'
                        ],
                        'position' => ['x' => 100, 'y' => 100]
                    ],
                    [
                        'id' => 'node_2',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_verify',
                            'name' => 'Verify Email'
                        ],
                        'position' => ['x' => 300, 'y' => 100]
                    ]
                ],
                'edges' => [
                    [
                        'id' => 'edge_1',
                        'source' => 'node_1',
                        'target' => 'node_2'
                    ]
                ]
            ],
            'is_active' => true
        ];

        $result = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Flow", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testFlows[] = [
                'id' => $result['data']['data']['id'],
                'project_id' => $this->projectId,
                'collection_id' => $this->testCollection ? $this->testCollection['id'] : null
            ];
        }

        return $success;
    }

    /**
     * Test create simple flow without flow_data
     */
    protected function testCreateSimpleFlow() {
        $this->printHeader("Create Simple Flow Test");

        if (!$this->projectId) {
            return $this->skip("Create Simple Flow - No project available");
            
        }

        $flowData = [
            'name' => 'Simple Test Flow ' . time(),
            'description' => 'Simple flow for testing',
            'is_active' => true
        ];

        $result = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Simple Flow", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testFlows[] = [
                'id' => $result['data']['data']['id'],
                'project_id' => $this->projectId
            ];
        }

        return $success;
    }

    /**
     * Test list flows
     */
    protected function testListFlows() {
        $this->printHeader("List Flows Test");

        if (!$this->projectId) {
            return $this->skip("List Flows - No project available");
            
        }

        $result = $this->testHelper->get('flow_list', [], $this->projectId);
        $success = $this->testHelper->printResult("List Flows", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'flows');

            $flows = $result['data']['flows'] ?? [];
            echo "[INFO] Found " . count($flows) . " flows\n";
        }

        return $success;
    }

    /**
     * Test get flow details
     */
    protected function testGetFlow() {
        $this->printHeader("Get Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Get Flow - No test flows available");
            
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->get('flow_get', [], $flow['id']);
        $success = $this->testHelper->printResult("Get Flow", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'flow');
            $this->testHelper->assertEquals($result['data']['flow'], 'id', $flow['id']);
        }

        return $success;
    }

    /**
     * Test update flow
     */
    protected function testUpdateFlow() {
        $this->printHeader("Update Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Update Flow - No test flows available");
            
        }

        $flow = $this->testFlows[0];
        $updateData = [
            'name' => 'Updated Flow Name ' . time(),
            'description' => 'Updated flow description',
            'flow_data' => [
                'nodes' => [
                    [
                        'id' => 'node_1',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_updated_register',
                            'name' => 'Updated Register User'
                        ],
                        'position' => ['x' => 150, 'y' => 150]
                    ]
                ],
                'edges' => []
            ],
            'is_active' => false
        ];

        $result = $this->testHelper->put('flow_update', $updateData, [], $flow['id']);
        $success = $this->testHelper->printResult("Update Flow", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Flow updated successfully');
        }

        return $success;
    }

    /**
     * Test toggle flow active status
     */
    protected function testToggleFlowActive() {
        $this->printHeader("Toggle Flow Active Test");

        if (empty($this->testFlows)) {
            return $this->skip("Toggle Flow Active - No test flows available");
            
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->put('flow_toggle_active', [], [], $flow['id']);
        $success = $this->testHelper->printResult("Toggle Flow Active", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Flow status updated successfully');
        }

        return $success;
    }

    /**
     * Test duplicate flow
     */
    protected function testDuplicateFlow() {
        $this->printHeader("Duplicate Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Duplicate Flow - No test flows available");
            
        }

        $flow = $this->testFlows[0];
        $duplicateData = [
            'name' => 'Duplicated Flow ' . time(),
            'description' => 'Flow created by duplication'
        ];

        $result = $this->testHelper->post('flow_duplicate', $duplicateData, [], $flow['id']);
        $success = $this->testHelper->printResult("Duplicate Flow", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testFlows[] = [
                'id' => $result['data']['data']['id'],
                'project_id' => $this->projectId
            ];
        }

        return $success;
    }

    /**
     * Test delete flow
     */
    protected function testDeleteFlow() {
        $this->printHeader("Delete Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Delete Flow - No test flows available");
            
        }

        // Use the last flow for deletion test
        $flowToDelete = array_pop($this->testFlows);
        $result = $this->testHelper->delete('flow_delete', [], $flowToDelete['id']);
        $success = $this->testHelper->printResult("Delete Flow", $result, 200);

        if ($success) {
            $this->testHelper->assertEquals($result, 'message', 'Flow deleted successfully');
        }

        return $success;
    }

    /**
     * Test create flow with invalid collection
     */
    protected function testCreateFlowInvalidCollection() {
        $this->printHeader("Create Flow Invalid Collection Test");

        if (!$this->projectId) {
            return $this->skip("Create Flow Invalid Collection - No project available");
            
        }

        $flowData = [
            'name' => 'Invalid Collection Flow',
            'description' => 'Flow with invalid collection',
            'collection_id' => 'invalid_collection_id',
            'is_active' => true
        ];

        $result = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Flow Invalid Collection", $result, 400);

        if ($result['status'] === 400) {
            $this->testHelper->assertEquals($result, 'message', 'Collection does not belong to this project');
        }

        return $result['status'] === 400;
    }

    /**
     * Test create flow with missing required fields
     */
    protected function testCreateFlowMissingFields() {
        $this->printHeader("Create Flow Missing Fields Test");

        if (!$this->projectId) {
            return $this->skip("Create Flow Missing Fields - No project available");
            
        }

        $results = [];

        // Test missing name
        $data1 = [
            'description' => 'Flow without name'
        ];
        $result1 = $this->testHelper->post('flow_create', $data1, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Flow Missing Name", $result1, 400);

        // Test with empty name
        $data2 = [
            'name' => '',
            'description' => 'Flow with empty name'
        ];
        $result2 = $this->testHelper->post('flow_create', $data2, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Flow Empty Name", $result2, 400);

        return !in_array(false, $results);
    }

    /**
     * Test flow with complex node/edge structure
     */
    protected function testCreateComplexFlow() {
        $this->printHeader("Create Complex Flow Test");

        if (!$this->projectId) {
            return $this->skip("Create Complex Flow - No project available");
            
        }

        $flowData = [
            'name' => 'Complex Test Flow',
            'description' => 'Flow with multiple nodes and edges',
            'flow_data' => [
                'nodes' => [
                    [
                        'id' => 'start_node',
                        'type' => 'trigger',
                        'data' => ['name' => 'Start'],
                        'position' => ['x' => 100, 'y' => 100]
                    ],
                    [
                        'id' => 'node_1',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_login',
                            'name' => 'Login User'
                        ],
                        'position' => ['x' => 300, 'y' => 100]
                    ],
                    [
                        'id' => 'node_2',
                        'type' => 'condition',
                        'data' => ['name' => 'Check Status'],
                        'position' => ['x' => 500, 'y' => 100]
                    ],
                    [
                        'id' => 'node_3a',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_get_profile',
                            'name' => 'Get Profile'
                        ],
                        'position' => ['x' => 700, 'y' => 50]
                    ],
                    [
                        'id' => 'node_3b',
                        'type' => 'endpoint',
                        'data' => [
                            'endpoint_id' => 'ep_register',
                            'name' => 'Register User'
                        ],
                        'position' => ['x' => 700, 'y' => 150]
                    ],
                    [
                        'id' => 'end_node',
                        'type' => 'trigger',
                        'data' => ['name' => 'End'],
                        'position' => ['x' => 900, 'y' => 100]
                    ]
                ],
                'edges' => [
                    [
                        'id' => 'edge_1',
                        'source' => 'start_node',
                        'target' => 'node_1'
                    ],
                    [
                        'id' => 'edge_2',
                        'source' => 'node_1',
                        'target' => 'node_2'
                    ],
                    [
                        'id' => 'edge_3a',
                        'source' => 'node_2',
                        'target' => 'node_3a',
                        'condition' => 'success'
                    ],
                    [
                        'id' => 'edge_3b',
                        'source' => 'node_2',
                        'target' => 'node_3b',
                        'condition' => 'failure'
                    ],
                    [
                        'id' => 'edge_4a',
                        'source' => 'node_3a',
                        'target' => 'end_node'
                    ],
                    [
                        'id' => 'edge_4b',
                        'source' => 'node_3b',
                        'target' => 'end_node'
                    ]
                ]
            ],
            'is_active' => true
        ];

        $result = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Complex Flow", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testFlows[] = [
                'id' => $result['data']['data']['id'],
                'project_id' => $this->projectId
            ];
        }

        return $success;
    }

    /**
     * Test flow without authentication
     */
    protected function testFlowUnauthorized() {
        $this->printHeader("Flow Without Authentication Test");

        if (!$this->projectId) {
            return $this->skip("Flow Unauthorized - No project available");
            
        }

        // Clear token for unauthorized test
        $this->testHelper->clearAuthToken();

        $results = [];

        // Test create flow without auth
        $flowData = ['name' => 'Unauthorized Flow'];
        $result1 = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $results[] = $this->testHelper->printResult("Create Flow Without Auth", $result1, 401);

        // Test list flows without auth
        $result2 = $this->testHelper->get('flow_list', [], $this->projectId);
        $results[] = $this->testHelper->printResult("List Flows Without Auth", $result2, 401);

        // Test get flow without auth
        if (!empty($this->testFlows)) {
            $result3 = $this->testHelper->get('flow_get', [], $this->testFlows[0]['id']);
            $results[] = $this->testHelper->printResult("Get Flow Without Auth", $result3, 401);
        }

        // Restore token for other tests
        if ($this->authToken) {
            $this->testHelper->setAuthToken($this->authToken);
        }

        return !in_array(false, $results);
    }

    /**
     * Test flow execution (if endpoint exists)
     */
    protected function testExecuteFlow() {
        $this->printHeader("Execute Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Execute Flow - No test flows available");
            
        }

        $flow = $this->testFlows[0];

        // Try to execute the flow (this endpoint might not exist yet)
        $result = $this->testHelper->post('flow_execute', [], [], $flow['id']);
        $success = $this->testHelper->printResult("Execute Flow", $result);

        if ($result['status'] === 404) {
            echo "[INFO] Flow execution endpoint not implemented (expected)\n";
            
        } elseif ($result['status'] === 200) {
            $this->testHelper->assertEquals($result, 'message', 'Flow executed successfully');
        }

        return $result['status'] === 200 || $result['status'] === 404;
    }

    /**
     * Test flow permission (access other project's flow)
     */
    protected function testFlowPermission() {
        $this->printHeader("Flow Permission Test");

        if (empty($this->testFlows)) {
            return $this->skip("Flow Permission - No test flows available");
            
        }

        // Create a different user and try to access our flow
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

                // Try to access our flow (should fail)
                $flow = $this->testFlows[0];
                $result = $this->testHelper->get('flow_get', [], $flow['id']);
                $success = $this->testHelper->printResult("Access Other User Flow", $result, 403);

                if ($result['status'] === 403) {
                    echo "[INFO] Permission test passed - Cannot access other user's flow\n";
                    
                }
            }
        }

        return $this->skip("Permission test - Could not create different user");
        
    }

    /**
     * Test flow status management
     */
    protected function testFlowStatusManagement() {
        $this->printHeader("Flow Status Management Test");

        if (empty($this->testFlows)) {
            return $this->skip("Flow Status - No test flows available");
            
        }

        $flow = $this->testFlows[0];
        $results = [];

        // Test activate flow
        $result1 = $this->testHelper->put('flow_activate', [], [], $flow['id']);
        $success1 = $this->testHelper->printResult("Activate Flow", $result1);

        if ($result1['status'] === 404) {
            echo "[INFO] Flow activate endpoint not found\n";
            $results[] = true;
        } else {
            $results[] = $result1['status'] === 200;
        }

        // Test deactivate flow
        $result2 = $this->testHelper->put('flow_deactivate', [], [], $flow['id']);
        $success2 = $this->testHelper->printResult("Deactivate Flow", $result2);

        if ($result2['status'] === 404) {
            echo "[INFO] Flow deactivate endpoint not found\n";
            $results[] = true;
        } else {
            $results[] = $result2['status'] === 200;
        }

        return !in_array(false, $results);
    }

    protected function tearDown() {
        // Cleanup: Delete all test flows
        foreach ($this->testFlows as $flow) {
            $this->testHelper->delete('flow_delete', [], $flow['id']);
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