# Logout

## Endpoint
`POST /logout`

## Description
Logout user dari device saat ini.

## Headers
```
Authorization: Bearer {access_token}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Logout successful"
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
- Token akan di-blacklist
- Refresh token juga dihapus