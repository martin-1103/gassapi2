# Refresh Token

## Endpoint
`POST /refresh`

## Description
Refresh access token menggunakan refresh token.

## Request Body
```json
{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
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
  "message": "Invalid or expired refresh token",
  "code": 401
}
```

## Validation Rules
- `refresh_token`: Required, valid token