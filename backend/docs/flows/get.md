# Get Flow

## Endpoint
`GET /flow/{id}`

## Description
Mengambil detail flow dalam **Steps format** untuk execution dan automation. Endpoint ini mengembalikan flow data dalam format yang siap untuk dijalankan oleh execution engines.

**🎨 Untuk React Flow Format**: Gunakan `GET /flow/{id}/ui` untuk mendapatkan flow dalam format visual UI.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response

### Success (200) - Steps Format
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow detail",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "folder_id": "fld_123",
    "folder_name": "User API",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true,\"validation\":{\"min_length\":3,\"max_length\":50},\"description\":\"Username untuk registrasi\"},{\"name\":\"email\",\"type\":\"email\",\"required\":true,\"description\":\"Email address user\"},{\"name\":\"password\",\"type\":\"password\",\"required\":true,\"validation\":{\"min_length\":8},\"description\":\"Password user\"}]",
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
            "activationToken": "response.body.activation_token"
          }
        },
        {
          "id": "verify_email",
          "name": "Verify Email",
          "method": "POST",
          "url": "{{env.API_URL}}/auth/verify-email",
          "body": {
            "token": "{{register.activationToken}}"
          }
        }
      ],
      "config": {
        "delay": 0,
        "retryCount": 1,
        "parallel": false
      }
    },
    "is_active": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 10:30:00"
  }
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

### 1. **API Automation**
```bash
# Get flow untuk execution engine
GET /gassapi2/backend/?act=flow&id=flow_123
Authorization: Bearer {token}

# Response siap untuk execution
{
  "steps": [
    {"id": "step1", "method": "POST", "url": "..."},
    {"id": "step2", "method": "GET", "url": "{{step1.output}}"}
  ]
}
```

### 2. **Flow Execution**
```javascript
// Execute flow dengan Steps format
const executeFlow = async (flowId, inputs) => {
  const response = await fetch(`/gassapi2/backend/?act=flow&id=${flowId}`);
  const flow = await response.json();

  // Parse inputs dan execute steps
  const results = await executeSteps(flow.data.flow_data.steps, inputs);

  return results;
};
```

### 3. **CI/CD Integration**
```yaml
# GitHub Actions example
- name: Execute API Flow
  run: |
    curl -X GET "${{ secrets.API_URL }}/flow/${{ flow_id }}" \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}" \
      | jq '.data.flow_data' > flow.json

    # Execute flow dengan automation tool
    flow-runner execute flow.json --input inputs.json
```

## Format Comparison

| Endpoint | Format | Use Case |
|----------|--------|----------|
| `GET /flow/{id}` | **Steps** | API automation, execution engines, CI/CD |
| `GET /flow/{id}/ui` | **React Flow** | Visual UI editors, drag-drop interfaces |

## Response Structure

### Flow Data Format
- **`version`**: Steps format version
- **`steps`**: Array of execution steps
- **`config`**: Execution configuration

### Flow Inputs
- **Format**: JSON string (perlu di-parse oleh frontend)
- **`name`**: Variable name untuk `{{input.name}}`
- **`type`**: Data type untuk validation
- **`required`**: Whether input is mandatory
- **`validation`**: Validation rules
- **`description`**: Help text for UI

**Note**: `flow_inputs` dikembalikan sebagai JSON string, bukan array. Frontend perlu melakukan parse JSON.

## Variable References
Steps format supports:
- **`{{input.field}}`**: Flow inputs
- **`{{stepId.output}}`**: Step outputs
- **`{{env.variable}}`**: Environment variables
- **`{{.headers.field}}`**: Request headers

## Authorization
- User harus menjadi member dari project yang memiliki flow ini

## Example
```bash
GET /gassapi2/backend/?act=flow&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

# Response: Steps format untuk execution
{
  "flow_data": {
    "version": "1.0",
    "steps": [...],
    "config": {...}
  }
}
```

## Related Documentation
- [UI Endpoints](ui-endpoints.md) - For React Flow format
- [Variable References](variable-references.md) - Variable reference patterns
- [Format Conversion](format-conversion.md) - React Flow ↔ Steps conversion
