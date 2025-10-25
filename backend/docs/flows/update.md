# Update Flow

## Endpoint
`PUT /flow/{id}`

## Description
Mengupdate flow dalam **Steps format** untuk execution dan automation. Endpoint ini menerima flow data dalam format execution dan otomatis mengkonversinya ke React Flow untuk UI.

**🎨 Untuk React Flow Updates**: Gunakan `PUT /flow/{id}/ui` untuk update dengan format visual UI.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID flow

## Request Body

### Steps Format (For Execution)
```json
{
  "name": "Updated User Registration Flow",
  "description": "Updated description with additional verification step",
  "collection_id": "col_456",
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
        "min_length": 8
      },
      "description": "Password user"
    },
    {
      "name": "sendWelcomeEmail",
      "type": "boolean",
      "required": false,
      "default": true,
      "description": "Send welcome email after registration"
    }
  ],
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "register",
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
          "activationToken": "response.body.activation_token",
          "userRole": "response.body.user.role"
        }
      },
      {
        "id": "verify_email",
        "name": "Verify Email",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/verify-email",
        "body": {
          "token": "{{register.activationToken}}"
        },
        "outputs": {
          "verificationStatus": "response.body.status"
        }
      },
      {
        "id": "send_welcome",
        "name": "Send Welcome Email",
        "method": "POST",
        "url": "{{env.API_URL}}/notifications/welcome",
        "condition": "{{input.sendWelcomeEmail}} === true",
        "body": {
          "userId": "{{register.userId}}",
          "userRole": "{{register.userRole}}"
        },
        "outputs": {
          "emailId": "response.body.email_id"
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

### Fields (All Optional)
- `name`: Nama flow baru
- `description`: Deskripsi baru
- `collection_id`: ID collection baru (harus dalam project yang sama)
- `flow_inputs`: Array definisi input dinamis baru
- `flow_data`: Flow configuration dalam Steps format
- `is_active`: Status aktif baru

## Automatic Conversion

Sistem akan otomatis:
1. **Validasi** Steps format dan variable references
2. **Konversi** Steps → React Flow untuk UI storage
3. **Simpan** Steps di `flow_data` dan React Flow di `ui_data`

## Response

### Success (200)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow updated",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "Updated User Registration Flow",
    "description": "Updated description with additional verification step",
    "project_id": "proj_123",
    "collection_id": "col_456",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 12:00:00"
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
  "message": "Invalid flow format: Step missing required field 'id'"
}
```

### Error (400) - Variable Reference Errors
```json
{
  "status": "error",
  "message": "Invalid variable references: Step 0: Invalid field name 'invalid-field' in reference 'step.invalid-field'"
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Flow not found"
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Use Cases

### 1. **API Script Updates**
```bash
# Update automation script dengan new step
PUT /gassapi2/backend/?act=flow_update&id=flow_123
Content-Type: application/json

{
  "flow_data": {
    "version": "1.0",
    "steps": [
      {"id": "step1", "method": "POST", ...},
      {"id": "new_step", "method": "GET", "url": "{{step1.output}}"}
    ]
  }
}
```

### 2. **CI/CD Pipeline Updates**
```javascript
// Update flow deployment configuration
const updateFlowConfig = async (flowId, newConfig) => {
  const response = await fetch(`/gassapi2/backend/?act=flow_update&id=${flowId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      flow_data: {
        version: "1.0",
        steps: newConfig.steps,
        config: newConfig.config
      }
    })
  });

  return response.json();
};
```

### 3. **Dynamic Input Updates**
```json
{
  "flow_inputs": [
    {
      "name": "environment",
      "type": "string",
      "required": true,
      "validation": {
        "allowed_values": ["dev", "staging", "prod"]
      }
    }
  ],
  "flow_data": {
    "steps": [
      {
        "url": "https://{{input.environment}}.api.example.com/endpoint"
      }
    ]
  }
}
```

## Format Comparison

| Endpoint | Format | Use Case |
|----------|--------|----------|
| `PUT /flow/{id}` | **Steps** | API automation, CI/CD, execution updates |
| `PUT /flow/{id}/ui` | **React Flow** | Visual UI updates, drag-drop editors |

## Validation Rules

System akan validasi:
1. **Flow Inputs**: Format, types, validation rules
2. **Steps Format**: Required fields, valid structure
3. **Variable References**: `{{type.field}}` format dan dependencies

## Update Strategies

### 1. **Incremental Updates**
```json
// Update hanya field yang berubah
{
  "name": "New name only"
}
```

### 2. **Complete Replacement**
```json
// Replace seluruh flow configuration
{
  "flow_data": {
    "version": "1.0",
    "steps": [/* new steps */],
    "config": { /* new config */ }
  }
}
```

### 3. **Conditional Steps**
```json
{
  "flow_data": {
    "steps": [
      {
        "id": "check_condition",
        "condition": "{{input.role}} === 'admin'",
        "trueLabel": "Admin Path",
        "falseLabel": "User Path"
      }
    ]
  }
}
```

## Authorization
- User harus menjadi member dari project yang memiliki flow ini
- Collection harus berada dalam project yang sama

## Example
```bash
PUT /gassapi2/backend/?act=flow_update&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Updated User Registration Flow",
  "flow_data": {
    "version": "1.0",
    "steps": [
      {
        "id": "register",
        "name": "Register User",
        "method": "POST",
        "url": "{{env.API_URL}}/auth/register"
      }
    ]
  }
}

# Response: Steps tersimpan, UI data otomatis di-generate
{
  "data": {
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}"
  }
}
```

## Related Documentation
- [UI Endpoints](ui-endpoints.md) - For React Flow format updates
- [Validation](validation.md) - Complete validation rules
- [Format Conversion](format-conversion.md) - Automatic conversion logic
