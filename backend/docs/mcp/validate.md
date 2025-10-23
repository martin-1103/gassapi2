# Validate MCP Token

## Endpoint
`GET /mcp/validate`

## Description
Validasi MCP token yang dikirim oleh MCP client. Mengembalikan context project dan daftar environments.

## Headers
```
Authorization: Bearer <PLAINTEXT_MCP_TOKEN>
```

## Response
### Success (200)
```json
{
  "status": "success",
  "message": "Token valid",
  "data": {
    "project": { "id": "proj_...", "name": "My Project" },
    "environments": [ { "id": "env_...", "name": "development" } ]
  }
}
```

### Error (401)
```json
{ "status": "error", "message": "Invalid token", "data": null }
```

## Example
```
GET /gassapi2/backend/?act=mcp_validate
Authorization: Bearer <PLAINTEXT_MCP_TOKEN>
```