# Generate MCP Config

## Endpoint
`POST /project/{id}/generate-config`

## Description
Menghasilkan konfigurasi `gassapi.json` untuk MCP client dan membuat permanent token baru.

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID project

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "MCP config generated",
  "data": {
    "name": "My Project",
    "project_id": "proj_...",
    "api_base_url": "http://localhost:8080/gassapi2/backend/",
    "mcp_validate_endpoint": "/mcp/validate",
    "token": "<PLAINTEXT_TOKEN>",
    "environments": [
      { "id": "env_...", "name": "development", "is_default": true, "variables": {} }
    ]
  }
}
```

## Example
```
POST /gassapi2/backend/?act=mcp_generate_config&id=proj_123
```