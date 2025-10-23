-- Seed: Test Flows Table
-- Description: Insert sample automated test flows for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id), Users table (created_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM test_flows WHERE name LIKE 'Test %' OR name LIKE 'Automated %';

-- Insert Sample Test Flows
INSERT INTO test_flows (
    id, name, description, project_id, config, steps, created_by,
    is_active, last_run_at, last_run_status, total_runs, success_rate,
    created_at, updated_at
) VALUES
(
    'tflow-001',
    'Authentication API Tests',
    'Comprehensive test suite for authentication endpoints',
    'proj-001',
    '{
        "environment": "Development",
        "timeout": 30000,
        "retries": 2,
        "parallel": false,
        "data": {
            "testUser": {
                "email": "test@example.com",
                "password": "testpassword123"
            }
        }
    }',
    '[
        {
            "id": "test_register",
            "name": "Test User Registration",
            "method": "POST",
            "url": "/auth/register",
            "body": {
                "name": "Test User",
                "email": "{{testUser.email}}",
                "password": "{{testUser.password}}"
            },
            "headers": {
                "Content-Type": "application/json"
            },
            "tests": [
                "pm.test(\"Status is 201\", () => pm.response.to.have.status(201));",
                "pm.test(\"User created successfully\", () => pm.expect(pm.response.json()).to.have.property(\"message\"));"
            ]
        },
        {
            "id": "test_login",
            "name": "Test User Login",
            "method": "POST",
            "url": "/auth/login",
            "body": {
                "email": "{{testUser.email}}",
                "password": "{{testUser.password}}"
            },
            "headers": {
                "Content-Type": "application/json"
            },
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"Token received\", () => pm.expect(pm.response.json()).to.have.property(\"token\"));"
            ]
        }
    ]',
    'user-001',
    1,
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    'passed',
    25,
    96.0,
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
),
(
    'tflow-002',
    'Product API Tests',
    'CRUD operations test for product endpoints',
    'proj-001',
    '{
        "environment": "Development",
        "timeout": 25000,
        "retries": 1,
        "parallel": true,
        "data": {
            "authToken": "{{authToken}}",
            "testProduct": {
                "name": "Test Product",
                "description": "Test product description",
                "price": 99.99,
                "category": "electronics"
            }
        }
    }',
    '[
        {
            "id": "test_create_product",
            "name": "Test Create Product",
            "method": "POST",
            "url": "/products",
            "body": "{{testProduct}}",
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer {{authToken}}"
            },
            "tests": [
                "pm.test(\"Status is 201\", () => pm.response.to.have.status(201));",
                "pm.test(\"Product created\", () => pm.expect(pm.response.json()).to.have.property(\"id\"));"
            ]
        },
        {
            "id": "test_get_product",
            "name": "Test Get Product",
            "method": "GET",
            "url": "/products/{{productId}}",
            "headers": {
                "Authorization": "Bearer {{authToken}}"
            },
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"Product data matches\", () => pm.expect(pm.response.json().name).to.eql(\"{{testProduct.name}}\"));"
            ]
        }
    ]',
    'user-001',
    1,
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'passed',
    18,
    94.4,
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    NOW()
),
(
    'tflow-003',
    'Weather API Tests',
    'Weather data retrieval and validation tests',
    'proj-002',
    '{
        "environment": "Development",
        "timeout": 15000,
        "retries": 3,
        "parallel": true,
        "data": {
            "testCities": ["Jakarta", "Surabaya", "Bandung", "Medan"],
            "testCoordinates": {
                "lat": -6.2088,
                "lon": 106.8456
            }
        }
    }',
    '[
        {
            "id": "test_weather_by_city",
            "name": "Test Weather by City Name",
            "method": "GET",
            "url": "/weather/current?city=Jakarta&units=metric",
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"Weather data structure\", () => {",
                "    const json = pm.response.json();",
                "    pm.expect(json).to.have.property(\"main\");",
                "    pm.expect(json.main).to.have.property(\"temp\");",
                "});"
            ]
        },
        {
            "id": "test_weather_by_coordinates",
            "name": "Test Weather by Coordinates",
            "method": "GET",
            "url": "/weather/current?lat={{testCoordinates.lat}}&lon={{testCoordinates.lon}}&units=metric",
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"Temperature is reasonable\", () => {",
                "    const temp = pm.response.json().main.temp;",
                "    pm.expect(temp).to.be.above(-50);",
                "});"
            ]
        }
    ]',
    'user-002',
    1,
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    'failed',
    32,
    87.5,
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    NOW()
),
(
    'tflow-004',
    'File Upload Tests',
    'File upload and processing validation tests',
    'proj-004',
    '{
        "environment": "Development",
        "timeout": 45000,
        "retries": 2,
        "parallel": false,
        "data": {
            "allowedFileTypes": ["jpg", "png", "pdf", "txt"],
            "maxFileSize": "10MB"
        }
    }',
    '[
        {
            "id": "test_upload_valid_file",
            "name": "Test Upload Valid File",
            "method": "POST",
            "url": "/files/upload",
            "body": {
                "file": "{{$randomFile}}",
                "folder": "test-uploads",
                "public": false
            },
            "headers": {
                "Authorization": "Bearer {{storageToken}}"
            },
            "tests": [
                "pm.test(\"Status is 201\", () => pm.response.to.have.status(201));",
                "pm.test(\"File uploaded successfully\", () => pm.expect(pm.response.json()).to.have.property(\"id\"));"
            ]
        },
        {
            "id": "test_download_uploaded_file",
            "name": "Test Download Uploaded File",
            "method": "GET",
            "url": "/files/{{uploadedFileId}}/download",
            "headers": {
                "Authorization": "Bearer {{storageToken}}"
            },
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"File content received\", () => pm.expect(pm.response.headers.get(\"Content-Type\")).to.exist);"
            ]
        }
    ]',
    'user-004',
    1,
    DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    'passed',
    12,
    91.7,
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    NOW()
),
(
    'tflow-005',
    'Analytics API Tests',
    'Analytics data retrieval and report generation tests',
    'proj-005',
    '{
        "environment": "Development",
        "timeout": 60000,
        "retries": 1,
        "parallel": false,
        "data": {
            "dateRange": {
                "startDate": "2024-01-01",
                "endDate": "2024-12-31"
            },
            "reportTypes": ["summary", "detailed", "export"]
        }
    }',
    '[
        {
            "id": "test_dashboard_overview",
            "name": "Test Dashboard Overview",
            "method": "GET",
            "url": "/dashboard/overview?startDate={{dateRange.startDate}}&endDate={{dateRange.endDate}}",
            "headers": {
                "Authorization": "Bearer {{analyticsToken}}"
            },
            "tests": [
                "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                "pm.test(\"Dashboard data structure\", () => {",
                "    const json = pm.response.json();",
                "    pm.expect(json).to.have.property(\"metrics\");",
                "    pm.expect(json).to.have.property(\"charts\");",
                "});"
            ]
        },
        {
            "id": "test_generate_report",
            "name": "Test Generate Report",
            "method": "POST",
            "url": "/reports/generate",
            "body": {
                "type": "summary",
                "startDate": "{{dateRange.startDate}}",
                "endDate": "{{dateRange.endDate}}",
                "format": "json"
            },
            "headers": {
                "Content-Type": "application/json",
                "Authorization": "Bearer {{analyticsToken}}"
            },
            "tests": [
                "pm.test(\"Status is 202\", () => pm.response.to.have.status(202));",
                "pm.test(\"Report generation started\", () => pm.expect(pm.response.json()).to.have.property(\"reportId\"));"
            ]
        }
    ]',
    'user-001',
    1,
    DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    'passed',
    8,
    100.0,
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;