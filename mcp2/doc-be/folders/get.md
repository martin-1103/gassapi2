# Get Folder

## Endpoint
`GET /folder/{id}`

## Description
Mengambil detail folder berdasarkan ID.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID folder

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Folder detail",
  "data": {
    "id": "fld_a1b2c3d4e5f6g7h8",
    "name": "User API",
    "description": "User management endpoints",
    "project_id": "proj_123",
    "parent_id": null,
    "headers": "{\"Content-Type\":\"application/json\",\"X-API-Key\":\"{{api_key}}\"}",
    "variables": "{\"base_url\":\"https://api.example.com\",\"api_key\":\"secret123\"}",
    "is_default": 1,
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
  "message": "Folder not found"
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
- User harus menjadi member dari project yang memiliki folder ini

## Example
```bash
GET /gassapi2/backend/?act=folder&id=fld_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
