# Get Project

## Endpoint
`GET /project/{id}`

## Description
Mendapatkan detail project. Hanya dapat diakses oleh owner atau member.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID project

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Project detail",
  "data": {
    "id": "proj_...",
    "name": "My Project",
    "description": null,
    "owner_id": "user_...",
    "member_count": 1
  },
  "timestamp": "2025-10-23 03:00:00"
}
```

## Example
```
GET /gassapi2/backend/?act=project&id=proj_123
```