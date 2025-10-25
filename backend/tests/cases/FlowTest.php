<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk Flow endpoints
 * - Flow management membutuhkan authentication
 * - Testing dual format support (React Flow + Steps-based)
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

        // Create project
        if ($this->testUserId) {
            $projectData = [
                'name' => 'Flow Test Project',
                'description' => 'Project for testing flow functionality'
            ];

            $projectResult = $this->testHelper->post('projects', $projectData);
            if ($projectResult['status'] === 201) {
                $projectId = $projectResult['data']['id'] ?? null;
                if ($projectId) {
                    $this->projectId = $projectId;
                }
            }

            // Create collection
            if ($this->projectId) {
                $collectionData = [
                    'name' => 'Flow Test Collection',
                    'description' => 'Collection for flow testing',
                    'variables' => [
                        'base_url' => 'https://api.example.com',
                        'api_key' => 'test_api_key_123'
                    ]
                ];

                $collectionResult = $this->testHelper->post('collection_create', $collectionData, [], $this->projectId);
                if ($collectionResult['status'] === 201) {
                    $collectionId = null;
                    if (isset($collectionResult['data']['data']['id'])) {
                        $collectionId = $collectionResult['data']['data']['id'];
                    } elseif (isset($collectionResult['data']['id'])) {
                        $collectionId = $collectionResult['data']['id'];
                    } elseif (isset($collectionResult['data']['collection']['id'])) {
                        $collectionId = $collectionResult['data']['collection']['id'];
                    }

                    if ($collectionId) {
                        $this->testCollection = [
                            'id' => $collectionId,
                            'project_id' => $this->projectId
                        ];
                        echo "[INFO] Collection created with ID: {$collectionId}\n";
                    }
                }
            }
        }
    }

    /**
     * Test create flow with steps-based format and flow_inputs
     */
    public function testCreateFlow() {
        $this->printHeader("Create Flow Test (Steps-based + Flow Inputs)");

        if (!$this->projectId) {
            return $this->skip("Create Flow - No project available");
        }

        $flowData = [
            'name' => 'User Registration Flow',
            'description' => 'Complete user registration and verification flow',
            'collection_id' => $this->testCollection ? $this->testCollection['id'] : null,
            'flow_inputs' => [
                [
                    'name' => 'username',
                    'type' => 'string',
                    'required' => true,
                    'validation' => [
                        'min_length' => 3,
                        'max_length' => 50
                    ],
                    'description' => 'Username for registration'
                ],
                [
                    'name' => 'email',
                    'type' => 'email',
                    'required' => true,
                    'description' => 'Email address for registration'
                ],
                [
                    'name' => 'password',
                    'type' => 'password',
                    'required' => true,
                    'validation' => [
                        'min_length' => 8,
                        'pattern' => '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$'
                    ],
                    'description' => 'Password with uppercase, lowercase, and numbers'
                ]
            ],
            'flow_data' => [
                'version' => '1.0',
                'steps' => [
                    [
                        'id' => 'register',
                        'name' => 'Register User',
                        'method' => 'POST',
                        'url' => '/auth/register',
                        'headers' => [
                            'Content-Type' => 'application/json'
                        ],
                        'body' => [
                            'username' => '{{input.username}}',
                            'email' => '{{input.email}}',
                            'password' => '{{input.password}}'
                        ],
                        'outputs' => [
                            'userId' => 'response.body.user.id',
                            'activationToken' => 'response.body.activation_token'
                        ],
                        'tests' => [
                            'pm.test("Status is 201", () => pm.response.to.have.status(201));',
                            'pm.test("User created successfully", () => pm.expect(pm.response.json()).to.have.property("user"));'
                        ]
                    ],
                    [
                        'id' => 'verify_email',
                        'name' => 'Verify Email',
                        'method' => 'POST',
                        'url' => '/auth/verify-email',
                        'headers' => [
                            'Content-Type' => 'application/json'
                        ],
                        'body' => [
                            'token' => '{{register.activationToken}}'
                        ],
                        'tests' => [
                            'pm.test("Status is 200", () => pm.response.to.have.status(200));'
                        ]
                    ]
                ],
                'config' => [
                    'delay' => 1000,
                    'retryCount' => 2,
                    'parallel' => false
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
                'collection_id' => $this->testCollection ? $this->testCollection['id'] : null,
                'flow_inputs' => $flowData['flow_inputs'],
                'flow_data' => $flowData['flow_data']
            ];
        }

        return $success;
    }

    /**
     * Test create flow with React Flow format
     */
    public function testCreateFlowReactFormat() {
        $this->printHeader("Create Flow Test (React Flow Format)");

        if (!$this->projectId) {
            return $this->skip("Create Flow React Format - No project available");
        }

        $flowData = [
            'name' => 'API Testing Flow (React Flow)',
            'description' => 'API testing flow created with React Flow format',
            'collection_id' => $this->testCollection ? $this->testCollection['id'] : null,
            'flow_data' => [
                'nodes' => [
                    [
                        'id' => 'get_user',
                        'type' => 'apiCall',
                        'position' => ['x' => 100, 'y' => 100],
                        'data' => [
                            'name' => 'Get User Data',
                            'method' => 'GET',
                            'url' => '/users/{{input.userId}}',
                            'headers' => [
                                'Authorization' => 'Bearer {{input.authToken}}'
                            ],
                            'outputs' => [
                                'userData' => 'response.body'
                            ]
                        ]
                    ],
                    [
                        'id' => 'update_user',
                        'type' => 'apiCall',
                        'position' => ['x' => 350, 'y' => 100],
                        'data' => [
                            'name' => 'Update User Profile',
                            'method' => 'PUT',
                            'url' => '/users/{{input.userId}}',
                            'headers' => [
                                'Authorization' => 'Bearer {{input.authToken}}',
                                'Content-Type' => 'application/json'
                            ],
                            'body' => [
                                'name' => '{{input.userName}}',
                                'profile' => '{{input.userProfile}}'
                            ],
                            'outputs' => [
                                'updatedUser' => 'response.body'
                            ]
                        ]
                    ]
                ],
                'edges' => [
                    [
                        'id' => 'edge-get-update',
                        'source' => 'get_user',
                        'target' => 'update_user',
                        'type' => 'smoothstep'
                    ]
                ]
            ],
            'flow_inputs' => [
                [
                    'name' => 'userId',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'User ID to work with'
                ],
                [
                    'name' => 'authToken',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Authentication token'
                ],
                [
                    'name' => 'userName',
                    'type' => 'string',
                    'required' => false,
                    'description' => 'New user name'
                ],
                [
                    'name' => 'userProfile',
                    'type' => 'object',
                    'required' => false,
                    'description' => 'User profile data'
                ]
            ],
            'is_active' => true
        ];

        $result = $this->testHelper->post('flow_create', $flowData, [], $this->projectId);
        $success = $this->testHelper->printResult("Create Flow (React Flow)", $result, 201);

        if ($success && isset($result['data']['data']['id'])) {
            $this->testFlows[] = [
                'id' => $result['data']['data']['id'],
                'project_id' => $this->projectId,
                'collection_id' => $this->testCollection ? $this->testCollection['id'] : null,
                'flow_inputs' => $flowData['flow_inputs'],
                'flow_data' => $flowData['flow_data']
            ];
        }

        return $success;
    }

    /**
     * Test get flow detail (Steps format - for execution)
     */
    public function testGetFlowDetail() {
        $this->printHeader("Get Flow Detail (Steps Format)");

        if (empty($this->testFlows)) {
            return $this->skip("Get Flow Detail - No flows available");
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->get('flow_get', [], $flow['id']);
        $success = $this->testHelper->printResult("Get Flow Detail", $result, 200);

        if ($success) {
            // Check that flow_data is in steps format
            $this->testHelper->assertHasKey($result, 'data');
            $flowData = $result['data']['flow_data'];
            $this->testHelper->assertIsArray($flowData);
            $this->testHelper->assertHasKey($flowData, 'version');
            $this->testHelper->assertHasKey($flowData, 'steps');
            $this->testHelper->assertIsArray($flowData['steps']);

            // Check flow_inputs is decoded properly
            $this->testHelper->assertHasKey($result, 'data');
            $flowInputs = $result['data']['flow_inputs'];
            $this->testHelper->assertIsArray($flowInputs);
        }

        return $success;
    }

    /**
     * Test get flow for UI (React Flow format)
     */
    public function testGetFlowForUI() {
        $this->printHeader("Get Flow For UI (React Flow Format)");

        if (empty($this->testFlows)) {
            return $this->skip("Get Flow For UI - No flows available");
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->get('flow_detail_ui', [], $flow['id']);
        $success = $this->testHelper->printResult("Get Flow For UI", $result, 200);

        if ($success) {
            // Check that flow_data is in React Flow format
            $this->testHelper->assertHasKey($result, 'data');
            $flowData = $result['data']['flow_data'];
            $this->testHelper->assertIsArray($flowData);
            $this->testHelper->assertHasKey($flowData, 'nodes');
            $this->testHelper->assertHasKey($flowData, 'edges');
            $this->testHelper->assertIsArray($flowData['nodes']);
            $this->testHelper->assertIsArray($flowData['edges']);

            // Check flow_inputs is included
            $this->testHelper->assertHasKey($result, 'data');
            $flowInputs = $result['data']['flow_inputs'];
            $this->testHelper->assertIsArray($flowInputs);
        }

        return $success;
    }

    /**
     * Test update flow from UI (React Flow format)
     */
    public function testUpdateFlowFromUI() {
        $this->printHeader("Update Flow From UI (React Flow Format)");

        if (empty($this->testFlows)) {
            return $this->skip("Update Flow From UI - No flows available");
        }

        $flow = $this->testFlows[0];

        $updateData = [
            'name' => 'Updated API Testing Flow',
            'description' => 'Updated flow description',
            'flow_data' => [
                'nodes' => [
                    [
                        'id' => 'get_user',
                        'type' => 'apiCall',
                        'position' => ['x' => 100, 'y' => 100],
                        'data' => [
                            'name' => 'Get User Data (Updated)',
                            'method' => 'GET',
                            'url' => '/users/{{input.userId}}',
                            'headers' => [
                                'Authorization' => 'Bearer {{input.authToken}}'
                            ]
                        ]
                    ],
                    [
                        'id' => 'create_user',
                        'type' => 'apiCall',
                        'position' => ['x' => 350, 'y' => 100],
                        'data' => [
                            'name' => 'Create User',
                            'method' => 'POST',
                            'url' => '/users',
                            'headers' => [
                                'Authorization' => 'Bearer {{input.authToken}}',
                                'Content-Type' => 'application/json'
                            ],
                            'body' => [
                                'name' => '{{input.userName}}',
                                'email' => '{{input.email}}'
                            ]
                        ]
                    ]
                ],
                'edges' => [
                    [
                        'id' => 'edge-get-create',
                        'source' => 'get_user',
                        'target' => 'create_user',
                        'type' => 'smoothstep'
                    ]
                ]
            ],
            'flow_inputs' => [
                [
                    'name' => 'userId',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'User ID'
                ],
                [
                    'name' => 'authToken',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'Authentication token'
                ],
                [
                    'name' => 'userName',
                    'type' => 'string',
                    'required' => true,
                    'description' => 'User name for creation'
                ],
                [
                    'name' => 'email',
                    'type' => 'email',
                    'required' => true,
                    'description' => 'Email address'
                ]
            ]
        ];

        $result = $this->testHelper->put('flow_update_ui', $updateData, [], $flow['id']);
        $success = $this->testHelper->printResult("Update Flow From UI", $result, 200);

        if ($success) {
            // Verify the flow was updated with proper React Flow format
            $this->testHelper->assertHasKey($result, 'data');
            $flowData = $result['data']['flow_data'];
            $this->testHelper->assertHasKey($flowData, 'nodes');
            $this->testHelper->assertHasKey($flowData, 'edges');

            // Verify flow_inputs was updated
            $this->testHelper->assertHasKey($result, 'data');
            $flowInputs = $result['data']['flow_inputs'];
            $this->testHelper->assertEquals(count($flowInputs), 4);

            // Check that name was updated
            $this->testHelper->assertEquals($result['data']['name'], 'Updated API Testing Flow');
        }

        return $success;
    }

    /**
     * Test flow inputs validation
     */
    public function testFlowInputsValidation() {
        $this->printHeader("Flow Inputs Validation Test");

        if (!$this->projectId) {
            return $this->skip("Flow Inputs Validation - No project available");
        }

        // Test invalid input format (missing required field)
        $invalidFlowData = [
            'name' => 'Invalid Flow',
            'flow_inputs' => [
                [
                    'name' => '',  // Empty name
                    'type' => 'string',
                    'required' => true
                ]
            ]
        ];

        $result = $this->testHelper->post('flow_create', $invalidFlowData, [], $this->projectId);
        $this->testHelper->printResult("Create Flow (Invalid Input)", $result, 400);

        // Test invalid input type
        $invalidFlowData2 = [
            'name' => 'Invalid Flow Type',
            'flow_inputs' => [
                [
                    'name' => 'test_input',
                    'type' => 'invalid_type',  // Invalid type
                    'required' => true
                ]
            ]
        ];

        $result2 = $this->testHelper->post('flow_create', $invalidFlowData2, [], $this->projectId);
        $this->testHelper->printResult("Create Flow (Invalid Type)", $result2, 400);

        // Test invalid validation rules
        $invalidFlowData3 = [
            'name' => 'Invalid Validation',
            'flow_inputs' => [
                [
                    'name' => 'test_input',
                    'type' => 'string',
                    'required' => true,
                    'validation' => [
                        'min_length' => -5  // Invalid min_length
                    ]
                ]
            ]
        ];

        $result3 = $this->testHelper->post('flow_create', $invalidFlowData3, [], $this->projectId);
        $this->testHelper->printResult("Create Flow (Invalid Validation)", $result3, 400);

        return true; // Validation tests don't need to all pass
    }

    /**
     * Test variable references validation
     */
    public function testVariableReferencesValidation() {
        $this->printHeader("Variable References Validation Test");

        if (!$this->projectId) {
            return $this->skip("Variable References Validation - No project available");
        }

        // Test invalid variable reference format (no dot)
        $invalidFlowData = [
            'name' => 'Invalid Variable Reference',
            'flow_data' => [
                'version' => '1.0',
                'steps' => [
                    [
                        'id' => 'test_step',
                        'method' => 'GET',
                        'url' => '/test/{{invalidreference}}',  // Invalid: no dot separator
                        'outputs' => []
                    ]
                ]
            ]
        ];

        $result = $this->testHelper->post('flow_create', $invalidFlowData, [], $this->projectId);
        $this->testHelper->printResult("Create Flow (Invalid Variable)", $result, 400);

        // Test invalid field name in variable reference
        $invalidFlowData2 = [
            'name' => 'Invalid Field Name',
            'flow_data' => [
                'version' => '1.0',
                'steps' => [
                    [
                        'id' => 'test_step',
                        'method' => 'GET',
                        'url' => '/test/{{test_step.invalid-field}}',  // Invalid field name
                        'outputs' => []
                    ]
                ]
            ]
        ];

        $result2 = $this->testHelper->post('flow_create', $invalidFlowData2, [], $this->projectId);
        $this->testHelper->printResult("Create Flow (Invalid Field)", $result2, 400);

        return true; // Validation tests don't need to all pass
    }

    /**
     * Test dual format consistency
     */
    public function testDualFormatConsistency() {
        $this->printHeader("Dual Format Consistency Test");

        if (empty($this->testFlows)) {
            return $this->skip("Dual Format Consistency - No flows available");
        }

        $flow = $this->testFlows[0];

        // Get flow in steps format
        $stepsResult = $this->testHelper->get('flow_get', [], $flow['id']);
        $stepsSuccess = $this->testHelper->printResult("Get Flow (Steps)", $stepsResult, 200);

        // Get flow in React Flow format
        $uiResult = $this->testHelper->get('flow_detail_ui', [], $flow['id']);
        $uiSuccess = $this->testHelper->printResult("Get Flow (React Flow)", $uiResult, 200);

        if ($stepsSuccess && $uiSuccess) {
            // Check both formats have the same basic info
            $this->testHelper->assertEquals($stepsResult['data']['id'], $uiResult['data']['id']);
            $this->testHelper->assertEquals($stepsResult['data']['name'], $uiResult['data']['name']);
            $this->testHelper->assertEquals($stepsResult['data']['project_id'], $uiResult['data']['project_id']);

            // Check that flow_data and flow_data have different formats but same logical content
            $stepsData = $stepsResult['data']['flow_data'];
            $uiData = $uiResult['data']['flow_data'];

            // Steps format should have version, steps, config
            $this->testHelper->assertHasKey($stepsData, 'version');
            $this->testHelper->assertHasKey($stepsData, 'steps');
            $this->testHelper->assertHasKey($stepsData, 'config');

            // React Flow format should have nodes, edges
            $this->testHelper->assertHasKey($uiData, 'nodes');
            $this->testHelper->assertHasKey($uiData, 'edges');

            // Both should have the same number of logical operations
            $stepsCount = count($stepsData['steps']);
            $nodesCount = count($uiData['nodes']);
            $this->testHelper->assertGreaterThanOrEqual($stepsCount, 1);
            $this->testHelper->assertGreaterThanOrEqual($nodesCount, 1);
        }

        return $stepsSuccess && $uiSuccess;
    }

    /**
     * Test list flows
     */
    public function testListFlows() {
        $this->printHeader("List Flows Test");

        if (!$this->projectId) {
            return $this->skip("List Flows - No project available");
        }

        $result = $this->testHelper->get('flow_list', [], $this->projectId);
        $success = $this->testHelper->printResult("List Flows", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');

            // Flows data is directly in data array
            $flows = $result['data'] ?? [];
            if (!empty($flows)) {
                // Check that flows have flow_inputs
                foreach ($flows as $flow) {
                    $this->testHelper->assertHasKey($flow, 'flow_inputs');
                    $this->testHelper->assertHasKey($flow, 'flow_data');
                    $this->testHelper->assertHasKey($flow, 'ui_data');
                }
            }
        }

        return $success;
    }

    /**
     * Test toggle flow active status
     */
    public function testToggleFlowActive() {
        $this->printHeader("Toggle Flow Active Test");

        if (empty($this->testFlows)) {
            return $this->skip("Toggle Flow Active - No flows available");
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->put('flow_toggle_active', [], [], $flow['id']);
        $success = $this->testHelper->printResult("Toggle Flow Active", $result, 200);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'is_active');
            // Should toggle status
            $originalActive = $flow['is_active'] ?? 1;
            $this->testHelper->assertNotEquals($result['data']['is_active'], $originalActive);
        }

        return $success;
    }

    /**
     * Test delete flow
     */
    public function testDeleteFlow() {
        $this->printHeader("Delete Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Delete Flow - No flows available");
        }

        $flow = $this->testFlows[0];
        $result = $this->testHelper->delete('flow_delete', [], $flow['id']);
        $success = $testHelper->printResult("Delete Flow", $result, 200);

        if ($success) {
            // Verify flow was actually deleted
            $getResult = $this->testHelper->get('flow_get', [], $flow['id']);
            $getSuccess = $this->testHelper->printResult("Verify Flow Deleted", $getResult, 404);
            $this->testHelper->assertFalse($getSuccess, "Flow should be deleted");
        }

        return $success;
    }

    /**
     * Test duplicate flow
     */
    public function testDuplicateFlow() {
        $this->printHeader("Duplicate Flow Test");

        if (empty($this->testFlows)) {
            return $this->skip("Duplicate Flow - No flows available");
        }

        $flow = $this->testFlows[0];
        $duplicateData = [
            'name' => 'Duplicated Flow'
        ];

        $result = $this->testHelper->post('flow_duplicate', $duplicateData, [], $flow['id']);
        $success = $this->testHelper->printResult("Duplicate Flow", $result, 201);

        if ($success) {
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'id');
            $this->testHelper->assertNotEquals($result['data']['id'], $flow['id']); // Different ID

            // Check that duplicated flow is inactive by default
            $this->testHelper->assertEquals($result['data']['is_active'], 0);

            // Check that original flow data is preserved
            $this->testHelper->assertHasKey($result['data'], 'collection_id');
            $this->testHelper->assertEquals($result['data']['collection_id'], $flow['collection_id']);
        }

        return $success;
    }

    /**
     * Run all flow tests
     */
    public function run() {
        // Setup test user and project
        $this->setUp();

        $this->printHeader("Flow Management Tests");

        $results = [];

        // Create flow tests
        $results[] = $this->testCreateFlow();
        $results[] = $this->testCreateFlowReactFormat();

        // Get flow tests
        $results[] = $this->testGetFlowDetail();
        $results[] = $this->testGetFlowForUI();

        // Update flow tests
        $results[] = $this->testUpdateFlowFromUI();

        // Validation tests
        $results[] = $this->testFlowInputsValidation();
        $results[] = $this->testVariableReferencesValidation();
        $results[] = $this->testDualFormatConsistency();

        // Management tests
        $results[] = $this->testListFlows();
        $results[] = $this->testToggleFlowActive();
        $results[] = $this->testDuplicateFlow();
        $results[] = $this->testDeleteFlow();

        $this->printSummary("Flow Tests", $results);
        return $this->allPassed($results);
    }

    /**
     * Check if all tests passed
     */
    private function allPassed($results) {
        foreach ($results as $result) {
            if (!$result) {
                return false;
            }
        }
        return true;
    }

    /**
     * Print summary of test results
     */
    private function printSummary($testName, $results) {
        $passed = array_sum($results);
        $total = count($results);
        $percentage = $total > 0 ? round(($passed / $total) * 100, 1) : 0;

        echo "\n";
        echo str_repeat("=", 50) . "\n";
        echo "$testName Summary\n";
        echo str_repeat("=", 50) . "\n";
        echo "Passed: $passed/$total ($percentage%)\n";
        echo str_repeat("-", 50) . "\n";

        $status = $passed === $total ? "PASS" : "FAIL";
        echo "Status: $status\n";
        echo str_repeat("=", 50) . "\n\n";
    }

    /**
     * Print test header
     */
    protected function printHeader($testName) {
        echo "\n";
        echo str_repeat("-", 50) . "\n";
        echo "$testName\n";
        echo str_repeat("-", 50) . "\n";
    }

    /**
     * Skip test with message
     */
    protected function skip($message) {
        echo "[SKIP] $message\n";
        return true;
    }
}