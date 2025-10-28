# Update Environment

## Endpoint
`PUT /environment/{id}`

## Description
Mengubah environment (name, description, variables, is_default). Jika `is_default` diubah menjadi true, environment lain akan di-unset sebagai default.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID environment

## Request Body
```json
{
  "name": "production",
  "variables": { "API_URL": "https://api.example.com" },
  "is_default": true
}
```

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Environment updated",
  "data": { "id": "env_...", "is_default": 1 }
}
```

## Example
```
PUT /gassapi2/backend/?act=environment_update&id=env_123
{ "is_default": true }
```