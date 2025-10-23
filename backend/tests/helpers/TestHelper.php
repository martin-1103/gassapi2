<?php

require_once __DIR__ . '/../config/TestConfig.php';

/**
 * Helper class untuk testing dengan cURL
 */
class TestHelper {
    private $baseUrl;
    private $timeout;
    private $lastResponse;
    private $lastInfo;
    private $authToken = null;

    public function __construct() {
        $this->baseUrl = TestConfig::getBaseUrl();
        $this->timeout = TestConfig::getTimeout();
    }

    /**
     * Execute cURL request
     */
    public function request($method, $endpoint, $data = null, $headers = [], $id = null) {
        $url = TestConfig::getUrl($endpoint, $id);

        $ch = curl_init();

        // Basic cURL setup
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ch, CURLOPT_HEADER, false);

        // Set headers
        $requestHeaders = TestConfig::DEFAULT_HEADERS;

        // Add auth token if available
        if ($this->authToken) {
            $requestHeaders[] = "Authorization: Bearer " . $this->authToken;
        }

        // Merge with custom headers
        $requestHeaders = array_merge($requestHeaders, $headers);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $requestHeaders);

        // Set method and data
        switch (strtoupper($method)) {
            case 'GET':
                curl_setopt($ch, CURLOPT_HTTPGET, true);
                break;
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                if ($data !== null) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'PUT':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
                if ($data !== null) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
        }

        // Execute request
        $this->lastResponse = curl_exec($ch);
        $this->lastInfo = curl_getinfo($ch);
        $error = curl_error($ch);
        curl_close($ch);

        // Handle errors
        if ($error) {
            throw new Exception("cURL Error: " . $error);
        }

        // Decode JSON response
        $responseData = json_decode($this->lastResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            $responseData = [
                'raw_response' => $this->lastResponse,
                'json_error' => json_last_error_msg()
            ];
        }

        // Merge API response with test metadata
        $result = array_merge($responseData, [
            'status' => $this->lastInfo['http_code'],
            'info' => $this->lastInfo,
            'raw' => $this->lastResponse
        ]);

        return $result;
    }

    /**
     * GET request
     */
    public function get($endpoint, $headers = [], $id = null) {
        return $this->request('GET', $endpoint, null, $headers, $id);
    }

    /**
     * POST request
     */
    public function post($endpoint, $data = null, $headers = []) {
        return $this->request('POST', $endpoint, $data, $headers);
    }

    /**
     * PUT request
     */
    public function put($endpoint, $data = null, $headers = [], $id = null) {
        return $this->request('PUT', $endpoint, $data, $headers, $id);
    }

    /**
     * DELETE request
     */
    public function delete($endpoint, $headers = [], $id = null) {
        return $this->request('DELETE', $endpoint, null, $headers, $id);
    }

    /**
     * Set auth token untuk requests selanjutnya
     */
    public function setAuthToken($token) {
        $this->authToken = $token;
    }

    /**
     * Clear auth token
     */
    public function clearAuthToken() {
        $this->authToken = null;
    }

    /**
     * Get last response
     */
    public function getLastResponse() {
        return $this->lastResponse;
    }

    /**
     * Get last info
     */
    public function getLastInfo() {
        return $this->lastInfo;
    }

    /**
     * Print test result
     */
    public function printResult($testName, $result, $expectedStatus = 200) {
        $status = $result['status'];
        $success = $status === $expectedStatus;

        echo sprintf(
            "[%s] %s - %s (%d)\n",
            $success ? "PASS" : "FAIL",
            $testName,
            $success ? "SUCCESS" : "FAILED",
            $status
        );

        if (TestConfig::isDebug()) {
            echo "URL: " . $result['info']['url'] . "\n";
            echo "Expected: $expectedStatus, Got: $status\n";

            if (!$success) {
                echo "Response: " . $result['raw'] . "\n";
            }

            echo str_repeat("-", 50) . "\n";
        }

        // Save response
        TestConfig::saveResponse($testName, $result);

        return $success;
    }

    /**
     * Assert response contains key
     */
    public function assertHasKey($response, $key) {
        // Support checking both top-level keys and nested data keys
        if (isset($response[$key])) {
            return true; // Top-level key exists
        }
        
        if (!isset($response['data'][$key])) {
            throw new Exception("Response missing key: $key");
        }
        return true;
    }

    /**
     * Assert response equals expected value
     */
    public function assertEquals($response, $key, $expected) {
        // Support both direct key access and nested data key access
        $actual = null;
        
        if (isset($response[$key])) {
            $actual = $response[$key]; // Direct key access
        } elseif (isset($response['data'][$key])) {
            $actual = $response['data'][$key]; // Nested in data
        }
        
        if ($actual === null || $actual !== $expected) {
            $actualStr = $actual !== null ? $actual : 'MISSING';
            throw new Exception("Expected $key = $expected, got $actualStr");
        }
        return true;
    }

    /**
     * Handle re-authentication after token invalidation
     */
    public function reauthenticateIfNeeded($email, $password) {
        // Try to use existing token first to test if it's still valid
        if ($this->authToken) {
            // Test current token with a simple request
            try {
                $testResult = $this->get('profile');
                if ($testResult['status'] === 200) {
                    return true; // Token still valid
                }
            } catch (Exception $e) {
                // Token invalid, proceed with re-authentication
            }
        }

        // Re-authenticate with provided credentials
        $loginData = [
            'email' => $email,
            'password' => $password
        ];

        $loginResult = $this->post('login', $loginData);

        if ($loginResult['status'] === 200 && isset($loginResult['data']['access_token'])) {
            $this->authToken = $loginResult['data']['access_token'];
            return true;
        }

        return false;
    }

    /**
     * Delay between requests (rate limiting)
     */
    public function delay($seconds = 0.5) {
        usleep($seconds * 1000000);
    }
}