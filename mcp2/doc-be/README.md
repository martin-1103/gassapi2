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

### Folders
- [List Folders](folders/list.md) - GET `/project/{id}/folders`
- [Create Folder](folders/create.md) - POST `/project/{id}/folders`
- [Get Folder](folders/get.md) - GET `/folder/{id}`
- [Update Folder](folders/update.md) - PUT `/folder/{id}`
- [Delete Folder](folders/delete.md) - DELETE `/folder/{id}`

### Endpoints
- [List Endpoints](endpoints/list.md) - GET `/folder/{id}/endpoints`
- [Create Endpoint](endpoints/create.md) - POST `/folder/{id}/endpoints`
- [Get Endpoint](endpoints/get.md) - GET `/endpoint/{id}`
- [Update Endpoint](endpoints/update.md) - PUT `/endpoint/{id}`
- [Delete Endpoint](endpoints/delete.md) - DELETE `/endpoint/{id}`

### Flows
- [List Flows](flows/list.md) - GET `/project/{id}/flows`
- [List Active Flows](flows/list.md#get-active-flows-only) - GET `/project/{id}/flows/active`
- [Create Flow](flows/create.md) - POST `/project/{id}/flows`
- [Get Flow](flows/get.md) - GET `/flow/{id}`
- [Update Flow](flows/update.md) - PUT `/flow/{id}`
- [Delete Flow](flows/delete.md) - DELETE `/flow/{id}`
- [Toggle Active](flows/toggle-active.md) - PUT `/flow/{id}/toggle-active`
- [Duplicate Flow](flows/duplicate.md) - POST `/flow/{id}/duplicate`

### MCP

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