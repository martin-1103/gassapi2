# Get Endpoint

## Endpoint
`GET /endpoint/{id}`

## Description
Mengambil detail endpoint berdasarkan ID. Response includes collection and project info.

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
  "message": "Endpoint detail",
  "data": {
    "id": "ep_a1b2c3d4e5f6g7h8",
    "name": "Get User",
    "method": "GET",
    "url": "{{base_url}}/users/{{user_id}}",
    "headers": "{\"Authorization\":\"Bearer {{token}}\",\"Accept\":\"application/json\"}",
    "body": null,
    "collection_id": "col_123",
    "collection_name": "User API",
    "project_id": "proj_456",
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 10:30:00"
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

## Example
```bash
GET /gassapi2/backend/?act=endpoint&id=ep_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
```
