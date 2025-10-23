# Get Flow

## Endpoint
`GET /flow/{id}`

## Description
Mengambil detail flow berdasarkan ID. Response includes collection info if available.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Flow detail",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "collection_id": "col_123",
    "collection_name": "User API",
    "flow_data": "{\"nodes\":[{\"id\":\"node_1\",\"type\":\"endpoint\",\"data\":{\"endpoint_id\":\"ep_register\"},\"position\":{\"x\":100,\"y\":100}}],\"edges\":[{\"id\":\"edge_1\",\"source\":\"node_1\",\"target\":\"node_2\"}]}",
    "is_active": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 10:30:00"
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

## Authorization
- User harus menjadi member dari project yang memiliki flow ini

## Notes
- `flow_data` adalah JSON string yang berisi nodes dan edges untuk React Flow
- Parse JSON untuk mendapatkan flow visualization data

## Example
```bash
GET /gassapi2/backend/?act=flow&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
