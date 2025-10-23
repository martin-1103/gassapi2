# Create Environment

## Endpoint
`POST /project/{id}/environments`

## Description
Membuat environment baru untuk project.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID project

## Request Body
```json
{
  "name": "staging",
  "description": "Staging env",
  "variables": { "API_URL": "https://staging.example.com" },
  "is_default": false
}
```

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Environment created",
  "data": {
    "id": "env_...",
    "name": "staging",
    "is_default": 0
  }
}
```

## Example
```
POST /gassapi2/backend/?act=environment_create&id=proj_123
{ "name": "staging" }
```