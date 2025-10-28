# Delete Folder

## Endpoint
`DELETE /folder/{id}`

## Description
Menghapus folder beserta semua endpoints di dalamnya (cascade delete).

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID folder

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Folder deleted",
  "data": {
    "id": "fld_a1b2c3d4e5f6g7h8"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Folder not found"
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
- User harus menjadi member dari project yang memiliki folder ini

## Side Effects
- Semua endpoints dalam folder ini akan ikut terhapus (CASCADE DELETE)
- Child folders (jika ada) akan ikut terhapus

## Example
```bash
DELETE /gassapi2/backend/?act=folder_delete&id=fld_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
