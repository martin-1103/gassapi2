# Get Environment

## Endpoint
`GET /environment/{id}`

## Description
Mendapatkan detail environment.

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
  "message": "Environment detail",
  "data": {
    "id": "env_...",
    "project_id": "proj_...",
    "name": "development",
    "is_default": 1
  }
}
```

## Example
```
GET /gassapi2/backend/?act=environment&id=env_123
```