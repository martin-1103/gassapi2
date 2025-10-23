# Delete Project

## Endpoint
`DELETE /project/{id}`

## Description
Menghapus project. Hanya owner.

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
  "message": "Project deleted",
  "data": { "id": "proj_..." }
}
```

## Example
```
DELETE /gassapi2/backend/?act=project_delete&id=proj_123
```