# Create Folder

## Endpoint
`POST /project/{id}/folders`

## Description
Membuat folder baru untuk project. Folder digunakan untuk mengelompokkan endpoints.

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
- `name` (required): Nama folder
- `description` (optional): Deskripsi folder
- `parent_id` (optional): ID parent folder untuk nested folders
- `headers` (optional): Default headers untuk semua endpoints di folder ini
- `variables` (optional): Variables yang dapat digunakan di endpoints
- `is_default` (optional): Set sebagai default folder (default: false)

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Folder created",
  "data": {
    "id": "fld_a1b2c3d4e5f6g7h8",
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
POST /gassapi2/backend/?act=folder_create&id=proj_123
Authorization: Bearer eyJhbGc...

{
  "name": "User API",
  "description": "User management endpoints",
  "headers": {
    "Content-Type": "application/json"
  }
}
```
