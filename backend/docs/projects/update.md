# Update Project

## Endpoint
`PUT /project/{id}`

## Description
Mengubah informasi project (name, description, is_public). Hanya owner.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID project

## Request Body
```json
{
  "name": "Renamed Project",
  "description": "New description",
  "is_public": true
}
```

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Project updated",
  "data": { "id": "proj_...", "name": "Renamed Project" }
}
```

## Example
```
PUT /gassapi2/backend/?act=project_update&id=proj_123
{ "name": "Renamed Project" }
```