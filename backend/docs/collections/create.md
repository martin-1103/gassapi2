# Create Collection

## Endpoint
`POST /project/{id}/collections`

## Description
Membuat collection baru untuk project. Collection digunakan untuk mengelompokkan endpoints.

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
  "name": "User API",
  "description": "User management endpoints",
  "parent_id": null,
  "headers": {
    "Content-Type": "application/json",
    "X-API-Key": "{{api_key}}"
  },
  "variables": {
    "base_url": "https://api.example.com"
  },
  "is_default": false
}
```

### Fields
- `name` (required): Nama collection
- `description` (optional): Deskripsi collection
- `parent_id` (optional): ID parent collection untuk nested collections
- `headers` (optional): Default headers untuk semua endpoints di collection ini
- `variables` (optional): Variables yang dapat digunakan di endpoints
- `is_default` (optional): Set sebagai default collection (default: false)

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Collection created",
  "data": {
    "id": "col_a1b2c3d4e5f6g7h8",
    "name": "User API",
    "description": "User management endpoints",
    "project_id": "proj_123",
    "parent_id": null,
    "headers": "{\"Content-Type\":\"application/json\"}",
    "variables": "{\"base_url\":\"https://api.example.com\"}",
    "is_default": 0,
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
  "message": "Name is required"
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
POST /gassapi2/backend/?act=collection_create&id=proj_123
Authorization: Bearer eyJhbGc...

{
  "name": "User API",
  "description": "User management endpoints",
  "headers": {
    "Content-Type": "application/json"
  }
}
```
