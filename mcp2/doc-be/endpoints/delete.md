# Delete Endpoint

## Endpoint
`DELETE /endpoint/{id}`

## Description
Menghapus endpoint dari folder.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID endpoint

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Endpoint deleted",
  "data": {
    "id": "ep_a1b2c3d4e5f6g7h8"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Endpoint not found"
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
- User harus menjadi member dari project yang memiliki endpoint ini

## Side Effects
- Endpoint akan dihapus dari folder
- Flow yang menggunakan endpoint ini mungkin tidak berfungsi dengan baik

## Example
```bash
DELETE /gassapi2/backend/?act=endpoint_delete&id=ep_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
