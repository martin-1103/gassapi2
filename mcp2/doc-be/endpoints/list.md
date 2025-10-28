# List Endpoints

## Endpoint
`GET /folder/{id}/endpoints`

## Description
Mengambil daftar semua endpoints dalam folder.

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
  "message": "Endpoints fetched",
  "data": [
    {
      "id": "ep_a1b2c3d4e5f6g7h8",
      "name": "Get User",
      "method": "GET",
      "url": "{{base_url}}/users/{{user_id}}",
      "headers": "{\"Authorization\":\"Bearer {{token}}\"}",
      "body": null,
      "folder_id": "fld_123",
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
      "folder_id": "fld_123",
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
  "message": "Folder not found"
}
```

## Alternative Endpoints
### Get All Endpoints by Project
`GET /project/{id}/endpoints`

Mengambil semua endpoints dari semua folders dalam project.

### Get Grouped Endpoints
`GET /project/{id}/endpoints/grouped`

Mengambil endpoints yang dikelompokkan berdasarkan folder.

Response:
```json
{
  "status": "success",
  "message": "Grouped endpoints fetched",
  "data": [
    {
      "folder_id": "fld_123",
      "folder_name": "User API",
      "endpoints": [...]
    },
    {
      "folder_id": "fld_456",
      "folder_name": "Auth API",
      "endpoints": [...]
    }
  ]
}
```

## Authorization
- User harus menjadi member dari project yang memiliki folder ini

## Example
```bash
GET /gassapi2/backend/?act=endpoints&id=fld_123
Authorization: Bearer eyJhbGc...
```
