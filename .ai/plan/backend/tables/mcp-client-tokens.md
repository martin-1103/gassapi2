# 🔐 MCP Client Tokens Table

## Overview
Manages permanent authentication tokens for MCP (Model Context Protocol) client integration with projects.

## Schema
```sql
CREATE TABLE mcp_client_tokens (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  last_validated_at TIMESTAMP NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),

  INDEX idx_project (project_id),
  INDEX idx_token (token_hash),
  INDEX idx_active (is_active)
);
```

## Fields
- **id**: Unique identifier (UUID)
- **project_id**: Foreign key to projects table
- **token_hash**: Hashed representation of the MCP client token
- **last_validated_at**: Last successful token validation timestamp
- **created_by**: Foreign key to users table (token creator)
- **created_at**: Token creation timestamp
- **is_active**: Token status flag (can be deactivated without deletion)

## Security Notes
- Tokens are stored as hashes, never in plain text
- One token per member per project design
- Tokens are permanent until manually revoked
- Token validation tracking for security monitoring
- Project-scoped tokens ensure isolation

## Token Management
- **Generation**: Available to all project members
- **Validation**: Tracked with timestamps for security monitoring
- **Revocation**: Soft delete via `is_active` flag
- **Scope**: Project-specific, no cross-project access

## MCP Integration
- Enables external MCP clients to access project APIs
- Supports automated API testing and documentation
- Provides secure authentication for third-party tools
- Maintains audit trail via token usage tracking

## Indexes
- Primary key on `id`
- Unique index on `token_hash` for token lookup
- Index on `project_id` for project-based token queries
- Index on `is_active` for filtering active tokens