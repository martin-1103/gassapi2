# Duplicate Flow

## Endpoint
`POST /flow/{id}/duplicate`

## Description
Menduplikasi flow yang sudah ada. Flow baru akan dibuat dengan status inactive (is_active = 0).

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID flow yang akan diduplikasi

## Request Body (Optional)
```json
{
  "name": "Custom Name for Duplicated Flow"
}
```

### Fields
- `name` (optional): Nama untuk flow yang diduplikasi. Jika tidak diberikan, akan menggunakan nama asli + " (Copy)"

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Flow duplicated",
  "data": {
    "id": "flow_c3d4e5f6g7h8i9j0",
    "name": "User Registration Flow (Copy)",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "collection_id": "col_123",
    "flow_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 0,
    "created_by": "user_xyz",
    "created_at": "2025-10-23 12:30:00",
    "updated_at": "2025-10-23 12:30:00"
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
- Flow yang diduplikasi akan memiliki ID baru
- Status default adalah inactive (is_active = 0)
- Semua data flow_data akan disalin
- created_by akan tetap sama dengan flow asli

## Use Cases
- Membuat variasi dari flow yang sudah ada
- Testing flow dengan modifikasi tanpa mengubah yang asli
- Template flow untuk scenario serupa

## Example
```bash
POST /gassapi2/backend/?act=flow_duplicate&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

{
  "name": "User Registration Flow - Test Version"
}
```
