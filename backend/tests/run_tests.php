<?php

/**
 * Test Runner untuk Backend PHP API
 *
 * Usage:
 * php run_tests.php                    # Run all tests
 * php run_tests.php auth               # Run auth tests only
 * php run_tests.php user               # Run user tests only
 * php run_tests.php --list             # List available tests
 * php run_tests.php --debug            # Run with debug output
 */

/**
 * Test Cache Manager - Simple caching for passed tests
 */
class TestCacheManager {
    private $config;
    private $cacheFile;
    private $cache = [];
    
    public function __construct() {
        $configFile = __DIR__ . '/config/test_runner_config.php';
        $this->config = file_exists($configFile) ? require $configFile : ['skip_passed_tests' => false];
        
        $cacheDir = $this->config['cache_dir'] ?? __DIR__ . '/.cache';
        if (!is_dir($cacheDir)) {
            @mkdir($cacheDir, 0755, true);
        }
        
        $this->cacheFile = $cacheDir . '/test_results.json';
        $this->loadCache();
    }
    
    private function loadCache() {
        if (file_exists($this->cacheFile)) {
            $data = json_decode(file_get_contents($this->cacheFile), true);
            $this->cache = $data['results'] ?? [];
        }
    }
    
    private function saveCache() {
        $data = [
            'last_run' => date('Y-m-d H:i:s'),
            'results' => $this->cache
        ];
        file_put_contents($this->cacheFile, json_encode($data, JSON_PRETTY_PRINT));
    }
    
    public function shouldSkip($testName) {
        if (!($this->config['skip_passed_tests'] ?? false)) {
            return false;
        }
        
        if (!isset($this->cache[$testName])) {
            return false;
        }
        
        return $this->cache[$testName]['status'] === 'PASS';
    }
    
    public function saveResult($testName, $passed, $total) {
        $status = ($passed === $total) ? 'PASS' : 'FAIL';
        
        $this->cache[$testName] = [
            'status' => $status,
            'passed' => $passed,
            'total' => $total,
            'last_run' => date('Y-m-d H:i:s')
        ];
        
        $this->saveCache();
    }
    
    public function getCachedResult($testName) {
        return $this->cache[$testName] ?? null;
    }
}

// Core Authentication Tests
require_once __DIR__ . '/cases/AuthTest.php';

// Legacy UserTest.php (for backward compatibility)
if (file_exists(__DIR__ . '/cases/UserTest.php')) {
    require_once __DIR__ . '/cases/UserTest.php';
}

// New Modular Test Files
$testFiles = [
    'PasswordTest.php',
    'UserProfileTest.php',
    'UserManagementTest.php',
    'ProjectTest.php',
    'EnvironmentTest.php',
    'McpTest.php',
    'SystemTest.php',
    'UserFlowTest.php',
    'CollectionTest.php',
    'EndpointTest.php',
    'FlowTest.php'
];

foreach ($testFiles as $file) {
    if (file_exists(__DIR__ . '/cases/' . $file)) {
        require_once __DIR__ . '/cases/' . $file;
    }
}

// Load composite test classes
require_once __DIR__ . '/helpers/AllApiTests.php';
require_once __DIR__ . '/helpers/AllTests.php';

class TestRunner {
    private $args = [];
    private $debug = false;
    private $testClasses = [];
    private $results = [];
    private $cacheManager;

    public function __construct($args = []) {
        $this->args = array_slice($args, 1); // Skip script name
        $this->parseArguments();
        $this->registerTestClasses();
        $this->cacheManager = new TestCacheManager();
    }

    /**
     * Parse command line arguments
     */
    private function parseArguments() {
        foreach ($this->args as $arg) {
            if ($arg === '--debug' || $arg === '-d') {
                $this->debug = true;
            }
        }
    }

