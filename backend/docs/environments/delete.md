# Delete Environment

## Endpoint
`DELETE /environment/{id}`

## Description
Menghapus environment. Tidak dapat menghapus environment terakhir pada project.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID environment

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Environment deleted",
  "data": { "id": "env_..." }
}
```

## Example
```
DELETE /gassapi2/backend/?act=environment_delete&id=env_123
```