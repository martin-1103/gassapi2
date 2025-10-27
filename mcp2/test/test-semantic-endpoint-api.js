/**
 * Test Semantic Endpoint via API
 * Direct API test to verify semantic fields are stored in database
 */

const http = require('http');

// Test data
const testEndpoint = {
  name: 'API Test Semantic Endpoint',
  method: 'POST',
  url: '/api/test/semantic',
  description: 'Test endpoint created via API with semantic fields',
  purpose: 'Test purpose for semantic fields functionality',
  request_params: {
    'param1': 'Test parameter description 1',
    'param2': 'Test parameter description 2'
  },
  response_schema: {
    'field1': 'Response field description 1',
    'field2': 'Response field description 2'
  },
  header_docs: {
    'Authorization': 'Bearer token description',
    'Content-Type': 'JSON content type description'
  }
};

// Make API request
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ statusCode: res.statusCode, data: response });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function testSemanticEndpointAPI() {
  console.log('🧪 Testing Semantic Endpoint via API...');
  console.log('📝 Creating endpoint with all semantic fields');

  // First create a folder
  const folderOptions = {
    hostname: 'localhost',
    port: 8080,
    path: '/gassapi2/backend/?act=folder',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      name: 'Test API Folder',
      description: 'Test folder for semantic endpoint API testing'
    }
  };

  try {
    const folderResponse = await makeRequest(folderOptions);
    console.log('📁 Folder creation response:', folderResponse.statusCode);

    if (folderResponse.statusCode !== 200 && folderResponse.statusCode !== 201) {
      console.log('❌ Folder creation failed, but continuing test...');
    }

    // Simulate folder ID (in real scenario would parse from response)
    const folderId = 'test_folder_id';

    // Create endpoint with semantic fields
    const endpointOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/gassapi2/backend/?act=endpoint',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        name: testEndpoint.name,
        method: testEndpoint.method,
        url: testEndpoint.url,
        folder_id: folderId,
        description: testEndpoint.description,
        purpose: testEndpoint.purpose,
        request_params: testEndpoint.request_params,
        response_schema: testEndpoint.response_schema,
        header_docs: testEndpoint.header_docs
      }
    };

    const endpointResponse = await makeRequest(endpointOptions);
    console.log('🔗 Endpoint creation response:', endpointResponse.statusCode);

    if (endpointResponse.statusCode === 200 || endpointResponse.statusCode === 201) {
      console.log('✅ Semantic endpoint created successfully via API!');
      console.log('📊 Response:', JSON.stringify(endpointResponse.data, null, 2));
    } else {
      console.log('❌ Endpoint creation failed:', endpointResponse.data);
    }

  } catch (error) {
    console.log('💥 API test failed:', error.message);
  }
}

// Test database directly to verify data storage
function testDatabaseStorage() {
  console.log('\n🔍 Testing Database Storage...');

  const { spawn } = require('child_process');
  const phpScript = `
<?php
$mysqli = new mysqli('localhost', 'root', '', 'gassapi');
if ($mysqli->connect_error) {
    die('Connection failed: ' . $mysqli->connect_error);
}

// Query recent endpoints with semantic fields
$result = $mysqli->query('SELECT id, name, purpose, description, request_params, response_schema, header_docs FROM endpoints WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE) ORDER BY created_at DESC LIMIT 5');

echo "📋 Recent endpoints with semantic fields:\n";
echo "=====================================\n";
$count = 0;
while ($row = $result->fetch_assoc()) {
    echo "ID: " . $row['id'] . "\n";
    echo "Name: " . $row['name'] . "\n";
    echo "Description: " . ($row['description'] ?? 'NULL') . "\n";
    echo "Purpose: " . ($row['purpose'] ?? 'NULL') . "\n";
    echo "Request Params: " . ($row['request_params'] ?? 'NULL') . "\n";
    echo "Response Schema: " . ($row['response_schema'] ?? 'NULL') . "\n";
    echo "Header Docs: " . ($row['header_docs'] ?? 'NULL') . "\n";
    echo "---\n";
    $count++;
}

echo "\n📊 Total recent endpoints: " . $count . "\n";
$mysqli->close();
`;

  const php = spawn('php', ['-r', phpScript], {
    cwd: 'D:/xampp82/htdocs/gassapi2/backend'
  });

  php.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  php.stderr.on('data', (data) => {
    process.stderr.write('Error: ' + data);
  });
}

async function runTests() {
  try {
    await testSemanticEndpointAPI();
    testDatabaseStorage();
    console.log('\n🎉 Semantic endpoint API test completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();