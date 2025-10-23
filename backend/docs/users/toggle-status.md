# Toggle User Status

## Endpoint
`PUT /user/{id}/toggle-status`

## Description
Aktifkan/nonaktifkan user.

## Headers
```
Authorization: Bearer {access_token}
```

## URL Parameters
- `id`: User ID (integer)

## Response
### Success (200)
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": 1,
    "is_active": false,
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

### Error (404)
```json
{
  "success": false,
  "message": "User not found",
  "code": 404
}
```

### Error (403)
```json
{
  "success": false,
  "message": "Cannot deactivate yourself",
  "code": 403
}
```

## Example
```
PUT /gassapi/backend-php?act=toggle_status&id=1
```

## Notes
- Hanya admin yang bisa toggle status
- Admin tidak bisa nonaktifkan dirinya sendiri
- User nonaktif tidak bisa login