    /**
     * Register available test classes
     */
    private function registerTestClasses() {
        $this->testClasses = [
            // Core authentication tests
            'auth' => 'AuthTest',

            // Legacy user tests (for backward compatibility)
            'user' => class_exists('UserTest') ? 'UserTest' : 'UserProfileTest',

            // New modular tests
            'password' => class_exists('PasswordTest') ? 'PasswordTest' : 'UserTest',
            'profile' => class_exists('UserProfileTest') ? 'UserProfileTest' : 'UserTest',
            'management' => class_exists('UserManagementTest') ? 'UserManagementTest' : 'UserTest',
            'project' => class_exists('ProjectTest') ? 'ProjectTest' : 'UserTest',
            'environment' => class_exists('EnvironmentTest') ? 'EnvironmentTest' : 'UserTest',
            'mcp' => class_exists('McpTest') ? 'McpTest' : 'UserTest',
            'system' => class_exists('SystemTest') ? 'SystemTest' : 'AuthTest',
            'flow' => class_exists('UserFlowTest') ? 'UserFlowTest' : 'UserTest',

            // New API testing modules
            'collection' => class_exists('CollectionTest') ? 'CollectionTest' : 'UserTest',
            'endpoint' => class_exists('EndpointTest') ? 'EndpointTest' : 'UserTest',
            'flows' => class_exists('FlowTest') ? 'FlowTest' : 'UserTest',

            // Convenience aliases
            'users' => class_exists('UserManagementTest') ? 'UserManagementTest' : 'UserTest',
            'projects' => class_exists('ProjectTest') ? 'ProjectTest' : 'UserTest',
            'environments' => class_exists('EnvironmentTest') ? 'EnvironmentTest' : 'UserTest',
            'collections' => class_exists('CollectionTest') ? 'CollectionTest' : 'UserTest',
            'endpoints' => class_exists('EndpointTest') ? 'EndpointTest' : 'UserTest',
            'integration' => class_exists('UserFlowTest') ? 'UserFlowTest' : 'UserTest',

            // API testing combined
            'api' => 'AllApiTests',

            // All tests
            'all' => 'AllTests'
        ];
    }

    /**
     * Show help
     */
    private function showHelp() {
        echo "\n=== Backend PHP API Test Runner ===\n\n";
        echo "Usage: php run_tests.php [options] [test_name]\n\n";
        echo "Options:\n";
        echo "  --debug, -d     Enable debug output\n";
        echo "  --list, -l      List available tests\n";
        echo "  --help, -h      Show this help\n\n";
        echo "Test Categories:\n";
        echo "  auth            Run authentication tests (register, login, logout)\n";
        echo "  password        Run password management tests (change, reset)\n";
        echo "  profile         Run user profile tests (get, update profile)\n";
        echo "  management      Run user management tests (admin functions)\n";
        echo "  project         Run project management tests (CRUD projects)\n";
        echo "  environment     Run environment tests (CRUD environments)\n";
        echo "  collection      Run collection tests (API collection management)\n";
        echo "  endpoint        Run endpoint tests (API endpoint management)\n";
        echo "  flows           Run flow tests (automation flow management)\n";
        echo "  mcp             Run MCP integration tests (token validation)\n";
        echo "  system          Run system tests (health check, API help)\n";
        echo "  flow            Run end-to-end user flow tests (integration)\n";
        echo "  user            Run legacy user tests (backward compatibility)\n";
        echo "  api             Run all API testing modules (collections, endpoints, flows)\n";
        echo "  all             Run all tests (default)\n\n";
        echo "Aliases:\n";
        echo "  users           Same as 'management' (user CRUD)\n";
        echo "  projects        Same as 'project'\n";
        echo "  environments    Same as 'environment'\n";
        echo "  collections     Same as 'collection'\n";
        echo "  endpoints       Same as 'endpoint'\n";
        echo "  flows           Same as 'flows' (flow management)\n";
        echo "  integration     Same as 'flow' (end-to-end testing)\n\n";
        echo "Examples:\n";
        echo "  php run_tests.php                # Run all tests\n";
        echo "  php run_tests.php auth           # Run auth tests only\n";
        echo "  php run_tests.php collection     # Run collection tests\n";
        echo "  php run_tests.php endpoint       # Run endpoint tests\n";
        echo "  php run_tests.php flows          # Run flow tests\n";
        echo "  php run_tests.php api            # Run all API testing modules\n";
        echo "  php run_tests.php flow           # Run integration flow tests\n";
        echo "  php run_tests.php profile --debug # Run profile tests with debug\n";
        echo "  php run_tests.php --list         # List available tests\n\n";
    }

    /**
     * List available tests
     */
    private function listTests() {
        echo "\n=== Available Tests ===\n\n";
        foreach ($this->testClasses as $name => $class) {
            if ($name !== 'all') {
                echo "  $name\n";
            }
        }
        echo "\n";
    }

    /**
     * Get test class to run
     */
    private function getTestClass() {
        $testName = 'all'; // default

        foreach ($this->args as $arg) {
            if (strpos($arg, '--') !== 0 && isset($this->testClasses[$arg])) {
                $testName = $arg;
                break;
            }
        }

        return $testName;
    }

    /**
     * Run specific test class
     */
    private function runTest($className) {
        if (!class_exists($className)) {
            echo "Error: Test class $className not found\n";
            return false;
        }

        $testName = $className;
        
        // Check if we should skip this test
        if ($this->cacheManager->shouldSkip($testName)) {
            $cached = $this->cacheManager->getCachedResult($testName);
            echo "[SKIP] $testName - Passed in previous run ({$cached['passed']}/{$cached['total']})\n\n";
            
            // Add cached result to summary
            $this->results[] = [
                'test' => $testName,
                'results' => [],
                'passed' => $cached['passed'],
                'total' => $cached['total'],
                'duration' => 0
            ];
            
            return true; // Not an error
        }

        $test = new $className();
        $result = $test->run();
        $testResults = $test->getResults();
        
        // Save to cache
        $this->cacheManager->saveResult($testName, $testResults['passed'], $testResults['total']);
        
        $this->results[] = $testResults;

        return $result;
    }

