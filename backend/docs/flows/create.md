# Create Flow

## Endpoint
`POST /project/{id}/flows`

## Description
Membuat flow baru untuk project. Flow merepresentasikan automation atau test scenario yang terdiri dari multiple API calls.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID project

## Request Body
```json
{
  "name": "User Registration Flow",
  "description": "Complete user registration and verification flow",
  "collection_id": "col_123",
  "flow_data": {
    "nodes": [
      {
        "id": "node_1",
        "type": "endpoint",
        "data": {
          "endpoint_id": "ep_register",
          "name": "Register User"
        },
        "position": { "x": 100, "y": 100 }
      },
      {
        "id": "node_2",
        "type": "endpoint",
        "data": {
          "endpoint_id": "ep_verify",
          "name": "Verify Email"
        },
        "position": { "x": 300, "y": 100 }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2"
      }
    ]
  },
  "is_active": true
}
```

### Fields
- `name` (required): Nama flow
- `description` (optional): Deskripsi flow
- `collection_id` (optional): ID collection yang terkait
- `flow_data` (optional): Flow configuration (nodes & edges untuk React Flow)
- `is_active` (optional): Status aktif flow (default: true)

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
    "collection_id": "col_123",
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
  "message": "Collection does not belong to this project"
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
