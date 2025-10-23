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

require_once __DIR__ . '/cases/AuthTest.php';
require_once __DIR__ . '/cases/UserTest.php';

class TestRunner {
    private $args = [];
    private $debug = false;
    private $testClasses = [];
    private $results = [];

    public function __construct($args = []) {
        $this->args = array_slice($args, 1); // Skip script name
        $this->parseArguments();
        $this->registerTestClasses();
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
            'auth' => 'AuthTest',
            'user' => 'UserTest',
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
        echo "Test Names:\n";
        echo "  auth            Run authentication tests\n";
        echo "  user            Run user management tests\n";
        echo "  all             Run all tests (default)\n\n";
        echo "Examples:\n";
        echo "  php run_tests.php                # Run all tests\n";
        echo "  php run_tests.php auth           # Run auth tests only\n";
        echo "  php run_tests.php user --debug   # Run user tests with debug\n";
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

        $test = new $className();
        $result = $test->run();
        $this->results[] = $test->getResults();

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