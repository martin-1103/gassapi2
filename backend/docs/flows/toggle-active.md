# Toggle Flow Active Status

## Endpoint
`PUT /flow/{id}/toggle-active`

## Description
Toggle status aktif/nonaktif flow. Jika aktif akan menjadi nonaktif, dan sebaliknya.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response
### Success (200) - Activated
```json
{
  "status": "success",
  "message": "Flow activated",
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
    "updated_at": "2025-10-23 12:00:00"
  }
}
```

### Success (200) - Deactivated
```json
{
  "status": "success",
  "message": "Flow deactivated",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "collection_id": "col_123",
    "flow_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 0,
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

## Use Cases
- Menonaktifkan flow yang sedang dalam development
- Mengaktifkan flow yang sudah siap digunakan
- Temporary disable flow tanpa menghapus

## Alternative
Anda juga bisa menggunakan `PUT /flow/{id}` dengan body `{"is_active": true/false}` untuk set status secara eksplisit.

## Example
```bash
PUT /gassapi2/backend/?act=flow_toggle_active&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
