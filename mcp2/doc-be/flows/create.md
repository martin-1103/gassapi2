# Create Flow

## Endpoint
`POST /project/{id}/flows`

## Description
Membuat flow baru untuk project. Flow merepresentasikan automation atau test scenario yang terdiri dari multiple API calls. **Single endpoint ini menerima kedua format**: React Flow format (untuk visual UI) atau Steps format (untuk execution).

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID project

## Request Body

### Dual Format Support

#### Option 1: React Flow Format (For Visual UI)
Format ini digunakan oleh frontend visual flow builder.

```json
{
  "name": "User Registration Flow",
  "description": "Complete user registration and verification flow",
  "folder_id": "fld_123",
  "flow_inputs": [
    {
      "name": "username",
      "type": "string",
      "required": true,
      "validation": {
        "min_length": 3,
        "max_length": 50
      },
      "description": "Username untuk registrasi"
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "description": "Email address user"
    },
    {
      "name": "password",
      "type": "password",
      "required": true,
      "validation": {
        "min_length": 8,
        "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$"
      },
      "description": "Password dengan huruf besar, kecil, dan angka"
    }
  ],
  "flow_data": {
    "nodes": [
      {
        "id": "register",
        "type": "apiCall",
        "position": {"x": 100, "y": 100},
        "data": {
          "name": "Register User",
          "method": "POST",
          "url": "{{env.API_URL}}/auth/register",
          "headers": {
            "Content-Type": "application/json"
          },
          "body": {
            "username": "{{input.username}}",
            "email": "{{input.email}}",
            "password": "{{input.password}}"
          },
          "outputs": {
            "userId": "response.body.user.id",
            "activationToken": "response.body.activation_token"
          }
        }
      },
      {
        "id": "verify_email",
        "type": "apiCall",
        "position": {"x": 350, "y": 100},
        "data": {
          "name": "Verify Email",
          "method": "POST",
          "url": "{{env.API_URL}}/auth/verify-email",
          "body": {
            "token": "{{register.activationToken}}"
          }
        }
      }
    ],
    "edges": [
      {
        "id": "edge-register-verify",
        "source": "register",
        "target": "verify_email",
        "type": "smoothstep"
      }
    ]
  },
  "is_active": true
}
```

#### Option 2: Steps Format (For Execution)
Format ini digunakan untuk API automation dan execution engines.

```json
{
  "name": "API Testing Flow",
  "description": "API testing flow created with steps format",
  "folder_id": "fld_456",
  "flow_inputs": [
    {
      "name": "baseUrl",
      "type": "string",
      "required": true,
      "validation": {
        "pattern": "^https?://.+"
      },
      "description": "Base URL untuk API testing"
    },
    {
      "name": "authToken",
      "type": "string",
      "required": true,
      "description": "Authentication token"
    },
    {
      "name": "testUserId",
      "type": "string",
      "required": false,
      "description": "Test user ID (optional)"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "get_user",
        "name": "Get User Data",
        "method": "GET",
        "url": "{{input.baseUrl}}/users/{{input.testUserId}}",
        "headers": {
          "Authorization": "Bearer {{input.authToken}}"
        },
        "outputs": {
          "userData": "response.body",
          "userRole": "response.body.role"
        }
      },
      {
        "id": "update_user",
        "name": "Update User Profile",
        "method": "PUT",
        "url": "{{input.baseUrl}}/users/{{input.testUserId}}",
        "headers": {
          "Authorization": "Bearer {{input.authToken}}",
          "Content-Type": "application/json"
        },
        "body": {
          "name": "{{input.userName}}",
          "profile": "{{input.userProfile}}"
        },
        "outputs": {
          "updatedUser": "response.body"
        }
      }
    ],
    "config": {
      "delay": 0,
      "retryCount": 1,
      "parallel": false
    }
  },
  "is_active": true
}
```

### Fields
- `name` (required): Nama flow
- `description` (optional): Deskripsi flow
- `folder_id` (optional): ID folder yang terkait
- `flow_inputs` (optional): Array definisi input dinamis
- `flow_data` (required): Flow configuration (React Flow atau Steps format)
- `is_active` (optional): Status aktif flow (default: true)

## Automatic Format Detection

Sistem akan otomatis mendeteksi format berdasarkan struktur input:

