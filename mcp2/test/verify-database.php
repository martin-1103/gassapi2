<?php
/**
 * Verify Semantic Fields in Database
 */

$mysqli = new mysqli('localhost', 'root', '', 'gassapi');
if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

echo "🔍 Verifying Semantic Fields Implementation\n";
echo "========================================\n\n";

// Check if columns exist
$result = $mysqli->query("DESCRIBE endpoints");
$columns = [];
while ($row = $result->fetch_assoc()) {
    $columns[] = $row['Field'];
}

$semanticFields = ['description', 'purpose', 'request_params', 'response_schema', 'header_docs'];
echo "📋 Semantic Columns Check:\n";
foreach ($semanticFields as $field) {
    $exists = in_array($field, $columns);
    echo "   $field: " . ($exists ? "✅ EXISTS" : "❌ MISSING") . "\n";
}

echo "\n📊 Endpoint Table Structure:\n";
echo "============================\n";
$result = $mysqli->query("SHOW COLUMNS FROM endpoints");
while ($row = $result->fetch_assoc()) {
    echo sprintf("%-20s %-20s %-10s\n", $row['Field'], $row['Type'], $row['Null']);
}

echo "\n📈 Total Endpoints: " . $mysqli->query("SELECT COUNT(*) as count FROM endpoints")->fetch_assoc()['count'] . "\n";

// Check for recent endpoints (last 1 hour)
$result = $mysqli->query("SELECT COUNT(*) as count FROM endpoints WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)");
$recentCount = $result->fetch_assoc()['count'];
echo "🕐 Recent endpoints (last hour): " . $recentCount . "\n";

// Show sample endpoint if exists
$result = $mysqli->query("SELECT id, name, purpose FROM endpoints ORDER BY created_at DESC LIMIT 3");
if ($result->num_rows > 0) {
    echo "\n📝 Sample Endpoints:\n";
    echo "====================\n";
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row['id'] . "\n";
        echo "Name: " . $row['name'] . "\n";
        echo "Purpose: " . ($row['purpose'] ?? 'NULL') . "\n";
        echo "---\n";
    }
}

echo "\n✅ Database verification completed!\n";
$mysqli->close();
?>