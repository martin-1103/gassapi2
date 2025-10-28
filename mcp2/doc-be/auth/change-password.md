# Change Password

## Endpoint
`POST /change-password`

## Description
Ubah password user yang sedang login.

## Headers
```
Authorization: Bearer {access_token}
```

## Request Body
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error (400)
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "code": 400
}
```

## Validation Rules
- `current_password`: Required
- `new_password`: Required, min 6 characters
- `password_confirmation`: Required, match with new_password

## Notes
- Memerlukan access token valid
- Current password harus benar
- Semua refresh token akan dihapus (kecuali current)