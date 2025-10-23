# Create Endpoint

## Endpoint
`POST /collection/{id}/endpoints`

## Description
Membuat endpoint baru dalam collection. Endpoint merepresentasikan single API call.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID collection

## Request Body
```json
{
  "name": "Get User",
  "method": "GET",
  "url": "{{base_url}}/users/{{user_id}}",
  "headers": {
    "Authorization": "Bearer {{token}}",
    "Accept": "application/json"
  },
  "body": null
}
```

### Fields
- `name` (required): Nama endpoint
- `method` (required): HTTP method (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- `url` (required): URL endpoint (dapat menggunakan variables dengan syntax {{variable}})
- `headers` (optional): Request headers
- `body` (optional): Request body (untuk POST, PUT, PATCH)

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Endpoint created",
  "data": {
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

## Authorization
- User harus menjadi member dari project yang memiliki collection ini

## Example
```bash
POST /gassapi2/backend/?act=endpoint_create&id=col_123
Authorization: Bearer eyJhbGc...

{
  "name": "Create User",
  "method": "POST",
  "url": "{{base_url}}/users",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
