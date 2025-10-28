# Create Project

## Endpoint
`POST /projects`

## Description
Membuat project baru. Otomatis membuat environment default "development".

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Request Body
```json
{
  "name": "My Project",
  "description": "Optional description"
}
```

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Project created successfully",
  "data": {
    "id": "proj_...",
    "name": "My Project",
    "description": "Optional description",
    "owner_id": "user_...",
    "is_public": 0
  },
  "timestamp": "2025-10-23 03:00:00"
}
```

## Example
```
POST /gassapi2/backend/?act=projects
{
  "name": "My Project"
}
```