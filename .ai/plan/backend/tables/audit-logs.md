# 📋 Audit Logs Table

## Overview
Comprehensive audit trail for tracking all modifications, access, and system events across the platform.

## Schema
```sql
CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  project_id CHAR(36),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id CHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),

  INDEX idx_user (user_id),
  INDEX idx_project (project_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);
```

## Fields
- **id**: Unique identifier (UUID)
- **user_id**: Foreign key to users table (actor, nullable for system events)
- **project_id**: Foreign key to projects table (nullable for global events)
- **action**: Action performed (e.g., "CREATE", "UPDATE", "DELETE", "LOGIN")
- **resource_type**: Type of resource affected (e.g., "project", "endpoint", "user")
- **resource_id**: ID of the affected resource
- **old_values**: JSON snapshot of values before change
- **new_values**: JSON snapshot of values after change
- **ip_address**: Client IP address for security tracking
- **user_agent**: Client user agent string
- **created_at**: Event timestamp

## Action Types
- **Authentication**: LOGIN, LOGOUT, PASSWORD_CHANGE, EMAIL_VERIFY
- **Project Management**: PROJECT_CREATE, PROJECT_UPDATE, PROJECT_DELETE, PROJECT_INVITE
- **API Management**: ENDPOINT_CREATE, ENDPOINT_UPDATE, ENDPOINT_DELETE, COLLECTION_CREATE
- **Token Management**: TOKEN_CREATE, TOKEN_VALIDATE, TOKEN_REVOKE
- **User Management**: USER_UPDATE, USER_DEACTIVATE, USER_DELETE

## Security Features
- Immutable records (no updates or deletions)
- IP address tracking for security monitoring
- User agent logging for device identification
- Before/after value snapshots for change tracking
- Support for system events (nullable user_id)

## Compliance & Privacy
- GDPR-compliant audit trail
- Data retention policies via automated cleanup
- Privacy-preserving design (sensitive data hashing)
- Export capabilities for compliance reporting

## Indexes
- Primary key on `id`
- Index on `user_id` for user activity tracking
- Index on `project_id` for project-specific audits
- Index on `action` for action-based filtering
- Index on `created_at` for time-based queries

## Query Patterns
- Recent activity: `ORDER BY created_at DESC LIMIT 100`
- User activity: `WHERE user_id = ? ORDER BY created_at DESC`
- Project changes: `WHERE project_id = ? ORDER BY created_at DESC`
- Security events: `WHERE action IN ('LOGIN', 'TOKEN_VALIDATE')`