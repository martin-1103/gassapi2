# Delete User

## Endpoint
`DELETE /user/{id}`

## Description
Hapus user.

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
  "message": "User deleted successfully"
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
  "message": "Cannot delete yourself",
  "code": 403
}
```

## Example
```
DELETE /gassapi/backend-php?act=user_delete&id=1
```

## Notes
- Hanya admin yang bisa hapus user
- Admin tidak bisa hapus dirinya sendiri
- Soft delete (data tidak benar-benar dihapus)