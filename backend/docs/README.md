# API Documentation

## Backend PHP API v1.0.0

Base URL: `/gassapi2/backend/`

Query format: `?act=endpoint_name&id={id}`

## Quick Links

### Authentication
- [Login](auth/login.md) - POST `/login`
- [Register](auth/register.md) - POST `/register`
- [Logout](auth/logout.md) - POST `/logout`
- [Refresh Token](auth/refresh.md) - POST `/refresh`
- [Logout All](auth/logout-all.md) - POST `/logout-all`
- [Change Password](auth/change-password.md) - POST `/change-password`

### Users
- [List Users](users/list.md) - GET `/users`
- [User Statistics](users/stats.md) - GET `/users/stats`
- [Get User](users/get.md) - GET `/user/{id}`
- [Update User](users/update.md) - PUT `/user/{id}`
- [Delete User](users/delete.md) - DELETE `/user/{id}`
- [Toggle Status](users/toggle-status.md) - PUT `/user/{id}/toggle-status`

### Profile
- [Get Profile](profile/get.md) - GET `/profile`
- [Update Profile](profile/update.md) - POST `/profile`

### System
- [API Help](system/help.md) - GET `/`
- [Health Check](system/health.md) - GET `/health`

### Projects
- [List Projects](projects/list.md) - GET `/projects`
- [Create Project](projects/create.md) - POST `/projects`
- [Get Project](projects/get.md) - GET `/project/{id}`
- [Update Project](projects/update.md) - PUT `/project/{id}`
- [Delete Project](projects/delete.md) - DELETE `/project/{id}`
- [Add Member](projects/add-member.md) - POST `/project/{id}/members`

### Environments
- [List Environments](environments/list.md) - GET `/project/{id}/environments`
- [Create Environment](environments/create.md) - POST `/project/{id}/environments`
- [Get Environment](environments/get.md) - GET `/environment/{id}`
- [Update Environment](environments/update.md) - PUT `/environment/{id}`
- [Delete Environment](environments/delete.md) - DELETE `/environment/{id}`

### MCP
- [Generate MCP Config](mcp/generate-config.md) - POST `/project/{id}/generate-config`
- [Validate MCP Token](mcp/validate.md) - GET `/mcp/validate`

## Usage Examples

### Get API Help
```
GET /gassapi/backend-php?act=help
```

### Health Check
```
GET /gassapi/backend-php?act=health
```

### User Login
```
POST /gassapi/backend-php?act=login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Get User List
```
GET /gassapi/backend-php?act=users&page=1&limit=10
```

## Response Format

All responses follow JSON format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": 400
}
```

## Authentication

Most endpoints require JWT authentication. Include token in Authorization header:

```
Authorization: Bearer {jwt_token}
```