# Update Flow

## Endpoint
`PUT /flow/{id}`

## Description
Mengupdate data flow. Semua field bersifat optional.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID flow

## Request Body
```json
{
  "name": "Updated User Registration Flow",
  "description": "Updated description",
  "collection_id": "col_456",
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
      },
      {
        "id": "node_3",
        "type": "endpoint",
        "data": {
          "endpoint_id": "ep_login",
          "name": "Login User"
        },
        "position": { "x": 500, "y": 100 }
      }
    ],
    "edges": [
      {
        "id": "edge_1",
        "source": "node_1",
        "target": "node_2"
      },
      {
        "id": "edge_2",
        "source": "node_2",
        "target": "node_3"
      }
    ]
  },
  "is_active": false
}
```

### Fields (All Optional)
- `name`: Nama flow baru
- `description`: Deskripsi baru
- `collection_id`: ID collection baru (harus dalam project yang sama)
- `flow_data`: Flow configuration baru
- `is_active`: Status aktif baru

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Flow updated",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "Updated User Registration Flow",
    "description": "Updated description",
    "project_id": "proj_123",
    "collection_id": "col_456",
    "flow_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 0,
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 12:00:00"
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

## Example
```bash
PUT /gassapi2/backend/?act=flow_update&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

{
  "name": "Updated User Registration Flow",
  "is_active": false
}
```
