<?php

require_once __DIR__ . '/TestHelper.php';

/**
 * Base Test class
 */
abstract class BaseTest {
    protected $testHelper;
    protected $testName;
    protected $results = [];
    protected $startTime;
    protected $endTime;

    public function __construct() {
        $this->testHelper = new TestHelper();
        $this->testName = get_class($this);
    }

    /**
     * Setup sebelum test dimulai
     */
    protected function setUp() {
        $this->startTime = microtime(true);
        echo "\n=== Starting {$this->testName} ===\n";
    }

    /**
     * Cleanup setelah test selesai
     */
    protected function tearDown() {
        $this->endTime = microtime(true);
        $duration = round(($this->endTime - $this->startTime) * 1000, 2);

        $passed = count(array_filter($this->results, fn($r) => $r));
        $total = count($this->results);

        echo "\n=== {$this->testName} Results ===\n";
        echo "Passed: $passed/$total tests\n";
        echo "Duration: {$duration}ms\n";
        echo "Status: " . ($passed === $total ? "SUCCESS" : "FAILED") . "\n";
        echo str_repeat("=", 50) . "\n";

        $success = ($passed === $total);
        
        // Debug: check if there's mismatch
        if (!$success && defined('TEST_DEBUG')) {
            echo "[DEBUG] tearDown returning false: passed=$passed, total=$total\n";
            echo "[DEBUG] Results array: " . print_r($this->results, true) . "\n";
        }

        return $success;
    }

    /**
     * Run all test methods
     */
    public function run() {
        echo "[DEBUG] BaseTest.run() - calling setUp()\n";
        $this->setUp();

        // Get all test methods (methods starting with 'test')
        $methods = get_class_methods($this);
        echo "[DEBUG] BaseTest.run() - all methods: " . implode(', ', $methods) . "\n";
        $testMethods = array_filter($methods, fn($method) => strpos($method, 'test') === 0);
        echo "[DEBUG] BaseTest.run() - test methods: " . implode(', ', $testMethods) . "\n";
        sort($testMethods); // Sort alphabetically to ensure predictable order

        foreach ($testMethods as $method) {
            try {
                $result = $this->$method();
                $this->results[] = $result;
            } catch (Exception $e) {
                echo "[FAIL] {$method} - Exception: " . $e->getMessage() . "\n";
                $this->results[] = false;
            }

            // Delay between tests
            $this->testHelper->delay();
        }

        return $this->tearDown();
    }

    /**
     * Print test header
     */
    protected function printHeader($description) {
        echo "\n--- $description ---\n";
    }

    /**
     * Test health check endpoint
     */
    protected function testHealthCheck() {
        $this->printHeader("Health Check Test");
        $result = $this->testHelper->get('health');
        return $this->testHelper->printResult("Health Check", $result, 200);
    }

    /**
     * Test API help/documentation endpoint
     */
    protected function testApiHelp() {
        $this->printHeader("API Help Test");
        $result = $this->testHelper->get('help');
        return $this->testHelper->printResult("API Help", $result, 200);
    }

    /**
     * Skip test dengan reason
     * Returns false - dihitung sebagai FAIL
     */
    protected function skip($reason) {
        echo "[SKIP/FAIL] $reason\n";
        return false;
    }

    /**
     * Get test results summary
     */
    public function getResults() {
        return [
            'test' => $this->testName,
            'results' => $this->results,
            'passed' => count(array_filter($this->results)),
            'total' => count($this->results),
            'duration' => isset($this->endTime) && isset($this->startTime)
                ? round(($this->endTime - $this->startTime) * 1000, 2)
                : 0
        ];
    }
}