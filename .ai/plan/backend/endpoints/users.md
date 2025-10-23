# 👥 User Management API

## Overview
User profile management and user project listing endpoints.

---

## GET `/users/profile`
Get current user profile information.

### Headers
```
Authorization: Bearer <access_token>
```

### Response
```json
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "avatarUrl": "https://example.com/avatar.jpg",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2025-01-21T10:00:00Z",
    "createdAt": "2025-01-20T08:00:00Z",
    "updatedAt": "2025-01-21T09:30:00Z"
  }
}
```

### Error Responses
- `401` - Unauthorized
- `404` - User not found

---

## PUT `/users/profile`
Update current user profile information.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "name": "John Smith",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

### Validation Rules
- `name`: Optional, min 2 characters, max 255
- `avatarUrl`: Optional, valid URL format, max 500 characters

### Response
```json
{
  "success": true,
  "user": {
    "id": "user_abc123",
    "email": "user@example.com",
    "name": "John Smith",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "isActive": true,
    "emailVerified": true,
    "lastLoginAt": "2025-01-21T10:00:00Z",
    "createdAt": "2025-01-20T08:00:00Z",
    "updatedAt": "2025-01-21T10:15:00Z"
  }
}
```

### Error Responses
- `400` - Validation error
- `401` - Unauthorized
- `422` - Invalid input data

---

