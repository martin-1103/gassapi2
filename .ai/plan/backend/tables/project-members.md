# 👥 Project Members Table

## Overview
Manages project membership with invitation tracking and access control.

## Schema
```sql
CREATE TABLE project_members (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  invited_by CHAR(36) NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id),

  UNIQUE KEY unique_project_user (project_id, user_id)
);
```

## Fields
- **id**: Unique identifier (UUID)
- **project_id**: Foreign key to projects table
- **user_id**: Foreign key to users table (member)
- **invited_by**: Foreign key to users table (who invited)
- **joined_at**: Timestamp when user joined the project
- **created_at**: Record creation timestamp

## Relationships
- **Project**: Many-to-one with Projects
- **User**: Many-to-one with Users (the member)
- **Inviter**: Many-to-one with Users (who sent the invitation)

## Security Notes
- One member per user per project (unique constraint)
- Cascading delete removes memberships when project or user is deleted
- Invitation tracking provides audit trail for membership changes
- All members have equal access rights (no role-based system currently)

## Access Control
- Project owners can invite new members
- Members can view and contribute to project resources
- No role hierarchy - all members have same permissions
- Future extensions could add roles (admin, editor, viewer)

## Indexes
- Primary key on `id`
- Unique constraint on `(project_id, user_id)` prevents duplicate memberships
- Foreign key constraints ensure referential integrity