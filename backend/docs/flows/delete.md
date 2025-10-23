# Delete Flow

## Endpoint
`DELETE /flow/{id}`

## Description
Menghapus flow dari project.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Flow deleted",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Flow not found"
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

## Authorization
- User harus menjadi member dari project yang memiliki flow ini

## Side Effects
- Flow akan dihapus dari database
- Test history terkait flow ini akan tetap ada (tidak cascade delete)

## Example
```bash
DELETE /gassapi2/backend/?act=flow_delete&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
