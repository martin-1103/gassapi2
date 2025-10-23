<?php

header('Content-Type: application/json');

echo "=== DEBUG: All Headers Received by PHP ===\n\n";

echo "--- All \$_SERVER Variables ---\n";
$headers = [];
foreach ($_SERVER as $key => $value) {
    if (strpos($key, 'HTTP_') === 0 || strpos($key, 'REDIRECT_') === 0) {
        $headers[$key] = $value;
    }
}

echo json_encode($headers, JSON_PRETTY_PRINT) . "\n\n";

echo "--- Specific Authorization Checks ---\n";
echo "HTTP_AUTHORIZATION: " . (isset($_SERVER['HTTP_AUTHORIZATION']) ? 'YES - ' . $_SERVER['HTTP_AUTHORIZATION'] : 'NO') . "\n";
echo "REDIRECT_HTTP_AUTHORIZATION: " . (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION']) ? 'YES - ' . $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] : 'NO') . "\n";

echo "\n--- getallheaders() Result ---\n";
if (function_exists('getallheaders')) {
    $allHeaders = getallheaders();
    echo json_encode($allHeaders, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "getallheaders() not available\n";
}

echo "\n--- Apache Module Test ---\n";
echo "Apache mod_rewrite: " . (function_exists('apache_get_modules') && in_array('mod_rewrite', apache_get_modules()) ? 'YES' : 'NO/UNKNOWN') . "\n";

echo "\n=== Request Details ===\n";
echo "Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Query String: " . ($_SERVER['QUERY_STRING'] ?? 'empty') . "\n";