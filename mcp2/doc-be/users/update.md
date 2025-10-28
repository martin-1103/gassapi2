# Update User

## Endpoint
`PUT /user/{id}`

## Description
Update data user.

## Headers
```
Authorization: Bearer {access_token}
```

## URL Parameters
- `id`: User ID (integer)

## Request Body
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "role": "admin",
  "is_active": true
}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "admin",
    "is_active": true,
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

## Validation Rules
- `name`: Optional, min 2 characters
- `email`: Optional, valid email, unique
- `role`: Optional (user/admin)
- `is_active`: Optional (true/false)

## Notes
- User hanya bisa update data dirinya sendiri
- Admin bisa update semua user
- Update role hanya untuk admin