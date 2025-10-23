# Logout All

## Endpoint
`POST /logout-all`

## Description
Logout user dari semua device.

## Headers
```
Authorization: Bearer {access_token}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Logged out from all devices"
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
- Semua refresh token user akan dihapus
- User harus login kembali di semua device