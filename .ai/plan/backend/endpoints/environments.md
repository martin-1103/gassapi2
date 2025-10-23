# 🌍 Environment Management API

## Overview
Environment management untuk store dan manage variables dalam berbagai environments (development, staging, production).

---

## GET `/projects/:id/environments`
Get all environments dalam project.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "environments": [
    {
      "id": "env_abc123",
      "name": "Development",
      "description": "Local development environment",
      "variables": [
        {
          "key": "API_BASE_URL",
          "value": "http://localhost:3000"
        },
        {
          "key": "API_TOKEN",
          "value": "dev_token_123"
        }
      ],
      "isDefault": true,
      "createdAt": "2025-01-21T10:00:00Z",
      "updatedAt": "2025-01-21T10:00:00Z"
    },
    {
      "id": "env_def456",
      "name": "Production",
      "description": "Production environment",
      "variables": [
        {
          "key": "API_BASE_URL",
          "value": "https://api.example.com"
        },
        {
          "key": "API_TOKEN",
          "value": "prod_token_456"
        }
      ],
      "isDefault": false,
      "createdAt": "2025-01-21T10:05:00Z",
      "updatedAt": "2025-01-21T10:05:00Z"
    }
  ]
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## POST `/projects/:id/environments`
Create new environment dalam project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Staging",
  "description": "Staging environment for testing",
  "variables": [
    {
      "key": "API_BASE_URL",
      "value": "https://staging-api.example.com"
    },
    {
      "key": "API_TOKEN",
      "value": "staging_token_789"
    }
  ],
  "isDefault": false
}
```

### Validation Rules
- `name`: Required, max 100 characters, unique within project
- `description`: Optional, max 500 characters
- `variables`: Optional, array of key-value pairs
- `isDefault`: Optional, boolean (only one environment can be default)

### Response
```json
{
  "success": true,
  "environment": {
    "id": "env_ghi789",
    "name": "Staging",
    "description": "Staging environment for testing",
    "variables": [
      {
        "key": "API_BASE_URL",
        "value": "https://staging-api.example.com"
      },
      {
        "key": "API_TOKEN",
        "value": "staging_token_789"
      }
    ],
    "isDefault": false,
    "projectId": "proj_abc123",
    "createdAt": "2025-01-21T10:10:00Z",
    "updatedAt": "2025-01-21T10:10:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found
- `409` - Environment name already exists

---

## GET `/environments/:id`
Get environment details.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "environment": {
    "id": "env_abc123",
    "name": "Development",
    "description": "Local development environment",
    "variables": [
      {
        "key": "API_BASE_URL",
        "value": "http://localhost:3000"
      },
      {
        "key": "API_TOKEN",
        "value": "dev_token_123",
        "description": "Development API token"
      },
      {
        "key": "DEBUG_MODE",
        "value": "true",
        "enabled": true
      }
    ],
    "isDefault": true,
    "projectId": "proj_abc123",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Environment not found

---

## PUT `/environments/:id`
Update environment configuration.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Development Updated",
  "description": "Updated local development environment",
  "variables": [
    {
      "key": "API_BASE_URL",
      "value": "http://localhost:8080"
    },
    {
      "key": "API_TOKEN",
      "value": "dev_token_updated"
    }
  ],
  "isDefault": true
}
```

### Validation Rules
Same as POST environment validation.

### Response
```json
{
  "success": true,
  "environment": {
    "id": "env_abc123",
    "name": "Development Updated",
    "description": "Updated local development environment",
    "variables": [
      {
        "key": "API_BASE_URL",
        "value": "http://localhost:8080"
      },
      {
        "key": "API_TOKEN",
        "value": "dev_token_updated"
      }
    ],
    "isDefault": true,
    "projectId": "proj_abc123",
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:15:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Environment not found
- `409` - Environment name already exists

---

## DELETE `/environments/:id`
Delete environment.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Environment deleted successfully"
}
```

### Constraints
- Cannot delete default environment if it's the only one
- At least one environment must remain in project
- Variables in deleted environment are permanently lost

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Environment not found
- `409` - Cannot delete last environment or default environment

---

## 🔧 Business Logic

### Variable Management
- **Key Format**: Alphanumeric, underscores, hyphens only
- **Key Uniqueness**: Keys must be unique within environment
- **Value Types**: String values (future: support different types)
- **Variable Substitution**: Used in endpoint URLs, headers, and bodies
- **Secret Variables**: Sensitive values marked in UI (future feature)

### Default Environment Rules
- **Single Default**: Only one environment can be default per project
- **Auto Creation**: First environment in project automatically set as default
- **Default Switching**: Can change default environment
- **Required Default**: At least one default environment must exist

### Environment Types
- **Development**: Local development environment
- **Staging**: Testing/staging environment
- **Production**: Live production environment
- **Custom**: User-defined environment types

### Variable Substitution
Variables support template substitution in:
- **URLs**: `{{API_BASE_URL}}/users/{{userId}}`
- **Headers**: `"Authorization": "Bearer {{API_TOKEN}}"`
- **Body**: `{"username": "{{username}}", "password": "{{password}}"}`

### Permission Model
- **Create**: All project members
- **Read**: All project members
- **Update**: All project members
- **Delete**: All project members (with constraints)

### Audit Trail
All environment operations create audit logs:
- Action: `environment_created`, `environment_updated`, `environment_deleted`
- Resource type: `environment`
- Resource ID: Environment ID
- Old/New values: Changed fields (variables are logged as arrays)

### Performance
- Index on `project_id` for fast project retrieval
- Variable storage as JSON for flexibility
- Caching of active environment variables
- Efficient variable substitution algorithms

### Security
- **Variable Encryption**: Sensitive variables encrypted in database (future)
- **Access Control**: Only project members can access variables
- **Audit Logging**: All variable changes logged
- **Secret Masking**: Sensitive values masked in responses (future)

### Import/Export Integration
- **Postman Variables**: Mapped from Postman environment variables
- **OpenAPI Servers**: Server URLs converted to environment variables
- **Collection Variables**: Collection-specific variables supported (future)
- **Global Variables**: Project-wide variables (future feature)