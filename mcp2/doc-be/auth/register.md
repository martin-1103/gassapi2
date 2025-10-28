# Register

## Endpoint
`POST /register`

## Description
Registrasi user baru.

## Request Body
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

## Response
### Success (201)
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user",
      "created_at": "2025-01-01T00:00:00Z"
    }
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
- `name`: Required, min 2 characters
- `email`: Required, valid email, unique
- `password`: Required, min 6 characters
- `password_confirmation`: Required, match with password