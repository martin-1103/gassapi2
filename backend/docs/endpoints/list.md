# List Endpoints

## Endpoint
`GET /collection/{id}/endpoints`

## Description
Mengambil daftar semua endpoints dalam collection.

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
  "message": "Endpoints fetched",
  "data": [
    {
      "id": "ep_a1b2c3d4e5f6g7h8",
      "name": "Get User",
      "method": "GET",
      "url": "{{base_url}}/users/{{user_id}}",
      "headers": "{\"Authorization\":\"Bearer {{token}}\"}",
      "body": null,
      "collection_id": "col_123",
      "created_by": "user_xyz",
      "created_at": "2025-10-23 10:30:00",
      "updated_at": "2025-10-23 10:30:00"
    },
    {
      "id": "ep_b2c3d4e5f6g7h8i9",
      "name": "Create User",
      "method": "POST",
      "url": "{{base_url}}/users",
      "headers": "{\"Content-Type\":\"application/json\"}",
      "body": "{\"name\":\"{{name}}\",\"email\":\"{{email}}\"}",
      "collection_id": "col_123",
      "created_by": "user_abc",
      "created_at": "2025-10-23 11:00:00",
      "updated_at": "2025-10-23 11:00:00"
    }
  ]
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Collection not found"
}
```

## Alternative Endpoints
### Get All Endpoints by Project
`GET /project/{id}/endpoints`

Mengambil semua endpoints dari semua collections dalam project.

### Get Grouped Endpoints
`GET /project/{id}/endpoints/grouped`

Mengambil endpoints yang dikelompokkan berdasarkan collection.

Response:
```json
{
  "status": "success",
  "message": "Grouped endpoints fetched",
  "data": [
    {
      "collection_id": "col_123",
      "collection_name": "User API",
      "endpoints": [...]
    },
    {
      "collection_id": "col_456",
      "collection_name": "Auth API",
      "endpoints": [...]
    }
  ]
}
```

## Authorization
- User harus menjadi member dari project yang memiliki collection ini

## Example
```bash
GET /gassapi2/backend/?act=endpoints&id=col_123
Authorization: Bearer eyJhbGc...
```
