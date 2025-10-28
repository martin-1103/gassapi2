# Add Member to Project

## Endpoint
`POST /project/{id}/members`

## Description
Menambahkan member ke project. Semua member dapat mengundang member lain.

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
  "user_id": "user_abc123"
}
```

## Response
### Created (201)
```json
{
  "status": "success",
  "message": "Member added",
  "data": { "member_id": "pm_..." }
}
```

## Example
```
POST /gassapi2/backend/?act=project_add_member&id=proj_123
{ "user_id": "user_456" }
```