```php
// React Flow detection
if (isset($flowData['nodes']) && isset($flowData['edges'])) {
    // Convert React Flow to Steps for execution
    $stepsData = FlowConverter::reactFlowToSteps($flowData);
    $uiData = $flowData; // Store React Flow as-is
} else {
    // Validate Steps format
    $stepsData = $flowData;
    $uiData = FlowConverter::stepsToReactFlow($flowData);
}
```

## Storage Strategy

Setelah validation dan konversi, sistem menyimpan:
- **`flow_data`**: Steps format untuk execution engines
- **`ui_data`**: React Flow format untuk UI
- **`flow_inputs`**: JSON string dari flow inputs definition

## Response

### Created (201)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Flow created",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_abc123def456",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_789",
    "folder_id": "fld_123",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[{\"id\":\"register\",\"name\":\"Register User\",\"method\":\"POST\",\"url\":\"{{env.API_URL}}/auth/register\"}]}",
    "ui_data": "{\"nodes\":[{\"id\":\"register\",\"type\":\"apiCall\",\"position\":{\"x\":100,\"y\":100},\"data\":{\"name\":\"Register User\",\"method\":\"POST\",\"url\":\"{{env.API_URL}}/auth/register\"}}],\"edges\":[{\"id\":\"edge-register-verify\",\"source\":\"register\",\"target\":\"verify_email\",\"type\":\"smoothstep\"}]}",
    "is_active": 1,
    "created_by": "user_456",
    "created_at": "2025-10-25 07:00:00",
    "updated_at": "2025-10-25 07:00:00"
  }
}
```

### Error (400) - Validation Errors
```json
{
  "status": "error",
  "message": "Invalid flow inputs: Input username: minimum length is 3"
}
```

### Error (400) - Format Errors
```json
{
  "status": "error",
  "message": "Invalid flow format: Node missing required field 'id'"
}
```

### Error (400) - Variable Reference Errors
```json
{
  "status": "error",
  "message": "Invalid variable references: Step 0: Invalid field name 'invalid-field' in reference 'step.invalid-field'"
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Use Case Examples

### 1. **Frontend Visual Flow Builder**
```bash
POST /gassapi2/backend/?act=flow_create&id=proj_123
Content-Type: application/json

{
  "name": "Visual Flow",
  "flow_data": {
    "nodes": [
      {
        "id": "start",
        "type": "apiCall",
        "data": {...}
      }
    ],
    "edges": []
  }
}
```

### 2. **API Automation Script**
```bash
POST /gassapi2/backend/?act=flow_create&id=proj_123
Content-Type: application/json

{
  "name": "API Automation",
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "step_1",
        "method": "POST",
        "url": "{{input.baseUrl}}/endpoint"
      }
    ]
  }
}
```

### 3. **Flow with Dynamic Inputs**
```bash
POST /gassapi2/backend/?act=flow_create&id=proj_123
Content-Type: application/json

{
  "name": "Configurable API Test",
  "flow_inputs": [
    {
      "name": "endpointUrl",
      "type": "string",
      "required": true
    }
  ],
  "flow_data": {
    "steps": [
      {
        "method": "GET",
        "url": "{{input.endpointUrl}}"
      }
    ]
  }
}
```

## Authorization
- User harus menjadi member dari project
- Valid access token diperlukan

## Best Practices

### 1. **Choose Right Format**
- **React Flow**: Untuk visual editing, drag-drop interfaces
- **Steps**: Untu API automation, scripting, execution engines

### 2. **Flow Inputs Design**
- Include descriptive names and validation
- Provide clear examples
- Set appropriate defaults

### 3. **Variable References**
- Use specific references (`{{login.token}}`)
- Validate step dependencies
- Handle missing references gracefully

### 4. **Error Handling**
- Handle validation errors gracefully
- Provide clear error messages
- Use appropriate HTTP status codes

## Related Documentation

- [Flow Inputs](flow-inputs.md) - Detailed flow inputs configuration
- [Variable References](variable-references.md) - Variable reference patterns
- [UI Endpoints](ui-endpoints.md) - For React Flow UI operations
- [Format Conversion](format-conversion.md) - Automatic conversion logic
- [Validation](validation.md) - Complete validation rules

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Flow created",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "folder_id": "fld_123",
    "flow_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 10:30:00"
  }
}
```

### Error (400)
```json
{
  "status": "error",
  "message": "Folder does not belong to this project"
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Authorization
- User harus menjadi member dari project

## Example
```bash
POST /gassapi2/backend/?act=flow_create&id=proj_123
Authorization: Bearer eyJhbGc...

{
  "name": "User Registration Flow",
  "description": "Test user registration",
  "is_active": true
}
```
