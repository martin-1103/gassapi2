# 📁 Project Management API

## Overview
Project CRUD operations, member management, and project configuration endpoints.

---

## GET `/projects`
Get all projects accessible to current user.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `search` - Search projects by name or description
- `role` - Filter by role: `owner|member`
- `sort` - Sort field: `name|created_at|updated_at`
- `order` - Sort order: `asc|desc`

### Response
```json
{
  "success": true,
  "projects": [
    {
      "id": "proj_abc123",
      "name": "E-commerce API",
      "description": "API for e-commerce platform",
      "ownerId": "user_def456",
      "ownerName": "John Doe",
      "isPublic": false,
      "memberCount": 5,
      "collectionCount": 8,
      "endpointCount": 25,
      "userRole": "owner",
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-21T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Error Responses
- `401` - Unauthorized
- `500` - Server error

---

## POST `/projects`
Create new project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "New API Project",
  "description": "Description of the new project"
}
```

### Validation Rules
- `name`: Required, min 2 characters, max 255
- `description`: Optional, max 1000 characters

### Response
```json
{
  "success": true,
  "project": {
    "id": "proj_ghi789",
    "name": "New API Project",
    "description": "Description of the new project",
    "ownerId": "user_abc123",
    "isPublic": false,
    "settings": {},
    "createdAt": "2025-01-21T10:00:00Z",
    "updatedAt": "2025-01-21T10:00:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `422` - Invalid input data

---

## GET `/projects/:id`
Get project details.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "project": {
    "id": "proj_abc123",
    "name": "E-commerce API",
    "description": "API for e-commerce platform",
    "ownerId": "user_def456",
    "ownerName": "John Doe",
    "isPublic": false,
    "settings": {
      "defaultEnvironment": "env_123",
      "theme": "dark"
    },
    "memberCount": 5,
    "collectionCount": 8,
    "endpointCount": 25,
    "userRole": "owner",
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-21T09:30:00Z"
  }
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## PUT `/projects/:id`
Update project details.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "Updated Project Name",
  "description": "Updated project description",
  "isPublic": true,
  "settings": {
    "defaultEnvironment": "env_456",
    "theme": "light"
  }
}
```

### Validation Rules
- `name`: Optional, min 2 characters, max 255
- `description`: Optional, max 1000 characters
- `isPublic`: Optional, boolean
- `settings`: Optional, JSON object

### Response
```json
{
  "success": true,
  "project": {
    "id": "proj_abc123",
    "name": "Updated Project Name",
    "description": "Updated project description",
    "ownerId": "user_def456",
    "isPublic": true,
    "settings": {
      "defaultEnvironment": "env_456",
      "theme": "light"
    },
    "createdAt": "2025-01-20T10:00:00Z",
    "updatedAt": "2025-01-21T10:15:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## DELETE `/projects/:id`
Delete project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request (Optional)
```json
{
  "confirmation": "DELETE_PROJECT"
}
```

### Response
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

### Deletion Process
1. **Permission Check**: Verify user is project owner
2. **Confirmation**: Require explicit confirmation (optional)
3. **Cascade Delete**: Delete all collections, endpoints, environments
4. **Member Cleanup**: Remove all project memberships
5. **Token Cleanup**: Revoke all MCP tokens
6. **Audit Log**: Log project deletion

### Error Responses
- `401` - Unauthorized
- `403` - Not project owner
- `404` - Project not found
- `409` - Cannot delete project with active dependencies

---

## POST `/projects/:id/members`
Invite new member to project.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "email": "newmember@example.com"
}
```

### Validation Rules
- `email`: Required, valid email format

### Response
```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "inv_abc123",
    "email": "newmember@example.com",
    "projectId": "proj_def456",
    "invitedBy": "user_ghi789",
    "expiresAt": "2025-01-28T10:00:00Z"
  }
}
```

### Invitation Process
1. **User Lookup**: Find user by email
2. **Existing Member**: Check if already a member
3. **Create Invitation**: Generate invitation token
4. **Send Email**: Send invitation email (future)
5. **Set Expiration**: 7-day expiration
6. **Audit Log**: Log invitation creation

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found
- `409` - User already a member

---

