# Get Profile

## Endpoint
`GET /profile`

## Description
Mendapatkan profile user yang sedang login.

## Headers
```
Authorization: Bearer {access_token}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "last_login": "2025-01-20T08:15:00Z"
  }
}
```

### Error (401)
```json
{
  "success": false,
  "message": "Unauthorized",
  "code": 401
}
```

## Notes
- Memerlukan access token valid
- Mengembalikan data lengkap user
- Termasuk informasi login terakhir