## PUT `/users/password`
Change current user password.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "currentPassword": "old_password123",
  "newPassword": "new_password456"
}
```

### Validation Rules
- `currentPassword`: Required, non-empty
- `newPassword`: Required, min 8 characters, max 128

### Response
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### Error Responses
- `400` - Validation error
- `401` - Invalid current password
- `422` - Invalid input data

---

## DELETE `/users/account`
Delete current user account.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

### Request
```json
{
  "password": "user_password123",
  "confirmation": "DELETE_MY_ACCOUNT"
}
```

### Validation Rules
- `password`: Required, must match current password
- `confirmation`: Required, must be exact string "DELETE_MY_ACCOUNT"

### Response
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

### Account Deletion Process
1. **Validate**: Confirm password and confirmation
2. **Check Ownership**: Ensure user owns no critical projects
3. **Transfer Projects**: Transfer project ownership if needed
4. **Delete Data**: Remove user data and associations
5. **Revoke Tokens**: Invalidate all user tokens
6. **Audit Log**: Log account deletion event

### Error Responses
- `400` - Validation error
- `401` - Invalid password
- `403` - Cannot delete account (owns critical projects)
- `422` - Invalid input data

---

## GET `/users/projects`
Get all projects associated with current user.

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
      "role": "owner",
      "isPublic": false,
      "memberCount": 5,
      "endpointCount": 25,
      "createdAt": "2025-01-20T10:00:00Z",
      "updatedAt": "2025-01-21T09:30:00Z"
    },
    {
      "id": "proj_def456",
      "name": "Mobile App Backend",
      "description": "Backend for mobile application",
      "role": "member",
      "isPublic": false,
      "memberCount": 3,
      "endpointCount": 15,
      "createdAt": "2025-01-15T14:00:00Z",
      "updatedAt": "2025-01-20T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2,
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

## GET `/users/activity`
Get user activity history.

### Headers
```
Authorization: Bearer <access_token>
```

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)
- `action` - Filter by action type
- `resourceType` - Filter by resource type
- `fromDate` - Start date filter (ISO 8601)
- `toDate` - End date filter (ISO 8601)

### Response
```json
{
  "success": true,
  "activities": [
    {
      "id": "audit_abc123",
      "action": "endpoint_created",
      "resourceType": "endpoint",
      "resourceId": "ep_def456",
      "projectName": "E-commerce API",
      "details": {
        "endpointName": "Create User"
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-01-21T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Responses
- `401` - Unauthorized
- `500` - Server error

---

## 🔧 Business Logic

### Profile Management

#### User Information
- **Immutable Fields**: Email, ID (cannot be changed)
- **Editable Fields**: Name, avatar URL
- **Validation**: Server-side validation for all updates
- **Audit Trail**: Log all profile changes

#### Avatar Management
- **URL Validation**: Validate avatar URL format
- **Size Limits**: Optional image size validation
- **File Types**: Supported image formats (JPG, PNG, GIF)
- **Storage**: External storage integration (future)

### Password Management

#### Password Change Process
1. **Current Password Verification**: Verify current password
2. **New Password Validation**: Validate new password requirements
3. **Password History**: Check against recent passwords (optional)
4. **Hash Update**: Generate new password hash
5. **Token Invalidation**: Invalidate all existing tokens
6. **Security Log**: Log password change event

#### Password Requirements
- **Minimum Length**: 8 characters
- **Complexity**: Mix of letters, numbers, symbols recommended
- **Common Passwords**: Reject common passwords
- **Password History**: Prevent reuse of recent passwords

### Account Deletion

#### Deletion Safety Checks
- **Project Ownership**: Check if user owns projects
- **Project Transfer**: Transfer ownership before deletion
- **Data Cleanup**: Remove all user data
- **Token Cleanup**: Invalidate all user tokens

#### Deletion Process
1. **Validation**: Confirm password and deletion intent
2. **Project Check**: Verify no owned projects or transfer them
3. **Data Removal**: Delete user profile, preferences, settings
4. **Relationship Cleanup**: Remove project memberships
5. **Token Cleanup**: Invalidate all authentication tokens
6. **Audit Log**: Log account deletion with details

### Project Access

#### Role Determination
- **Owner**: User created the project
- **Member**: User was invited to project
- **Permissions**: Different permissions based on role

#### Project Statistics
- **Member Count**: Total members in project
- **Endpoint Count**: Total endpoints in project
- **Activity**: Recent project activity
- **Access Level**: User's access permissions

### Activity Tracking

#### Tracked Activities
- **Authentication**: Login, logout, password changes
- **Project Actions**: Create, update, delete projects
- **Collection Actions**: Create, update, delete collections
- **Endpoint Actions**: Create, update, delete endpoints
- **Member Actions**: Invitations, role changes

#### Activity Data
- **Timestamp**: When action occurred
- **IP Address**: User's IP address
- **User Agent**: Browser/client information
- **Details**: Action-specific details
- **Project Context**: Related project information

### Security Considerations

#### Profile Security
- **Information Disclosure**: Limit sensitive information exposure
- **Rate Limiting**: Prevent profile update abuse
- **Input Validation**: Validate all profile updates
- **Audit Logging**: Log all profile changes

#### Password Security
- **Strong Hashing**: Use bcrypt with sufficient rounds
- **Password History**: Prevent password reuse
- **Secure Transmission**: HTTPS only for password changes
- **Account Lockout**: Prevent brute force attacks

#### Account Protection
- **Deletion Confirmation**: Require explicit confirmation
- **Data Retention**: Follow data retention policies
- **Recovery Options**: Account recovery mechanisms
- **Monitoring**: Monitor for suspicious activity

### Performance Considerations

#### Database Optimization
- **Profile Queries**: Efficient user profile retrieval
- **Project Queries**: Optimized project listing with joins
- **Activity Queries**: Efficient activity log queries
- **Index Usage**: Proper database indexes

#### Caching Strategy
- **Profile Cache**: Cache user profile information
- **Project Cache**: Cache user project lists
- **Activity Cache**: Cache recent activities
- **Cache Invalidation**: Invalidate cache on updates

### Privacy Considerations

#### Data Minimization
- **Required Information**: Only collect necessary data
- **Data Retention**: Retain data only as long as needed
- **User Control**: Allow users to control their data
- **Transparency**: Clear data usage policies

#### Consent Management
- **Profile Data**: Explicit consent for profile data
- **Activity Tracking**: Clear disclosure of activity tracking
- **Data Sharing**: No data sharing without consent
- **Data Portability**: Allow data export/deletion