    /**
     * Print summary
     */
    private function printSummary() {
        $totalTests = 0;
        $totalPassed = 0;
        $totalDuration = 0;

        echo "\n" . str_repeat("=", 60) . "\n";
        echo "TEST SUMMARY\n";
        echo str_repeat("=", 60) . "\n";

        foreach ($this->results as $result) {
            $totalTests += $result['total'];
            $totalPassed += $result['passed'];
            $totalDuration += $result['duration'];

            $status = $result['passed'] === $result['total'] ? "PASS" : "FAIL";
            $percentage = $result['total'] > 0
                ? round(($result['passed'] / $result['total']) * 100, 1)
                : 0;

            echo sprintf(
                "[%s] %s - %d/%d passed (%.1f%%) - %dms\n",
                $status,
                $result['test'],
                $result['passed'],
                $result['total'],
                $percentage,
                $result['duration']
            );
        }

        echo str_repeat("-", 60) . "\n";

        $overallStatus = $totalPassed === $totalTests ? "PASS" : "FAIL";
        $overallPercentage = $totalTests > 0
            ? round(($totalPassed / $totalTests) * 100, 1)
            : 0;

        echo sprintf(
            "OVERALL: [%s] %d/%d tests passed (%.1f%%) - %dms\n",
            $overallStatus,
            $totalPassed,
            $totalTests,
            $overallPercentage,
            $totalDuration
        );

        echo str_repeat("=", 60) . "\n\n";

        // Save summary to file
        $this->saveSummary($totalPassed, $totalTests, $totalDuration);

        return $totalPassed === $totalTests;
    }

    /**
     * Save summary to reports file
     */
    private function saveSummary($passed, $total, $duration) {
        $reportsDir = __DIR__ . '/reports/';
        if (!is_dir($reportsDir)) {
            mkdir($reportsDir, 0755, true);
        }

        $summary = [
            'timestamp' => date('Y-m-d H:i:s'),
            'total_tests' => $total,
            'passed' => $passed,
            'failed' => $total - $passed,
            'duration_ms' => $duration,
            'success_rate' => $total > 0 ? round(($passed / $total) * 100, 1) : 0,
            'results' => $this->results
        ];

        $filename = $reportsDir . 'summary_' . date('Y-m-d_H-i-s') . '.json';
        file_put_contents($filename, json_encode($summary, JSON_PRETTY_PRINT));

        echo "Summary saved to: " . basename($filename) . "\n";
    }

    /**
     * Run tests
     */
    public function run() {
        // Check for help flag
        if (in_array('--help', $this->args) || in_array('-h', $this->args)) {
            $this->showHelp();
            return true;
        }

        // Check for list flag
        if (in_array('--list', $this->args) || in_array('-l', $this->args)) {
            $this->listTests();
            return true;
        }

        // Set debug mode
        if ($this->debug) {
            define('TEST_DEBUG', true);
            echo "Debug mode enabled\n\n";
        }

        $testName = $this->getTestClass();
        $startTime = microtime(true);

        // Clear old report files at the start
        $reportsDir = __DIR__ . '/reports/';
        if (is_dir($reportsDir)) {
            $oldFiles = glob($reportsDir . '*');
            foreach ($oldFiles as $file) {
                if (is_file($file)) {
                    unlink($file);
                }
            }
        }

        echo "Starting Backend PHP API Tests...\n";
        echo "Test Suite: $testName\n";
        echo "Base URL: " . TestConfig::getBaseUrl() . "\n";
        echo "Timeout: " . TestConfig::getTimeout() . "s\n\n";

        $success = true;

        if ($testName === 'all') {
            // Run all tests
            foreach ($this->testClasses as $name => $class) {
                if ($name !== 'all') {
                    echo "Running $name tests...\n";
                    $result = $this->runTest($class);
                    $success = $success && $result;
                    echo "\n";
                }
            }
        } else {
            // Run specific test
            $className = $this->testClasses[$testName];
            echo "Running $testName tests...\n\n";
            $success = $this->runTest($className);
        }

        $endTime = microtime(true);
        $totalDuration = round(($endTime - $startTime) * 1000, 2);

        echo "Total execution time: {$totalDuration}ms\n";

        $this->printSummary();

        return $success;
    }
}

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if cURL is available
if (!extension_loaded('curl')) {
    die("Error: cURL extension is required but not installed.\n");
}

// Create and run test suite
$runner = new TestRunner($argv);
$success = $runner->run();

// Exit with proper code
exit($success ? 0 : 1);