## GET `/projects/:id/members`
Get all project members.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "members": [
    {
      "id": "user_abc123",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://example.com/avatar1.jpg",
      "role": "owner",
      "joinedAt": "2025-01-20T10:00:00Z",
      "invitedBy": null
    },
    {
      "id": "user_def456",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "avatarUrl": "https://example.com/avatar2.jpg",
      "role": "member",
      "joinedAt": "2025-01-21T08:30:00Z",
      "invitedBy": "user_abc123"
    }
  ]
}
```

### Error Responses
- `401` - Unauthorized
- `403` - Not a project member
- `404` - Project not found

---

## DELETE `/projects/:id/members/:memberId`
Remove member from project.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

### Constraints
- **Owner Removal**: Cannot remove project owner
- **Self Removal**: Users can remove themselves
- **Last Member**: Cannot remove last member
- **Permission Check**: Only project owners can remove members

### Error Responses
- `401` - Unauthorized
- `403` - Not a project owner or removing self
- `404` - Project or member not found
- `409` - Cannot remove project owner

---

## 🔧 Business Logic

### Project Management

#### Project Creation
- **Owner Assignment**: Creator becomes project owner
- **Default Settings**: Apply default project settings
- **Initial Setup**: Create default environment
- **Permissions**: Set up initial permissions

#### Project Ownership
- **Owner Rights**: Full project control
- **Ownership Transfer**: Transfer ownership to another member
- **Multiple Owners**: Single owner model (configurable)
- **Owner Removal**: Cannot remove owner without transfer

#### Project Visibility
- **Public Projects**: Discoverable by other users
- **Private Projects**: Access by invitation only
- **Access Control**: Role-based permissions
- **Sharing Options**: Public link sharing (future)

### Member Management

#### Role System
- **Owner**: Full project control
- **Member**: Standard project access
- **Role Equality**: Equal member permissions (except deletion)
- **Future Roles**: Admin, Viewer roles (future)

#### Invitation System
- **Email Invitation**: Send invitation via email
- **Invitation Token**: Secure token for joining
- **Expiration**: 7-day invitation expiration
- **Re-invitation**: Allow re-invitation after expiration

#### Member Permissions
- **Create Projects**: All authenticated users
- **Project Access**: Project members only
- **Member Invitation**: All project members can invite
- **Member Removal**: Project owners only

### Project Settings

#### Configuration Options
- **Default Environment**: Set active environment
- **Theme**: UI theme preference
- **Notifications**: Email notification settings
- **Integrations**: Third-party integrations (future)

#### Settings Validation
- **JSON Validation**: Validate settings JSON format
- **Schema Validation**: Validate against settings schema
- **Default Values**: Apply defaults for missing settings
- **Migration**: Handle settings schema changes

### Security Considerations

#### Access Control
- **Project Membership**: Verify project membership
- **Role Verification**: Check user role for operations
- **Permission Matrix**: Define role permissions
- **Resource Isolation**: Isolate project data

#### Audit Logging
- **Project Actions**: Log all project modifications
- **Member Actions**: Log member invitations/removals
- **Access Logs**: Log project access attempts
- **Security Events**: Log security-related events

### Performance Considerations

#### Database Optimization
- **Project Queries**: Efficient project listing with joins
- **Member Queries**: Optimized member listing
- **Permission Checks**: Fast permission verification
- **Index Strategy**: Proper database indexes

#### Caching Strategy
- **Project Cache**: Cache project information
- **Member Cache**: Cache member lists
- **Permission Cache**: Cache user permissions
- **Cache Invalidation**: Invalidate cache on changes

### Data Consistency

#### Transaction Management
- **Project Creation**: Atomic project creation
- **Member Operations**: Atomic member changes
- **Cascade Operations**: Proper cascade handling
- **Rollback Support**: Transaction rollback on errors

#### Data Integrity
- **Foreign Keys**: Enforce referential integrity
- **Constraints**: Database-level constraints
- **Validation**: Server-side validation
- **Error Handling**: Graceful error handling

### Integration Points

#### MCP Integration
- **Token Generation**: Generate MCP tokens for project
- **Project Context**: Provide project context to MCP client
- **Environment Access**: Access project environments
- **Endpoint Access**: Access project endpoints

#### Future Integrations
- **Webhook Support**: Project webhook configuration
- **API Documentation**: Auto-generated API docs
- **Backup/Export**: Project data export
- **Templates**: Project templates