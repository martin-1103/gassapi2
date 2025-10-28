<?php
/**
 * Test PUT method support
 */

header('Content-Type: application/json');

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request method
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['act'] ?? 'test';

$response = [
    'success' => true,
    'method' => $method,
    'action' => $action,
    'message' => 'PUT method test successful',
    'request_data' => file_get_contents('php://input'),
    'get_data' => $_GET,
    'post_data' => $_POST,
    'headers' => getallheaders(),
    'timestamp' => date('Y-m-d H:i:s')
];

if ($method === 'PUT') {
    $response['put_test'] = 'PUT method is supported by PHP backend';
    $response['raw_input'] = file_get_contents('php://input');

    // Try to parse JSON input
    $json_input = json_decode(file_get_contents('php://input'), true);
    if ($json_input !== null) {
        $response['parsed_json'] = $json_input;
    }
}

echo json_encode($response, JSON_PRETTY_PRINT);