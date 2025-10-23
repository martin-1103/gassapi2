# Login

## Endpoint
`POST /login`

## Description
Autentikasi user dengan email dan password.

## Request Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "user@example.com",
      "role": "user"
    },
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "expires_in": 3600
  }
}
```

### Error (401)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "code": 401
}
```

## Validation Rules
- `email`: Required, valid email format
- `password`: Required, min 6 characters