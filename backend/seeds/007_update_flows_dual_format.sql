-- Seed Update: Add Dual Format Data to Existing Flows
-- Description: Update existing flows with flow_inputs and ui_data for dual format support
-- Environment: Development
-- Dependencies: 006_seed_flows.sql, 007_update_flows_dual_format.sql migration

SET FOREIGN_KEY_CHECKS = 0;

-- Update existing flows to add flow_inputs and convert to React Flow format for ui_data

-- Flow 1: User Authentication Flow
UPDATE flows SET
    flow_inputs = '[
        {
            "name": "email",
            "type": "email",
            "required": true,
            "description": "User email for login"
        },
        {
            "name": "password",
            "type": "password",
            "required": true,
            "validation": {
                "min_length": 6
            },
            "description": "User password"
        }
    ]',
    ui_data = '{
        "nodes": [
            {
                "id": "login",
                "type": "apiCall",
                "position": {"x": 100, "y": 100},
                "data": {
                    "name": "User Login",
                    "method": "POST",
                    "url": "/auth/login",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": {
                        "email": "{{input.email}}",
                        "password": "{{input.password}}"
                    },
                    "outputs": {
                        "authToken": "response.body.token",
                        "refreshToken": "response.body.refreshToken"
                    },
                    "tests": [
                        "pm.test(\"Status is 200\", () => pm.response.to.have.status(200));",
                        "pm.test(\"Response has token\", () => pm.expect(pm.response.json()).to.have.property(\"token\"));"
                    ]
                }
            }
        ],
        "edges": []
    }'
WHERE id = 'flow-001';

-- Flow 2: Product Catalog Management
UPDATE flows SET
    flow_inputs = '[
        {
            "name": "authToken",
            "type": "string",
            "required": true,
            "description": "Authentication token"
        },
        {
            "name": "productName",
            "type": "string",
            "required": true,
            "validation": {
                "min_length": 1,
                "max_length": 255
            },
            "description": "Product name"
        },
        {
            "name": "price",
            "type": "number",
            "required": true,
            "validation": {
                "min": 0,
                "max": 999999.99
            },
            "description": "Product price"
        },
        {
            "name": "category",
            "type": "string",
            "required": true,
            "validation": {
                "options": ["electronics", "clothing", "books", "home", "sports"]
            },
            "description": "Product category"
        }
    ]',
    ui_data = '{
        "nodes": [
            {
                "id": "create_product",
                "type": "apiCall",
                "position": {"x": 100, "y": 100},
                "data": {
                    "name": "Create New Product",
                    "method": "POST",
                    "url": "/products",
                    "headers": {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer {{authToken}}"
                    },
                    "body": {
                        "name": "{{input.productName}}",
                        "description": "Test product created via flow",
                        "price": "{{input.price}}",
                        "category": "{{input.category}}"
                    },
                    "outputs": {
                        "productId": "response.body.id"
                    }
                }
            },
            {
                "id": "get_product",
                "type": "apiCall",
                "position": {"x": 350, "y": 100},
                "data": {
                    "name": "Get Product Details",
                    "method": "GET",
                    "url": "/products/{{create_product.productId}}",
                    "headers": {
                        "Authorization": "Bearer {{authToken}}"
                    }
                }
            }
        ],
        "edges": [
            {
                "id": "edge-create-get",
                "source": "create_product",
                "target": "get_product",
                "type": "smoothstep"
            }
        ]
    }'
WHERE id = 'flow-002';

-- Flow 3: Weather Data Gathering
UPDATE flows SET
    flow_inputs = '[
        {
            "name": "cities",
            "type": "array",
            "required": true,
            "description": "List of cities to get weather for"
        },
        {
            "name": "units",
            "type": "string",
            "required": false,
            "validation": {
                "options": ["metric", "imperial"]
            },
            "default": "metric",
            "description": "Temperature units"
        }
    ]',
    ui_data = '{
        "nodes": [
            {
                "id": "get_weather_jakarta",
                "type": "apiCall",
                "position": {"x": 100, "y": 100},
                "data": {
                    "name": "Get Jakarta Weather",
                    "method": "GET",
                    "url": "/weather/current?city=Jakarta&units={{input.units}}",
                    "outputs": {
                        "jakartaTemp": "response.body.main.temp",
                        "jakartaHumidity": "response.body.main.humidity"
                    }
                }
            },
            {
                "id": "get_weather_surabaya",
                "type": "apiCall",
                "position": {"x": 350, "y": 100},
                "data": {
                    "name": "Get Surabaya Weather",
                    "method": "GET",
                    "url": "/weather/current?city=Surabaya&units={{input.units}}",
                    "outputs": {
                        "surabayaTemp": "response.body.main.temp",
                        "surabayaHumidity": "response.body.main.humidity"
                    }
                }
            }
        ],
        "edges": [
            {
                "id": "edge-jakarta-surabaya",
                "source": "get_weather_jakarta",
                "target": "get_weather_surabaya",
                "type": "smoothstep"
            }
        ]
    }'
