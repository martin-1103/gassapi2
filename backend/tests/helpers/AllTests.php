<?php

require_once __DIR__ . '/BaseTest.php';

// Core Tests
require_once __DIR__ . '/../cases/AuthTest.php';
require_once __DIR__ . '/../cases/UserTest.php';
require_once __DIR__ . '/../cases/PasswordTest.php';
require_once __DIR__ . '/../cases/UserProfileTest.php';
require_once __DIR__ . '/../cases/UserManagementTest.php';

// API Tests
require_once __DIR__ . '/../cases/ProjectTest.php';
require_once __DIR__ . '/../cases/EnvironmentTest.php';
require_once __DIR__ . '/../cases/McpTest.php';
require_once __DIR__ . '/../cases/SystemTest.php';
require_once __DIR__ . '/../cases/CollectionTest.php';
require_once __DIR__ . '/../cases/EndpointTest.php';
require_once __DIR__ . '/../cases/FlowTest.php';
require_once __DIR__ . '/../cases/UserFlowTest.php';

// Include AllApiTests for composite testing
require_once __DIR__ . '/AllApiTests.php';

/**
 * Composite test class for all available tests
 * This class runs all test modules and provides a comprehensive summary
 */
class AllTests extends BaseTest {
    private $allTestClasses = [];
    private $moduleResults = [];

    protected function setUp() {
        parent::setUp();
        echo "\n=== Starting All Tests Suite ===\n";

        // Initialize all available test classes
        $this->allTestClasses = [
            'auth' => 'AuthTest',
            'user' => 'UserTest',
            'password' => 'PasswordTest',
            'profile' => 'UserProfileTest',
            'management' => 'UserManagementTest',
            'project' => 'ProjectTest',
            'environment' => 'EnvironmentTest',
            'mcp' => 'McpTest',
            'system' => 'SystemTest',
            'collection' => 'CollectionTest',
            'endpoint' => 'EndpointTest',
            'flows' => 'FlowTest',
            'flow' => 'UserFlowTest'
        ];
    }

    /**
     * Run all individual test modules
     */
    protected function runAllTestModules() {
        $this->printHeader("Running All Test Modules");

        $allPassed = true;
        $totalPassed = 0;
        $totalTests = 0;

        foreach ($this->allTestClasses as $moduleName => $className) {
            if (!class_exists($className)) {
                echo "[SKIP] $moduleName - Class $className not found\n";
                continue;
            }

            echo "\n--- Running $moduleName tests ---\n";

            try {
                $testInstance = new $className();
                $moduleResult = $testInstance->run();
                $moduleResults = $testInstance->getResults();

                $this->moduleResults[$moduleName] = $moduleResults;

                if (isset($moduleResults['passed']) && isset($moduleResults['total'])) {
                    $totalPassed += $moduleResults['passed'];
                    $totalTests += $moduleResults['total'];

                    echo sprintf(
                        "[%s] %s - %d/%d passed (%.1f%%)\n",
                        $moduleResult ? "PASS" : "FAIL",
                        ucfirst($moduleName),
                        $moduleResults['passed'],
                        $moduleResults['total'],
                        $moduleResults['total'] > 0 ? round(($moduleResults['passed'] / $moduleResults['total']) * 100, 1) : 0
                    );
                }

                $allPassed = $allPassed && $moduleResult;

                // Small delay between modules
                usleep(500000); // 0.5 seconds

            } catch (Exception $e) {
                echo "[FAIL] $moduleName - Exception: " . $e->getMessage() . "\n";
                $allPassed = false;
                $this->moduleResults[$moduleName] = [
                    'test' => $className,
                    'passed' => 0,
                    'total' => 1,
                    'duration' => 0,
                    'error' => $e->getMessage()
                ];
                $totalTests += 1;
            }
        }

        // Store totals for tearDown
        $this->results = [$allPassed, $totalPassed, $totalTests];

        return $allPassed;
    }

    /**
     * Test overall system health
     */
    protected function testSystemHealth() {
        $this->printHeader("Overall System Health Check");

        $testHelper = new TestHelper();

        // Test basic connectivity
        $healthResult = $testHelper->get('health');
        $healthSuccess = $healthResult['status'] === 200;

        // Test API documentation
        $helpResult = $testHelper->get('help');
        $helpSuccess = $helpResult['status'] === 200;

        $overallHealth = $healthSuccess && $helpSuccess;

        echo sprintf(
            "[%s] System Health - Health(%d) + Help(%d) = %s\n",
            $overallHealth ? "PASS" : "FAIL",
            $healthSuccess ? 1 : 0,
            $helpSuccess ? 1 : 0,
            $overallHealth ? "HEALTHY" : "UNHEALTHY"
        );

        return $overallHealth;
    }

