# 🏗️ Projects Table

## Overview
Central table for managing API projects with ownership, settings, and metadata.

## Schema
```sql
CREATE TABLE projects (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id CHAR(36) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  settings JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_owner (owner_id),
  INDEX idx_name (name)
);
```

## Fields
- **id**: Unique identifier (UUID)
- **name**: Project name
- **description**: Project description (optional)
- **owner_id**: Foreign key to users table (project owner)
- **is_public**: Project visibility flag (default: private)
- **settings**: JSON object for project-specific settings
- **created_at**: Project creation timestamp
- **updated_at**: Last modification timestamp

## Relationships
- **Owner**: Many-to-one with Users (ProjectOwner relationship)
- **Members**: One-to-many via ProjectMembers
- **Collections**: One-to-many for API organization
- **Environments**: One-to-many for environment variables
- **McpClientTokens**: One-to-many for MCP integration
- **AuditLogs**: One-to-many for project activity tracking

## Security Notes
- Only project owners can delete projects
- Cascading delete on owner removal removes all project data
- Settings field allows flexible project configuration
- Public flag determines external accessibility

## Access Control
- Owner has full administrative rights
- Members have access based on project membership
- Public projects are readable by all authenticated users
- Private projects require explicit membership

## Indexes
- Primary key on `id`
- Index on `owner_id` for owner-based queries
- Index on `name` for project search and filtering