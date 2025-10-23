# Update Collection

## Endpoint
`PUT /collection/{id}`

## Description
Mengupdate data collection. Semua field bersifat optional.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID collection

## Request Body
```json
{
  "name": "User Management API",
  "description": "Updated description",
  "parent_id": "col_parent123",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer {{token}}"
  },
  "variables": {
    "base_url": "https://api.example.com/v2",
    "api_version": "2.0"
  },
  "is_default": true
}
```

### Fields (All Optional)
- `name`: Nama collection baru
- `description`: Deskripsi baru
- `parent_id`: ID parent collection baru
- `headers`: Default headers baru
- `variables`: Variables baru
- `is_default`: Set sebagai default collection

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Collection updated",
  "data": {
    "id": "col_a1b2c3d4e5f6g7h8",
    "name": "User Management API",
    "description": "Updated description",
    "project_id": "proj_123",
    "parent_id": "col_parent123",
    "headers": "{\"Content-Type\":\"application/json\"}",
    "variables": "{\"base_url\":\"https://api.example.com/v2\"}",
    "is_default": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 12:00:00"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Collection not found"
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
- User harus menjadi member dari project yang memiliki collection ini

## Notes
- Jika `is_default` di-set true, collection lain dalam project akan otomatis di-unset

## Example
```bash
PUT /gassapi2/backend/?act=collection_update&id=col_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

{
  "name": "User Management API",
  "is_default": true
}
```
