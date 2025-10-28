<?php
/**
 * Public Endpoint - Generate MCP Token
 * 
 * POST /public/generate-mcp-token.php
 * 
 * Request Body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123",
 *   "project_id": "proj_xxx"
 * }
 * 
 * Response:
 * {
 *   "project": {
 *     "id": "proj_xxx",
 *     "name": "Project Name",
 *     "description": "Description"
 *   },
 *   "mcpClient": {
 *     "token": "generated_token_here"
 *   }
 * }
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed. Use POST.'
    ]);
    exit;
}

// Get input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON input'
    ]);
    exit;
}

$email = $input['email'] ?? null;
$password = $input['password'] ?? null;
$projectId = $input['project_id'] ?? null;

// Validate input
if (!$email || !$password || !$projectId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields: email, password, project_id'
    ]);
    exit;
}

// API Base URL
$apiUrl = 'http://mapi.gass.web.id';

/**
 * Make HTTP request
 */
function makeRequest($method, $endpoint, $headers = [], $data = null) {
    global $apiUrl;
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl . $endpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    
    if ($data !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true)
    ];
}

try {
    // Step 1: Login
    $loginResponse = makeRequest('POST', '/?act=login', [
        'Content-Type: application/json'
    ], [
        'email' => $email,
        'password' => $password
    ]);
    
    if (!$loginResponse['body']['success']) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'Login failed',
            'error' => $loginResponse['body']['message'] ?? 'Invalid credentials'
        ]);
        exit;
    }
    
    $accessToken = $loginResponse['body']['data']['access_token'];
    $user = $loginResponse['body']['data']['user'];
    
    // Step 2: Verify project access
    $projectResponse = makeRequest('GET', '/?act=project&id=' . $projectId, [
        'Authorization: Bearer ' . $accessToken
    ]);
    
    if (!$projectResponse['body']['success']) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Project not found or access denied',
            'error' => $projectResponse['body']['message'] ?? 'Invalid project'
        ]);
        exit;
    }
    
    $project = $projectResponse['body']['data'];
    
    // Step 3: Generate MCP Token
    $mcpResponse = makeRequest('POST', '/?act=mcp_generate_config&id=' . $projectId, [
        'Authorization: Bearer ' . $accessToken,
        'Content-Type: application/json'
    ], []);
    
    if (!$mcpResponse['body']['success']) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Failed to generate MCP token',
            'error' => $mcpResponse['body']['message'] ?? 'Unknown error'
        ]);
        exit;
    }
    
    $mcpConfig = $mcpResponse['body']['data'];
    
    // Success response
    http_response_code(201);
    echo json_encode([
        'project' => [
            'id' => $project['id'],
            'name' => $project['name'],
            'description' => $project['description'] ?? null
        ],
        'mcpClient' => [
            'token' => $mcpConfig['token']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Internal server error',
        'error' => $e->getMessage()
    ]);
}
