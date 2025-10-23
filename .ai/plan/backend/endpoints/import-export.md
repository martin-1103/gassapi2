# 📥 Import/Export API

## Overview
Import/export collections dari Postman, OpenAPI, dan export ke berbagai format.

---

## POST `/collections/import`
Import collection dari external format (Postman, OpenAPI).

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request Body
```json
{
  "projectId": "proj_abc123",
  "parentId": "col_abc123",
  "format": "postman|openapi|insomnia",
  "data": { ... }
}
```

### Validation Rules
- `projectId`: Required, user must be member
- `parentId`: Optional, must exist in same project
- `format`: Required, supported format
- `data`: Required, valid format data

---

### Postman v2.1 Import

#### Request Example
```json
{
  "projectId": "proj_abc123",
  "parentId": null,
  "format": "postman",
  "data": {
    "info": {
      "name": "User Management API",
      "description": "API for managing users",
      "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
      {
        "name": "Authentication",
        "item": [
          {
            "name": "Login",
            "request": {
              "method": "POST",
              "header": [
                {
                  "key": "Content-Type",
                  "value": "application/json"
                }
              ],
              "body": {
                "mode": "raw",
                "raw": "{\n  \"email\": \"{{email}}\",\n  \"password\": \"{{password}}\"\n}"
              },
              "url": {
                "raw": "{{baseUrl}}/auth/login",
                "host": ["{{baseUrl}}"],
                "path": ["auth", "login"]
              }
            }
          }
        ]
      }
    ],
    "variable": [
      {
        "key": "baseUrl",
        "value": "https://api.example.com"
      }
    ]
  }
}
```

#### Response
```json
{
  "success": true,
  "imported": {
    "collections": 2,
    "endpoints": 15,
    "environments": 1
  },
  "collections": [
    {
      "id": "col_new123",
      "name": "User Management API",
      "projectId": "proj_abc123",
      "parentId": null
    },
    {
      "id": "col_new124",
      "name": "Authentication",
      "projectId": "proj_abc123",
      "parentId": "col_new123"
    }
  ]
}
```

---

### OpenAPI 3.0 Import

#### Request Example
```json
{
  "projectId": "proj_abc123",
  "parentId": null,
  "format": "openapi",
  "data": {
    "openapi": "3.0.0",
    "info": {
      "title": "Simple API",
      "version": "1.0.0",
      "description": "A simple API example"
    },
    "servers": [
      {
        "url": "https://api.example.com/v1"
      }
    ],
    "paths": {
      "/users": {
        "get": {
          "summary": "Get all users",
          "responses": {
            "200": {
              "description": "Successful response",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          }
        },
        "post": {
          "summary": "Create user",
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUser"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "User created"
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "User": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            }
          }
        },
        "CreateUser": {
          "type": "object",
          "required": ["name", "email"],
          "properties": {
            "name": {
              "type": "string"
            },
            "email": {
              "type": "string"
            }
          }
        }
      }
    }
  }
}
```

---

## GET `/collections/:id/export`
Export collection ke various formats.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `format` - Export format: `postman`, `openapi`, `insomnia`
- `includeSubCollections` - Boolean: include nested collections (default: true)
- `includeExamples` - Boolean: include example responses (default: true)

### Response Format (Postman v2.1)
```json
{
  "info": {
    "name": "User Management",
    "description": "API endpoints for user management",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Users",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{API_TOKEN}}"
          }
        ],
        "url": {
          "raw": "{{API_BASE_URL}}/users",
          "host": ["{{API_BASE_URL}}"],
          "path": ["users"]
        }
      },
      "response": [
        {
          "name": "Success",
          "originalRequest": {
            "method": "GET",
            "url": "{{API_BASE_URL}}/users"
          },
          "status": "200 OK",
          "code": 200,
          "body": "[{\"id\":\"1\",\"name\":\"John Doe\",\"email\":\"john@example.com\"}]"
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "API_BASE_URL",
      "value": "{{API_BASE_URL}}"
    },
    {
      "key": "API_TOKEN",
      "value": "{{API_TOKEN}}"
    }
  ]
}
```

### Response Format (OpenAPI 3.0)
```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "User Management API",
    "version": "1.0.0",
    "description": "API for managing users"
  },
  "servers": [
    {
      "url": "{{API_BASE_URL}}"
    }
  ],
  "paths": {
    "/users": {
      "get": {
        "summary": "Get all users",
        "parameters": [
          {
            "name": "Authorization",
            "in": "header",
            "required": true,
            "schema": {
              "type": "string"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "id": {"type": "string"},
                      "name": {"type": "string"},
                      "email": {"type": "string"}
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

---

## 🔧 Business Logic

### Import Processing

#### Data Validation
- Validate JSON structure against format schema
- Check required fields and data types
- Validate URL formats and HTTP methods
- Limit import size: max 1000 endpoints, 10MB file

#### Conflict Resolution
- **Duplicate Names**: Auto-suffix with number
- **Duplicate URLs**: Keep both with different names
- **Invalid Methods**: Skip or convert to GET
- **Missing Fields**: Use sensible defaults

#### Environment Variable Mapping
- Map Postman variables to GassAPI environment
- Convert OpenAPI server URLs to environment variables
- Preserve variable names and descriptions
- Create default environment if none exists

### Export Processing

#### Variable Resolution
- Include environment variables in export
- Use `{{VARIABLE_NAME}}` format
- Export active environment variables
- Include variable descriptions if available

#### Collection Hierarchy
- Maintain folder structure in export
- Convert nested collections to folders
- Preserve collection order
- Include collection descriptions

#### Response Examples
- Include stored response examples
- Generate example responses from schemas (OpenAPI)
- Format response bodies appropriately
- Include response headers and status codes

### Performance Considerations

#### Import Performance
- Stream large files instead of loading to memory
- Batch database inserts for efficiency
- Use transactions for data consistency
- Progress reporting for large imports

#### Export Performance
- Stream response data
- Cache export data for repeated requests
- Compress response data when possible
- Use pagination for large collections

### Error Handling

#### Import Errors
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid Postman collection format",
  "details": {
    "field": "info.schema",
    "reason": "Missing required schema field"
  },
  "warnings": [
    "Skipped 3 endpoints with invalid URLs"
  ]
}
```

#### Export Errors
- `404` - Collection not found
- `403` - No access to collection
- `400` - Invalid export format
- `500` - Export processing error

### Supported Formats

#### Current Support
- **Postman**: v2.1 collection format
- **OpenAPI**: 3.0.x specifications
- **Insomnia**: v4 export format (planned)

#### Future Support
- **Swagger**: 2.0 specifications
- **RAML**: RESTful API Modeling Language
- **API Blueprint**: API documentation format
- **Custom Formats**: JSON schema-based imports