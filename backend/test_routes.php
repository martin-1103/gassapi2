<?php
/**
 * Simple test for API routes
 */

// Set up environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';
$_GET['act'] = 'forgot-password';

// Mock JSON input
$json_input = json_encode(['email' => 'test@example.com']);
file_put_contents('php://memory', $json_input);

// Include the main API
require_once 'index.php';