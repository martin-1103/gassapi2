<?php

require_once __DIR__ . '/../helpers/BaseTest.php';

/**
 * Test cases untuk System endpoints (Health Check, API Help)
 * - System endpoints TIDAK membutuhkan authentication
 */
class SystemTest extends BaseTest {

    protected function setUp() {
        parent::setUp();
        // System tests tidak membutuhkan authentication
    }

    /**
     * Test health check endpoint
     */
    protected function testHealthCheck() {
        $this->printHeader('Health Check Test');

        $result = $this->testHelper->get('health');
        $success = $this->testHelper->printResult('Health Check', $result, 200);

        if ($success) {
            // Verify response structure
            $this->testHelper->assertHasKey($result, 'data');
            $this->testHelper->assertHasKey($result['data'], 'status');
            $this->testHelper->assertHasKey($result['data'], 'timestamp');

            // Verify status is "healthy" or "ok"
            $status = $result['data']['status'] ?? '';
            if (in_array(strtolower($status), ['healthy', 'ok', 'success'])) {
                echo "[INFO] Health check status: {$status}\n";
            }
        }

        return $success;
    }

    /**
     * Test API help endpoint
     */
    protected function testApiHelp() {
        $this->printHeader('API Help Test');

        $result = $this->testHelper->get('help');
        $success = $this->testHelper->printResult('API Help', $result, 200);

        if ($success) {
            // Verify response structure
            $this->testHelper->assertHasKey($result, 'data');

            // Check if help data contains expected information
            $helpData = $result['data'];
            if (isset($helpData['endpoints']) || isset($helpData['routes']) || isset($helpData['api_info'])) {
                echo "[INFO] API help contains endpoint information\n";
            }

            // Check for API version information
            if (isset($helpData['version']) || isset($helpData['api_version'])) {
                $version = $helpData['version'] ?? $helpData['api_version'] ?? 'unknown';
                echo "[INFO] API version: {$version}\n";
            }
        }

        return $success;
    }

    /**
     * Test system performance (response time check)
     */
    protected function testSystemPerformance() {
        $this->printHeader('System Performance Test');

        $startTime = microtime(true);

        // Test health check response time
        $result = $this->testHelper->get('health');

        $endTime = microtime(true);
        $responseTime = round(($endTime - $startTime) * 1000, 2); // in milliseconds

        $success = $this->testHelper->printResult('Health Check Performance', $result, 200);

        // Check if response time is reasonable (< 1 second)
        if ($responseTime < 1000) {
            echo "[INFO] Health check response time: {$responseTime}ms ✓\n";
        } else {
            echo "[WARNING] Health check response time: {$responseTime}ms (slow)\n";
        }

        // Test API help response time
        $startTime = microtime(true);
        $helpResult = $this->testHelper->get('help');
        $endTime = microtime(true);
        $helpResponseTime = round(($endTime - $startTime) * 1000, 2);

        $helpSuccess = $this->testHelper->printResult('API Help Performance', $helpResult, 200);

        if ($helpResponseTime < 1000) {
            echo "[INFO] API help response time: {$helpResponseTime}ms ✓\n";
        } else {
            echo "[WARNING] API help response time: {$helpResponseTime}ms (slow)\n";
        }

        return $success && $helpSuccess;
    }

    /**
     * Test system endpoints with different HTTP methods
     */
    protected function testSystemEndpointsMethods() {
        $this->printHeader('System Endpoints HTTP Methods Test');

        $results = [];

        // Test health check with different methods (should only work with GET)
        $healthGet = $this->testHelper->get('health');
        $results[] = $this->testHelper->printResult('Health Check GET', $healthGet, 200);

        $healthPost = $this->testHelper->post('health', []);
        $results[] = $this->testHelper->printResult('Health Check POST', $healthPost, 405); // Method Not Allowed

        $healthPut = $this->testHelper->put('health', []);
        $results[] = $this->testHelper->printResult('Health Check PUT', $healthPut, 405); // Method Not Allowed

        $healthDelete = $this->testHelper->delete('health');
        $results[] = $this->testHelper->printResult('Health Check DELETE', $healthDelete, 405); // Method Not Allowed

        // Test API help with different methods (should only work with GET)
        $helpGet = $this->testHelper->get('help');
        $results[] = $this->testHelper->printResult('API Help GET', $helpGet, 200);

        $helpPost = $this->testHelper->post('help', []);
        $results[] = $this->testHelper->printResult('API Help POST', $helpPost, 405); // Method Not Allowed

        return !in_array(false, $results);
    }

    /**
     * Test system endpoints with query parameters
     */
    protected function testSystemEndpointsWithParams() {
        $this->printHeader('System Endpoints With Parameters Test');

        $results = [];

        // Test health check with parameters (should ignore them)
        $healthWithParams = $this->testHelper->get('health', ['format' => 'json', 'verbose' => 'true']);
        $results[] = $this->testHelper->printResult('Health Check With Params', $healthWithParams, 200);

        // Test API help with parameters
        $helpWithParams = $this->testHelper->get('help', ['format' => 'json', 'section' => 'endpoints']);
        $results[] = $this->testHelper->printResult('API Help With Params', $helpWithParams, 200);

        return !in_array(false, $results);
    }

