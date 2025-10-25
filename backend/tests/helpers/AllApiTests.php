<?php

require_once __DIR__ . '/BaseTest.php';
require_once __DIR__ . '/../cases/FolderTest.php';
require_once __DIR__ . '/../cases/EndpointTest.php';
require_once __DIR__ . '/../cases/FlowTest.php';

/**
 * Composite test class for all API testing modules
 * - Folders, Endpoints, and Flows
 */
class AllApiTests extends BaseTest {
    private $apiTests = [];
    protected $moduleResults = [];

    protected function setUp() {
        parent::setUp();
        echo "\n=== Starting All API Tests (Folders, Endpoints, Flows) ===\n";

        // Initialize API test modules
        $this->apiTests = [
            'folders' => new FolderTest(),
            'endpoints' => new EndpointTest(),
            'flows' => new FlowTest()
        ];
    }

    /**
     * Test Folders API module
     */
    protected function testFoldersModule() {
        $this->printHeader("Folders API Module");

        if (!class_exists('FolderTest')) {
            echo "[SKIP] Folder tests not available\n";
            return true;
        }

        $folderTest = new FolderTest();
        $result = $folderTest->run();
        $this->moduleResults['folders'] = $folderTest->getResults();

        return $result;
    }

    /**
     * Test Endpoints API module
     */
    protected function testEndpointsModule() {
        $this->printHeader("Endpoints API Module");

        if (!class_exists('EndpointTest')) {
            echo "[SKIP] Endpoint tests not available\n";
            return true;
        }

        $endpointTest = new EndpointTest();
        $result = $endpointTest->run();
        $this->moduleResults['endpoints'] = $endpointTest->getResults();

        return $result;
    }

    /**
     * Test Flows API module
     */
    protected function testFlowsModule() {
        $this->printHeader("Flows API Module");

        if (!class_exists('FlowTest')) {
            echo "[SKIP] Flow tests not available\n";
            return true;
        }

        $flowTest = new FlowTest();
        $result = $flowTest->run();
        $this->moduleResults['flows'] = $flowTest->getResults();

        return $result;
    }

    /**
     * Test API integration scenarios
     */
    protected function testApiIntegration() {
        $this->printHeader("API Integration Test");

        // This test ensures that the API modules work together
        // For now, we'll just run basic connectivity tests
        $testHelper = new TestHelper();

        $healthResult = $testHelper->get('health');
        $healthSuccess = $healthResult['status'] === 200;

        $helpResult = $testHelper->get('help');
        $helpSuccess = $helpResult['status'] === 200;

        $integrationSuccess = $healthSuccess && $helpSuccess;

        echo sprintf(
            "[%s] API Integration - %s (%d/%d)\n",
            $integrationSuccess ? "PASS" : "FAIL",
            $integrationSuccess ? "SUCCESS" : "FAILED",
            $healthSuccess + $helpSuccess,
            2
        );

        return $integrationSuccess;
    }

    /**
     * Override tearDown to provide comprehensive summary
     */
    protected function tearDown() {
        $this->endTime = microtime(true);
        $duration = round(($this->endTime - $this->startTime) * 1000, 2);

        // Count total passed/failed from all modules
        $totalPassed = 0;
        $totalTests = 0;

        foreach ($this->moduleResults as $module => $result) {
            if (isset($result['passed']) && isset($result['total'])) {
                $totalPassed += $result['passed'];
                $totalTests += $result['total'];

                echo sprintf(
                    "Module [%s]: %d/%d passed (%.1f%%)\n",
                    ucfirst($module),
                    $result['passed'],
                    $result['total'],
                    $result['total'] > 0 ? round(($result['passed'] / $result['total']) * 100, 1) : 0
                );
            }
        }

        echo "\n=== AllApiTests Results ===\n";
        echo "Passed: $totalPassed/$totalTests tests\n";
        echo "Duration: {$duration}ms\n";
        echo "Status: " . ($totalPassed === $totalTests ? "SUCCESS" : "FAILED") . "\n";
        echo str_repeat("=", 50) . "\n";

        return $totalPassed === $totalTests;
    }

    /**
     * Override getResults to return composite results
     */
    public function getResults() {
        $totalPassed = 0;
        $totalTests = 0;

        foreach ($this->results as $result) {
            if (isset($result['passed']) && isset($result['total'])) {
                $totalPassed += $result['passed'];
                $totalTests += $result['total'];
            }
        }

        return [
            'test' => 'AllApiTests',
            'results' => $this->moduleResults,
            'passed' => $totalPassed,
            'total' => $totalTests,
            'duration' => isset($this->endTime) && isset($this->startTime)
                ? round(($this->endTime - $this->startTime) * 1000, 2)
                : 0
        ];
    }
}