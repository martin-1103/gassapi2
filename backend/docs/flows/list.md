# List Flows

## Endpoint
`GET /project/{id}/flows`

## Description
Mengambil daftar semua flows dalam project.

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
  "status": "success",
  "message": "Flows fetched",
  "data": [
    {
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
    },
    {
      "id": "flow_b2c3d4e5f6g7h8i9",
      "name": "Login Flow",
      "description": "User authentication flow",
      "project_id": "proj_123",
      "collection_id": "col_456",
      "flow_data": "{\"nodes\":[...],\"edges\":[...]}",
      "is_active": 0,
      "created_by": "user_abc",
      "created_at": "2025-10-23 11:00:00",
      "updated_at": "2025-10-23 11:00:00"
    }
  ]
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Alternative Endpoint
### Get Active Flows Only
`GET /project/{id}/flows/active`

Mengambil hanya flows yang aktif (is_active = 1).

Response sama seperti endpoint utama, tapi hanya menampilkan flows dengan `is_active: 1`.

## Authorization
- User harus menjadi member dari project

## Example
```bash
GET /gassapi2/backend/?act=flows&id=proj_123
Authorization: Bearer eyJhbGc...
```

### Get Active Flows
```bash
GET /gassapi2/backend/?act=flows_active&id=proj_123
Authorization: Bearer eyJhbGc...
```
