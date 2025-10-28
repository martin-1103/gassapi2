# List Projects

## Endpoint
`GET /projects`

## Description
Mendapatkan daftar project yang dimiliki atau diikuti oleh user (owner atau member).

## Headers
```
Authorization: Bearer {access_token}
```

## Query Parameters
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah item per halaman (default: 50)

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Projects fetched",
  "data": [
    {
      "id": "proj_...",
      "name": "My Project",
      "description": "...",
      "owner_id": "user_...",
      "is_public": 0,
      "created_at": "2025-10-23 03:00:00"
    }
  ],
  "timestamp": "2025-10-23 03:00:00"
}
```

## Example
```
GET /gassapi2/backend/?act=projects
```