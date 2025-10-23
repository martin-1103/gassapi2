# List Collections

## Endpoint
`GET /project/{id}/collections`

## Description
Mengambil daftar semua collections dalam project.

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
  "message": "Collections fetched",
  "data": [
    {
      "id": "col_a1b2c3d4e5f6g7h8",
      "name": "User API",
      "description": "User management endpoints",
      "project_id": "proj_123",
      "parent_id": null,
      "headers": "{\"Content-Type\":\"application/json\"}",
      "variables": "{\"base_url\":\"https://api.example.com\"}",
      "is_default": 1,
      "created_by": "user_xyz",
      "created_at": "2025-10-23 10:30:00",
      "updated_at": "2025-10-23 10:30:00"
    },
    {
      "id": "col_b2c3d4e5f6g7h8i9",
      "name": "Auth API",
      "description": "Authentication endpoints",
      "project_id": "proj_123",
      "parent_id": null,
      "headers": "{}",
      "variables": "{}",
      "is_default": 0,
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

## Authorization
- User harus menjadi member dari project

## Example
```bash
GET /gassapi2/backend/?act=collections&id=proj_123
Authorization: Bearer eyJhbGc...
```
