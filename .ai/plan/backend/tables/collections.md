# 📁 Collections Table

## Table Definition
```sql
CREATE TABLE collections (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  project_id CHAR(36) NOT NULL,
  parent_id CHAR(36),
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_project (project_id),
  INDEX idx_parent (parent_id),
  INDEX idx_created_by (created_by),
  INDEX idx_name (name)
);
```

## Field Specifications

### `id` - Primary Key
- **Type**: CHAR(36)
- **Default**: UUID()
- **Description**: Unique identifier for collection
- **Constraints**: PRIMARY KEY

### `name` - Collection Name
- **Type**: VARCHAR(255)
- **Constraints**: NOT NULL
- **Description**: Human-readable collection name
- **Validation**:
  - Required field
  - Max 255 characters
  - No duplicate names within same parent and project

### `project_id` - Project Reference
- **Type**: CHAR(36)
- **Constraints**: NOT NULL, FOREIGN KEY
- **Description**: Reference to owning project
- **Relationship**: projects.id
- **Cascade**: DELETE (collections deleted when project deleted)

### `parent_id` - Hierarchy Parent
- **Type**: CHAR(36)
- **Constraints**: FOREIGN KEY (nullable)
- **Description**: Reference to parent collection for hierarchy
- **Relationship**: collections.id (self-referencing)
- **Cascade**: DELETE (child collections deleted when parent deleted)
- **Null Value**: Root collections have null parent_id

### `created_by` - Creator Reference
- **Type**: CHAR(36)
- **Constraints**: NOT NULL, FOREIGN KEY
- **Description**: User who created the collection
- **Relationship**: users.id
- **Cascade**: DELETE (collection deleted when creator deleted)

### `created_at` - Creation Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Description**: When collection was created
- **Immutable**: Never changes after creation

### `updated_at` - Update Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Auto Update**: ON UPDATE CURRENT_TIMESTAMP
- **Description**: When collection was last updated

## Indexes

### `idx_project`
- **Columns**: project_id
- **Purpose**: Fast retrieval of all collections in a project
- **Usage**: Project collection listing, permissions checking

### `idx_parent`
- **Columns**: parent_id
- **Purpose**: Efficient hierarchy queries
- **Usage**: Finding child collections, building tree structure

### `idx_created_by`
- **Columns**: created_by
- **Purpose**: Track collections by creator
- **Usage**: User activity reports, audit trails

### `idx_name`
- **Columns**: name
- **Purpose**: Fast name-based searching
- **Usage**: Search functionality, duplicate checking

## Business Rules

### Hierarchy Constraints
- **Maximum Depth**: 5 levels
- **Self Reference**: Cannot reference itself as parent
- **Circular Reference**: Cannot create circular dependencies
- **Root Collections**: parent_id can be null for root-level collections

### Naming Rules
- **Unique Names**: Within same parent and project
- **Character Set**: Alphanumeric, spaces, hyphens, underscores
- **Reserved Names**: None currently
- **Case Sensitivity**: Case-insensitive uniqueness

### Permission Model
- **Create**: All project members can create collections
- **Read**: All project members can view collections
- **Update**: All project members can update collections
- **Delete**: All project members can delete collections
- **Inheritance**: Collection permissions inherit from project permissions

## Data Examples

### Root Collection
```sql
INSERT INTO collections VALUES (
  'col_abc123',
  'User Management API',
  'proj_def456',
  NULL,
  'user_ghi789',
  '2025-01-21 10:00:00',
  '2025-01-21 10:00:00'
);
```

### Nested Collection
```sql
INSERT INTO collections VALUES (
  'col_jkl012',
  'Authentication',
  'proj_def456',
  'col_abc123',
  'user_ghi789',
  '2025-01-21 10:05:00',
  '2025-01-21 10:05:00'
);
```

## Query Examples

### Get Collections with Hierarchy
```sql
-- Recursive CTE for collection tree (MySQL 8.0+)
WITH RECURSIVE collection_tree AS (
  SELECT
    id, name, project_id, parent_id, created_by, created_at, updated_at,
    0 as level,
    CAST(name AS CHAR(1000)) as path
  FROM collections
  WHERE project_id = 'proj_def456' AND parent_id IS NULL

  UNION ALL

  SELECT
    c.id, c.name, c.project_id, c.parent_id, c.created_by, c.created_at, c.updated_at,
    ct.level + 1,
    CONCAT(ct.path, ' > ', c.name) as path
  FROM collections c
  JOIN collection_tree ct ON c.parent_id = ct.id
  WHERE c.project_id = 'proj_def456'
)
SELECT * FROM collection_tree ORDER BY level, name;
```

### Get Collections with Endpoint Count
```sql
SELECT
  c.id,
  c.name,
  c.parent_id,
  COUNT(e.id) as endpoint_count
FROM collections c
LEFT JOIN endpoints e ON c.id = e.collection_id
WHERE c.project_id = 'proj_def456'
GROUP BY c.id, c.name, c.parent_id
ORDER BY c.name;
```

### Check Collection Name Uniqueness
```sql
SELECT COUNT(*) as duplicate_count
FROM collections
WHERE project_id = 'proj_def456'
  AND parent_id IS NULL
  AND LOWER(name) = LOWER('user management api');
```

## Performance Considerations

### Optimization Strategies
- **Query Caching**: Cache collection trees for frequent access
- **Batch Operations**: Use transactions for bulk collection operations
- **Index Usage**: Proper indexes for common query patterns
- **Hierarchy Limits**: Enforce reasonable depth limits

### Monitoring Metrics
- Collection count per project
- Average hierarchy depth
- Query performance on collection listings
- Frequency of collection modifications

## Migration Considerations

### Version Control
- **Schema Changes**: Use migration scripts for schema updates
- **Data Migration**: Preserve data during schema changes
- **Backward Compatibility**: Maintain API compatibility during updates
- **Rollback Strategy**: Plan for schema rollback if needed

### Data Integrity
- **Foreign Keys**: Enforce referential integrity
- **Constraints**: Validate data at database level
- **Triggers**: Consider triggers for audit logging
- **Transactions**: Use transactions for complex operations