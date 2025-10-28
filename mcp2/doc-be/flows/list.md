# List Flows

## Endpoint
`GET /project/{id}/flows`

## Description
Mengambil daftar semua flows dalam project dengan metadata penting. Response mengembalikan informasi flow tanpa flow data lengkap untuk performance optimization.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID project

## Response

### Success (200)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flows fetched",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": [
    {
      "id": "flow_a1b2c3d4e5f6g7h8",
      "name": "User Registration Flow",
      "description": "Complete user registration and verification flow",
      "project_id": "proj_123",
      "folder_id": "fld_123",
      "folder_name": "User API",
      "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true},{\"name\":\"email\",\"type\":\"email\",\"required\":true},{\"name\":\"password\",\"type\":\"password\",\"required\":true}]",
      "step_count": 2,
      "format_type": "steps",
      "is_active": 1,
      "created_by": "user_xyz",
      "created_at": "2025-10-25 10:30:00",
      "updated_at": "2025-10-25 10:30:00"
    },
    {
      "id": "flow_b2c3d4e5f6g7h8i9",
      "name": "Login Flow",
      "description": "User authentication flow with token refresh",
      "project_id": "proj_123",
      "folder_id": "fld_456",
      "folder_name": "Auth API",
      "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true},{\"name\":\"password\",\"type\":\"password\",\"required\":true}]",
      "step_count": 3,
      "format_type": "steps",
      "is_active": 0,
      "created_by": "user_abc",
      "created_at": "2025-10-25 11:00:00",
      "updated_at": "2025-10-25 11:00:00"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total": 2,
    "total_pages": 1,
    "has_next": false,
    "has_prev": false
  }
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Project not found"
}
```

## Response Fields

### Flow Metadata
- **`id`**: Unique flow identifier
- **`name`**: Flow name
- **`description`**: Flow description
- **`project_id`**: Parent project ID
- **`folder_id`**: Associated folder ID
- **`folder_name`**: Folder name for display
- **`flow_inputs`**: JSON string of input definitions (summary only, needs parsing)
- **`step_count`**: Total number of steps in flow
- **`format_type`**: Storage format (`steps` atau `react_flow`)
- **`is_active`**: Active status (1 = active, 0 = inactive)

**Note**: `flow_inputs` dikembalikan sebagai JSON string, bukan array. Frontend perlu melakukan parse JSON.

### Pagination
- **`current_page`**: Current page number
- **`per_page`**: Items per page
- **`total`**: Total flows count
- **`total_pages`**: Total pages
- **`has_next`**: Has next page
- **`has_prev`**: Has previous page

## Query Parameters

### Filtering
```bash
# Filter by active status
GET /project/{id}/flows?active=true

# Filter by folder
GET /project/{id}/flows?folder=fld_123

# Search by name/description
GET /project/{id}/flows?search=registration
```

### Pagination
```bash
# Pagination
GET /project/{id}/flows?page=2&per_page=10
```

### Sorting
```bash
# Sort by updated date (default)
GET /project/{id}/flows?sort=updated_at&order=desc

# Sort by name
GET /project/{id}/flows?sort=name&order=asc
```

## Alternative Endpoints

### Get Active Flows Only
`GET /project/{id}/flows/active`

Mengambil hanya flows yang aktif (`is_active = 1`).

```json
{
  "success": true,
  "message": "Active flows fetched",
  "data": [
    {
      "id": "flow_a1b2c3d4e5f6g7h8",
      "name": "User Registration Flow",
      "is_active": 1,
      "step_count": 2
    }
  ]
}
```

### Get Flow Statistics
`GET /project/{id}/flows/stats`

Mengambil statistik flows dalam project.

```json
{
  "success": true,
  "message": "Flow statistics",
  "data": {
    "total_flows": 2,
    "active_flows": 1,
    "inactive_flows": 1,
    "folders_with_flows": 2,
    "avg_steps_per_flow": 2.5,
    "recently_updated": [
      {
        "id": "flow_a1b2c3d4e5f6g7h8",
        "name": "User Registration Flow",
        "updated_at": "2025-10-25 10:30:00"
      }
    ]
  }
}
```

## Use Cases

### 1. **Flow Management UI**
```javascript
// Load flows untuk management interface
const loadFlows = async (projectId, filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/gassapi2/backend/?act=flows&id=${projectId}&${params}`);

  const result = await response.json();
  if (result.success) {
    displayFlows(result.data);
    updatePagination(result.pagination);
  }
};
```

### 2. **Flow Execution Selection**
```javascript
// Pilih flow untuk execution
const selectFlowForExecution = async (projectId) => {
  const response = await fetch(`/gassapi2/backend/?act=flows_active&id=${projectId}`);
  const result = await response.json();

  if (result.success && result.data.length > 0) {
    return result.data[0]; // Select first active flow
  }
  throw new Error('No active flows found');
};
```

### 3. **API Documentation**
```bash
# Get all flows untuk API docs generation
curl -X GET "${API_URL}/flows?id=${PROJECT_ID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  | jq '.data[] | {name, description, flow_inputs}'
```

## Performance Considerations

### 1. **Lazy Loading**
- Response tidak include `flow_data` lengkap
- Gunakan `GET /flow/{id}` untuk detail lengkap
- `flow_inputs` hanya summary fields

### 2. **Caching**
- Cache response untuk UI yang tidak berubah sering
- Invalidate cache saat flow dibuat/update/delete

### 3. **Pagination**
- Gunakan pagination untuk project dengan banyak flows
- Default `per_page = 20`, max `per_page = 100`

## Authorization
- User harus menjadi member dari project

## Example
```bash
# Get all flows
GET /gassapi2/backend/?act=flows&id=proj_123
Authorization: Bearer eyJhbGc...

# Get active flows only
GET /gassapi2/backend/?act=flows_active&id=proj_123
Authorization: Bearer eyJhbGc...

# Get flows with pagination and filters
GET /gassapi2/backend/?act=flows&id=proj_123&page=1&per_page=10&active=true&search=registration
Authorization: Bearer eyJhbGc...

# Response dengan pagination info
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

## Related Documentation
- [Get Flow](get.md) - Get detailed flow data
- [UI Endpoints](ui-endpoints.md) - For React Flow format access
- [Flow Inputs](flow-inputs.md) - Detailed input definitions