    /**
     * Test system error handling (non-existent endpoints)
     */
    protected function testSystemErrorHandling() {
        $this->printHeader('System Error Handling Test');

        $results = [];

        // Test non-existent system endpoint
        $nonExistent = $this->testHelper->get('status');
        $results[] = $this->testHelper->printResult('Non-existent System Endpoint', $nonExistent, 404);

        // Test malformed endpoint names
        $malformed1 = $this->testHelper->get('health/');
        $results[] = $this->testHelper->printResult('Malformed Endpoint 1', $malformed1, 404);

        $malformed2 = $this->testHelper->get('/help');
        $results[] = $this->testHelper->printResult('Malformed Endpoint 2', $malformed2, 404);

        // Test empty endpoint
        $empty = $this->testHelper->get('');
        $results[] = $this->testHelper->printResult('Empty Endpoint', $empty, 404);

        return !in_array(false, $results);
    }

    /**
     * Test system endpoints under load (multiple quick requests)
     */
    protected function testSystemLoad() {
        $this->printHeader('System Load Test');

        $results = [];
        $requestCount = 5;

        echo "[INFO] Testing system with {$requestCount} concurrent health check requests...\n";

        // Make multiple rapid requests to health check
        for ($i = 1; $i <= $requestCount; $i++) {
            $startTime = microtime(true);
            $result = $this->testHelper->get('health');
            $endTime = microtime(true);

            $responseTime = round(($endTime - $startTime) * 1000, 2);
            $success = $this->testHelper->printResult("Health Check Request #{$i} ({$responseTime}ms)", $result, 200);
            $results[] = $success;

            // Small delay to prevent overwhelming
            usleep(10000); // 10ms
        }

        $successCount = count(array_filter($results));
        $successRate = round(($successCount / $requestCount) * 100, 1);

        echo "[INFO] Load test results: {$successCount}/{$requestCount} successful ({$successRate}%)\n";

        return $successCount === $requestCount;
    }

    /**
     * Test system consistency (multiple requests should return consistent data)
     */
    protected function testSystemConsistency() {
        $this->printHeader('System Consistency Test');

        $results = [];
        $healthResponses = [];
        $helpResponses = [];

        // Make multiple requests and collect responses
        for ($i = 1; $i <= 3; $i++) {
            // Health check
            $healthResult = $this->testHelper->get('health');
            if ($healthResult['status'] === 200) {
                $healthResponses[] = $healthResult['data']['status'] ?? 'unknown';
            }
            $results[] = $healthResult['status'] === 200;

            // API help
            $helpResult = $this->testHelper->get('help');
            if ($helpResult['status'] === 200) {
                $helpResponses[] = json_encode($helpResult['data']);
            }
            $results[] = $helpResult['status'] === 200;
        }

        // Check consistency of health check responses
        $healthConsistent = count(array_unique($healthResponses)) <= 1;
        if ($healthConsistent) {
            echo "[INFO] Health check responses are consistent ✓\n";
        } else {
            echo "[WARNING] Health check responses vary: " . implode(', ', array_unique($healthResponses)) . "\n";
        }

        // Check consistency of API help responses
        $helpConsistent = count(array_unique($helpResponses)) <= 1;
        if ($helpConsistent) {
            echo "[INFO] API help responses are consistent ✓\n";
        } else {
            echo "[WARNING] API help responses vary\n";
        }

        return !in_array(false, $results) && $healthConsistent && $helpConsistent;
    }

    /**
     * Test system headers and caching behavior
     */
    protected function testSystemHeaders() {
        $this->printHeader('System Headers Test');

        $results = [];

        // Test health check headers
        $healthResult = $this->testHelper->get('health');
        $healthSuccess = $this->testHelper->printResult('Health Check Headers', $healthResult, 200);
        $results[] = $healthSuccess;

        if ($healthSuccess && isset($healthResult['headers'])) {
            $headers = $healthResult['headers'];

            // Check for common headers
            if (isset($headers['Content-Type'])) {
                echo "[INFO] Health Check Content-Type: {$headers['Content-Type']}\n";
            }

            if (isset($headers['Cache-Control'])) {
                echo "[INFO] Health Check Cache-Control: {$headers['Cache-Control']}\n";
            }
        }

        // Test API help headers
        $helpResult = $this->testHelper->get('help');
        $helpSuccess = $this->testHelper->printResult('API Help Headers', $helpResult, 200);
        $results[] = $helpSuccess;

        if ($helpSuccess && isset($helpResult['headers'])) {
            $headers = $helpResult['headers'];

            // Check for common headers
            if (isset($headers['Content-Type'])) {
                echo "[INFO] API Help Content-Type: {$headers['Content-Type']}\n";
            }

            if (isset($headers['Cache-Control'])) {
                echo "[INFO] API Help Cache-Control: {$headers['Cache-Control']}\n";
            }
        }

        return !in_array(false, $results);
    }

    protected function tearDown() {
        // System tests tidak membutuhkan cleanup khusus
        parent::tearDown();
    }
}