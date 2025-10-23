# 👥 Users Table

## Overview
Stores user account information including authentication details, profile data, and activity tracking.

## Schema
```sql
CREATE TABLE users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_active (is_active)
);
```

## Fields
- **id**: Unique identifier (UUID)
- **email**: User's email address (unique)
- **password_hash**: Bcrypt hashed password (12 rounds)
- **name**: User's display name
- **avatar_url**: Profile picture URL (optional)
- **is_active**: Account status flag
- **email_verified**: Email verification status
- **last_login_at**: Last successful login timestamp
- **created_at**: Account creation timestamp
- **updated_at**: Last modification timestamp

## Relationships
- **Projects**: One-to-many via `owned_projects` relationship
- **ProjectMembers**: One-to-many via project membership
- **McpClientTokens**: One-to-many for MCP authentication
- **Collections**: One-to-many as creator
- **Endpoints**: One-to-many as creator
- **AuditLogs**: One-to-many for audit trail

## Security Notes
- Passwords are hashed using bcrypt with 12 rounds
- Email addresses must be unique
- Email verification required for full access
- Account can be deactivated but not deleted (preserves data integrity)

## Indexes
- Primary key on `id`
- Unique index on `email` for fast lookups and uniqueness
- Index on `is_active` for filtering active users