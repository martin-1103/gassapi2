# Delete Collection

## Endpoint
`DELETE /collection/{id}`

## Description
Menghapus collection beserta semua endpoints di dalamnya (cascade delete).

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID collection

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Collection deleted",
  "data": {
    "id": "col_a1b2c3d4e5f6g7h8"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Collection not found"
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
- User harus menjadi member dari project yang memiliki collection ini

## Side Effects
- Semua endpoints dalam collection ini akan ikut terhapus (CASCADE DELETE)
- Child collections (jika ada) akan ikut terhapus

## Example
```bash
DELETE /gassapi2/backend/?act=collection_delete&id=col_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
