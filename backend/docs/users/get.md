# Get User

## Endpoint
`GET /user/{id}`

## Description
Mendapatkan detail user berdasarkan ID.

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
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
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

## Example
```
GET /gassapi/backend-php?act=user&id=1
```

## Notes
- User hanya bisa akses data dirinya sendiri
- Admin bisa akses semua user