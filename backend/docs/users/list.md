# List Users

## Endpoint
`GET /users`

## Description
Mendapatkan daftar semua user dengan pagination dan filter.

## Headers
```
Authorization: Bearer {access_token}
```

## Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by name or email
- `active_only`: Show only active users (true/false, default: false)

## Response
### Success (200)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## Example
```
GET /gassapi/backend-php?act=users&page=1&limit=10&search=john&active_only=true
```