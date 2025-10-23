# Update Endpoint

## Endpoint
`PUT /endpoint/{id}`

## Description
Mengupdate data endpoint. Semua field bersifat optional.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID endpoint

## Request Body
```json
{
  "name": "Get User by ID",
  "method": "GET",
  "url": "{{base_url}}/api/v2/users/{{user_id}}",
  "headers": {
    "Authorization": "Bearer {{token}}",
    "Accept": "application/json",
    "X-API-Version": "2.0"
  },
  "body": null
}
```

### Fields (All Optional)
- `name`: Nama endpoint baru
- `method`: HTTP method baru (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- `url`: URL baru
- `headers`: Request headers baru
- `body`: Request body baru

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Endpoint updated",
  "data": {
    "id": "ep_a1b2c3d4e5f6g7h8",
    "name": "Get User by ID",
    "method": "GET",
    "url": "{{base_url}}/api/v2/users/{{user_id}}",
    "headers": "{\"Authorization\":\"Bearer {{token}}\"}",
    "body": null,
    "collection_id": "col_123",
    "created_by": "user_xyz",
    "created_at": "2025-10-23 10:30:00",
    "updated_at": "2025-10-23 12:00:00"
  }
}
```

### Error (400)
```json
{
  "status": "error",
  "message": "Invalid HTTP method"
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
PUT /gassapi2/backend/?act=endpoint_update&id=ep_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

{
  "name": "Get User by ID",
  "url": "{{base_url}}/api/v2/users/{{user_id}}"
}
```