WHERE id = 'flow-003';

-- Flow 4: User Management Workflow
UPDATE flows SET
    flow_inputs = '[
        {
            "name": "adminToken",
            "type": "string",
            "required": true,
            "description": "Admin authentication token"
        },
        {
            "name": "userName",
            "type": "string",
            "required": true,
            "validation": {
                "min_length": 2,
                "max_length": 100
            },
            "description": "Test user name"
        },
        {
            "name": "userEmail",
            "type": "email",
            "required": true,
            "description": "Test user email"
        },
        {
            "name": "userRole",
            "type": "string",
            "required": true,
            "validation": {
                "options": ["admin", "user", "moderator"]
            },
            "default": "user",
            "description": "User role"
        }
    ]',
    ui_data = '{
        "nodes": [
            {
                "id": "get_all_users",
                "type": "apiCall",
                "position": {"x": 100, "y": 100},
                "data": {
                    "name": "List All Users",
                    "method": "GET",
                    "url": "/admin/users?page=1&limit=10",
                    "headers": {
                        "Authorization": "Bearer {{input.adminToken}}"
                    }
                }
            },
            {
                "id": "create_test_user",
                "type": "apiCall",
                "position": {"x": 350, "y": 100},
                "data": {
                    "name": "Create Test User",
                    "method": "POST",
                    "url": "/admin/users",
                    "headers": {
                        "Authorization": "Bearer {{input.adminToken}}"
                    },
                    "body": {
                        "name": "{{input.userName}}",
                        "email": "{{input.userEmail}}",
                        "role": "{{input.userRole}}",
                        "isActive": true
                    },
                    "outputs": {
                        "newUserId": "response.body.id"
                    }
                }
            }
        ],
        "edges": [
            {
                "id": "edge-list-create",
                "source": "get_all_users",
                "target": "create_test_user",
                "type": "smoothstep"
            }
        ]
    }'
WHERE id = 'flow-004';

-- Flow 5: File Upload and Processing
UPDATE flows SET
    flow_inputs = '[
        {
            "name": "storageToken",
            "type": "string",
            "required": true,
            "description": "Storage service authentication token"
        },
        {
            "name": "filePath",
            "type": "file",
            "required": true,
            "description": "Path to test file"
        },
        {
            "name": "fileName",
            "type": "string",
            "required": true,
            "validation": {
                "max_length": 255
            },
            "description": "File name"
        },
        {
            "name": "folder",
            "type": "string",
            "required": false,
            "default": "uploads/test",
            "description": "Upload folder path"
        }
    ]',
    ui_data = '{
        "nodes": [
            {
                "id": "upload_file",
                "type": "apiCall",
                "position": {"x": 100, "y": 100},
                "data": {
                    "name": "Upload Test File",
                    "method": "POST",
                    "url": "/files/upload",
                    "headers": {
                        "Authorization": "Bearer {{input.storageToken}}"
                    },
                    "body": {
                        "file": "{{input.filePath}}",
                        "folder": "{{input.folder}}",
                        "public": false
                    },
                    "outputs": {
                        "fileId": "response.body.id",
                        "fileUrl": "response.body.url"
                    }
                }
            },
            {
                "id": "verify_upload",
                "type": "apiCall",
                "position": {"x": 350, "y": 100},
                "data": {
                    "name": "Verify File Upload",
                    "method": "GET",
                    "url": "/files/{{upload_file.fileId}}",
                    "headers": {
                        "Authorization": "Bearer {{input.storageToken}}"
                    }
                }
            }
        ],
        "edges": [
            {
                "id": "edge-upload-verify",
                "source": "upload_file",
                "target": "verify_upload",
                "type": "smoothstep"
            }
        ]
    }'
WHERE id = 'flow-005';

-- Add sample flows with AI-generated metadata for testing
UPDATE flows SET
    ai_version = 'v1.0',
    generation_strategy = 'template_based',
    complexity_score = 0.65
WHERE id IN ('flow-001', 'flow-002');

UPDATE flows SET
    ai_version = 'v1.0',
    generation_strategy = 'template_based',
    complexity_score = 0.45
WHERE id IN ('flow-003', 'flow-004');

UPDATE flows SET
    ai_version = 'v1.0',
    generation_strategy = 'template_based',
    complexity_score = 0.55
WHERE id = 'flow-005';

SET FOREIGN_KEY_CHECKS = 1;