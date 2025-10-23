# User Statistics

## Endpoint
`GET /users/stats`

## Description
Mendapatkan statistik user.

## Headers
```
Authorization: Bearer {access_token}
```

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_users": 150,
    "active_users": 120,
    "inactive_users": 30,
    "new_users_this_month": 25,
    "users_by_role": {
      "admin": 5,
      "user": 145
    }
  }
}
```

## Notes
- Memerlukan access token valid
- Hanya admin yang bisa akses
- Data real-time dari database