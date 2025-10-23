-- Seed: Flows Table
-- Description: Insert sample API automation flows for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id), Collections table (collection_id), Users table (created_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM flows WHERE name LIKE 'Demo %' OR name LIKE 'Sample %';

-- Insert Sample Flows
INSERT INTO flows (
    id, name, description, project_id, collection_id, flow_data,
    created_by, is_active, created_at, updated_at
) VALUES
(
    'flow-001',
    'User Authentication Flow',
    'Complete user login and token refresh workflow',
    'proj-001',
    'coll-001',
    '{
        "version": "1.0",
        "steps": [
            {
                "id": "login",
                "name": "User Login",
                "endpoint": "endp-001",
                "method": "POST",
                "url": "/auth/login",
                "body": {
                    "email": "{{$randomEmail}}",
                    "password": "{{$password}}"
                },
                "headers": {
                    "Content-Type": "application/json"
                },
                "tests": [
                    "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                    "pm.test(\"Response has token\", () => pm.expect(pm.response.json()).to.have.property(\"token\"));"
                ],
                "outputs": {
                    "authToken": "response.token",
                    "refreshToken": "response.refreshToken"
                }
            },
            {
                "id": "get_user_profile",
                "name": "Get User Profile",
                "endpoint": "endp-004",
                "method": "GET",
                "url": "/users/profile",
                "headers": {
                    "Authorization": "Bearer {{authToken}}"
                },
                "tests": [
                    "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                    "pm.test(\"User data received\", () => pm.expect(pm.response.json()).to.have.property(\"id\"));"
                ]
            }
        ],
        "config": {
            "delay": 1000,
            "retryCount": 2,
            "parallel": false
        }
    }',
    'user-001',
    1,
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
),
(
    'flow-002',
    'Product Catalog Management',
    'Create, read, update, and delete products workflow',
    'proj-001',
    'coll-002',
    '{
        "version": "1.0",
        "steps": [
            {
                "id": "create_product",
                "name": "Create New Product",
                "endpoint": "endp-006",
                "method": "POST",
                "url": "/products",
                "body": {
                    "name": "Test Product {{$randomInt}}",
                    "description": "This is a test product created via flow",
                    "price": {{$randomPrice}},
                    "category": "electronics",
                    "stock": 100
                },
                "headers": {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{authToken}}"
                },
                "outputs": {
                    "productId": "response.id"
                }
            },
            {
                "id": "get_product",
                "name": "Get Product Details",
                "endpoint": "endp-005",
                "method": "GET",
                "url": "/products/{{productId}}",
                "headers": {
                    "Authorization": "Bearer {{authToken}}"
                }
            }
        ],
        "config": {
            "delay": 500,
            "retryCount": 1,
            "parallel": false
        }
    }',
    'user-001',
    1,
    DATE_SUB(NOW(), INTERVAL 19 DAY),
    NOW()
),
(
    'flow-003',
    'Weather Data Collection',
    'Collect current weather data for multiple cities',
    'proj-002',
    'coll-004',
    '{
        "version": "1.0",
        "steps": [
            {
                "id": "get_weather_jakarta",
                "name": "Get Jakarta Weather",
                "endpoint": "endp-007",
                "method": "GET",
                "url": "/weather/current?city=Jakarta&units=metric",
                "outputs": {
                    "jakartaTemp": "response.main.temp",
                    "jakartaHumidity": "response.main.humidity"
                }
            },
            {
                "id": "get_weather_surabaya",
                "name": "Get Surabaya Weather",
                "method": "GET",
                "url": "/weather/current?city=Surabaya&units=metric",
                "outputs": {
                    "surabayaTemp": "response.main.temp",
                    "surabayaHumidity": "response.main.humidity"
                }
            }
        ],
        "config": {
            "delay": 200,
            "retryCount": 3,
            "parallel": true
        }
    }',
    'user-002',
    1,
    DATE_SUB(NOW(), INTERVAL 16 DAY),
    NOW()
),
(
    'flow-004',
    'User Management Workflow',
    'Admin user management workflow for testing user operations',
    'proj-003',
    'coll-006',
    '{
        "version": "1.0",
        "steps": [
            {
                "id": "get_all_users",
                "name": "List All Users",
                "endpoint": "endp-010",
                "method": "GET",
                "url": "/admin/users?page=1&limit=10",
                "headers": {
                    "Authorization": "Bearer {{adminToken}}"
                }
            },
            {
                "id": "create_test_user",
                "name": "Create Test User",
                "method": "POST",
                "url": "/admin/users",
                "body": {
                    "name": "Test User {{$randomInt}}",
                    "email": "test{{$randomInt}}@example.com",
                    "role": "user",
                    "isActive": true
                },
                "headers": {
                    "Authorization": "Bearer {{adminToken}}"
                },
                "outputs": {
                    "newUserId": "response.id"
                }
            }
        ],
        "config": {
            "delay": 1000,
            "retryCount": 2,
            "parallel": false
        }
    }',
    'admin-001',
    1,
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    NOW()
),
(
    'flow-005',
    'File Upload and Processing',
    'Upload file and verify processing workflow',
    'proj-004',
    'coll-008',
    '{
        "version": "1.0",
        "steps": [
            {
                "id": "upload_file",
                "name": "Upload Test File",
                "endpoint": "endp-012",
                "method": "POST",
                "url": "/files/upload",
                "body": {
                    "file": "{{$randomFileType}}",
                    "folder": "uploads/test",
                    "public": false
                },
                "headers": {
                    "Authorization": "Bearer {{storageToken}}"
                },
                "outputs": {
                    "fileId": "response.id",
                    "fileUrl": "response.url"
                }
            },
            {
                "id": "verify_upload",
                "name": "Verify File Upload",
                "method": "GET",
                "url": "/files/{{fileId}}",
                "headers": {
                    "Authorization": "Bearer {{storageToken}}"
                }
            }
        ],
        "config": {
            "delay": 2000,
            "retryCount": 3,
            "parallel": false
        }
    }',
    'user-004',
    1,
    DATE_SUB(NOW(), INTERVAL 6 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;