    /**
     * Test overall functionality integration
     */
    protected function testSystemIntegration() {
        $this->printHeader("System Integration Test");

        // Basic integration test - ensure auth system works with API endpoints
        try {
            $testHelper = new TestHelper();

            // Test registration
            $userData = [
                'email' => 'integration_test_' . time() . '@example.com',
                'password' => 'IntegrationTest123456',
                'name' => 'Integration Test User'
            ];

            $registerResult = $testHelper->post('register', $userData);
            $registerSuccess = $registerResult['status'] === 201;

            // Test login
            $loginData = [
                'email' => $userData['email'],
                'password' => $userData['password']
            ];

            $loginResult = $testHelper->post('login', $loginData);
            $loginSuccess = $loginResult['status'] === 200;

            // Test authenticated request
            $authenticated = false;
            if ($loginSuccess && isset($loginResult['data']['access_token'])) {
                $testHelper->setAuthToken($loginResult['data']['access_token']);
                $profileResult = $testHelper->get('profile');
                $authenticated = $profileResult['status'] === 200;
            }

            $integrationSuccess = $registerSuccess && $loginSuccess && $authenticated;

            echo sprintf(
                "[%s] Integration - Register(%d) + Login(%d) + Auth(%d) = %s\n",
                $integrationSuccess ? "PASS" : "FAIL",
                $registerSuccess ? 1 : 0,
                $loginSuccess ? 1 : 0,
                $authenticated ? 1 : 0,
                $integrationSuccess ? "INTEGRATED" : "DISCONNECTED"
            );

            return $integrationSuccess;

        } catch (Exception $e) {
            echo "[FAIL] Integration test failed: " . $e->getMessage() . "\n";
            return false;
        }
    }

    /**
     * Override run method to execute all test modules first
     */
    public function run() {
        $this->setUp();

        // Run all test modules first
        $this->runAllTestModules();

        // Run system-level tests
        $systemHealthResult = $this->testSystemHealth();
        $this->results[] = $systemHealthResult;

        $integrationResult = $this->testSystemIntegration();
        $this->results[] = $integrationResult;

        return $this->tearDown();
    }

    /**
     * Override tearDown to provide comprehensive summary
     */
    protected function tearDown() {
        $this->endTime = microtime(true);
        $duration = round(($this->endTime - $this->startTime) * 1000, 2);

        // Extract results from the stored data
        $allPassed = true;
        $totalPassed = 0;
        $totalTests = 0;

        if (is_array($this->results) && count($this->results) >= 3 && is_bool($this->results[0])) {
            $allPassed = $this->results[0];
            $totalPassed = $this->results[1] ?? 0;
            $totalTests = $this->results[2] ?? 0;

            // Add system test results
            $totalTests += 2; // health + integration
            if ($this->results[1] ?? false) $totalPassed += 1;
            if ($this->results[2] ?? false) $totalPassed += 1;
        }

        echo "\n=== All Tests Comprehensive Summary ===\n";
        echo "Total Modules: " . count($this->moduleResults) . "\n";

        foreach ($this->moduleResults as $moduleName => $result) {
            if (isset($result['passed']) && isset($result['total'])) {
                echo sprintf(
                    "  [%s] %s: %d/%d passed (%.1f%%) - %dms\n",
                    ($result['passed'] === $result['total']) ? "PASS" : "FAIL",
                    ucfirst($moduleName),
                    $result['passed'],
                    $result['total'],
                    $result['total'] > 0 ? round(($result['passed'] / $result['total']) * 100, 1) : 0,
                    $result['duration'] ?? 0
                );
            }
        }

        echo sprintf(
            "System Tests: Health + Integration = %s\n",
            ($this->results[1] ?? false) && ($this->results[2] ?? false) ? "PASS" : "FAIL"
        );

        echo "\n=== Final Results ===\n";
        echo "Passed: $totalPassed/$totalTests tests\n";
        echo "Duration: {$duration}ms\n";
        echo "Status: " . ($allPassed ? "SUCCESS" : "FAILED") . "\n";
        echo str_repeat("=", 60) . "\n";

        return $allPassed;
    }

    /**
     * Override getResults to return comprehensive results
     */
    public function getResults() {
        $totalPassed = 0;
        $totalTests = 0;

        foreach ($this->moduleResults as $result) {
            if (isset($result['passed']) && isset($result['total'])) {
                $totalPassed += $result['passed'];
                $totalTests += $result['total'];
            }
        }

        // Add system tests
        $totalTests += 2;
        if ($this->results[1] ?? false) $totalPassed += 1;
        if ($this->results[2] ?? false) $totalPassed += 1;

        return [
            'test' => 'AllTests',
            'results' => $this->moduleResults,
            'passed' => $totalPassed,
            'total' => $totalTests,
            'duration' => isset($this->endTime) && isset($this->startTime)
                ? round(($this->endTime - $this->startTime) * 1000, 2)
                : 0
        ];
    }
}