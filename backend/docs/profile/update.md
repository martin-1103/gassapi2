# Update Profile

## Endpoint
`POST /profile`

## Description
Update profile user yang sedang login.

## Headers
```
Authorization: Bearer {access_token}
```

## Request Body
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

### Error (400)
```json
{
  "success": false,
  "message": "Email already exists",
  "code": 400
}
```

## Validation Rules
- `name`: Optional, min 2 characters
- `email`: Optional, valid email, unique

## Notes
- Memerlukan access token valid
- User hanya bisa update profile dirinya sendiri
- Email tetap harus unique