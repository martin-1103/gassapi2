# List Environments

## Endpoint
`GET /project/{id}/environments`

## Description
Mendapatkan daftar environment untuk suatu project.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID project

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Environments fetched",
  "data": [
    {
      "id": "env_...",
      "project_id": "proj_...",
      "name": "development",
      "is_default": 1,
      "variables": "{}"
    }
  ]
}
```

## Example
```
GET /gassapi2/backend/?act=project_environments&id=proj_123
```