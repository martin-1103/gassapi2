# 🌍 Environments Table

## Table Definition
```sql
CREATE TABLE environments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  project_id CHAR(36) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  variables JSON NOT NULL DEFAULT '[]',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,

  INDEX idx_project (project_id),
  INDEX idx_name (name),
  INDEX idx_default (is_default),
  INDEX idx_project_default (project_id, is_default),
  UNIQUE KEY unique_project_name (project_id, name)
);
```

## Field Specifications

### `id` - Primary Key
- **Type**: CHAR(36)
- **Default**: UUID()
- **Description**: Unique identifier for environment
- **Constraints**: PRIMARY KEY

### `project_id` - Project Reference
- **Type**: CHAR(36)
- **Constraints**: NOT NULL, FOREIGN KEY
- **Description**: Reference to owning project
- **Relationship**: projects.id
- **Cascade**: DELETE (environments deleted when project deleted)

### `name` - Environment Name
- **Type**: VARCHAR(100)
- **Constraints**: NOT NULL
- **Description**: Human-readable environment name
- **Validation**:
  - Required field
  - Max 100 characters
  - Unique within project
  - Alphanumeric, spaces, hyphens, underscores

### `description` - Environment Description
- **Type**: TEXT
- **Constraints**: Nullable
- **Description**: Optional description of environment purpose
- **Validation**:
  - Optional field
  - Max 500 characters
  - Plain text format

### `variables` - Environment Variables
- **Type**: JSON
- **Default**: '[]'
- **Constraints**: NOT NULL
- **Description**: Environment variables as JSON array
- **Format**: `[{"key": "VALUE", "value": "..."}]`
- **Validation**:
  - Valid JSON array
  - Each object must have `key` and `value` fields
  - Keys unique within environment
  - Max 100 variables
  - Total size max 50KB

### `is_default` - Default Flag
- **Type**: BOOLEAN
- **Default**: false
- **Description**: Whether this is the default environment
- **Constraints**: Only one environment can be default per project

### `created_at` - Creation Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Description**: When environment was created
- **Immutable**: Never changes after creation

### `updated_at` - Update Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Auto Update**: ON UPDATE CURRENT_TIMESTAMP
- **Description**: When environment was last updated

## Indexes

### `idx_project`
- **Columns**: project_id
- **Purpose**: Fast retrieval of all environments in a project
- **Usage**: Project environment listing, permissions checking

### `idx_name`
- **Columns**: name
- **Purpose**: Fast name-based searching
- **Usage**: Environment lookup by name, search functionality

### `idx_default`
- **Columns**: is_default
- **Purpose**: Quickly find default environments
- **Usage**: Default environment resolution

### `idx_project_default`
- **Columns**: project_id, is_default
- **Purpose**: Composite index for project+default queries
- **Usage**: Optimized default environment lookup

### `unique_project_name`
- **Columns**: project_id, name
- **Purpose**: Enforce unique names within project
- **Constraint**: UNIQUE KEY

## Data Examples

### Development Environment
```sql
INSERT INTO environments VALUES (
  'env_abc123',
  'proj_def456',
  'Development',
  'Local development environment',
  '[{"key": "API_BASE_URL", "value": "http://localhost:3000"}, {"key": "API_TOKEN", "value": "dev_token_123"}]',
  true,
  '2025-01-21 10:00:00',
  '2025-01-21 10:00:00'
);
```

### Production Environment
```sql
INSERT INTO environments VALUES (
  'env_ghi789',
  'proj_def456',
  'Production',
  'Live production environment',
  '[{"key": "API_BASE_URL", "value": "https://api.example.com"}, {"key": "API_TOKEN", "value": "prod_token_456"}]',
  false,
  '2025-01-21 10:05:00',
  '2025-01-21 10:05:00'
);
```

### Complex Environment with Multiple Variables
```sql
INSERT INTO environments VALUES (
  'env_jkl012',
  'proj_def456',
  'Staging',
  'Staging environment for testing',
  '[
    {"key": "API_BASE_URL", "value": "https://staging-api.example.com"},
    {"key": "API_TOKEN", "value": "staging_token_789"},
    {"key": "DEBUG_MODE", "value": "true"},
    {"key": "TIMEOUT", "value": "30"},
    {"key": "RETRY_COUNT", "value": "3"}
  ]',
  false,
  '2025-01-21 10:10:00',
  '2025-01-21 10:10:00'
);
```

## Query Examples

### Get Environments by Project
```sql
SELECT
  id, name, description, is_default, created_at, updated_at
FROM environments
WHERE project_id = 'proj_def456'
ORDER BY is_default DESC, name ASC;
```

### Get Default Environment
```sql
SELECT
  id, name, description, variables
FROM environments
WHERE project_id = 'proj_def456' AND is_default = true;
```

### Check Environment Name Uniqueness
```sql
SELECT COUNT(*) as duplicate_count
FROM environments
WHERE project_id = 'proj_def456'
  AND LOWER(name) = LOWER('development');
```

### Get Variable Count
```sql
SELECT
  id, name,
  JSON_LENGTH(variables) as variable_count
FROM environments
WHERE project_id = 'proj_def456';
```

### Search Variables
```sql
SELECT
  id, name, variables
FROM environments
WHERE project_id = 'proj_def456'
  AND JSON_SEARCH(variables, 'one', 'API_BASE_URL') IS NOT NULL;
```

### Extract Specific Variable
```sql
SELECT
  id, name,
  JSON_UNQUOTE(
    JSON_EXTRACT(variables, '$[*].value')
  ) as api_base_url
FROM environments
WHERE project_id = 'proj_def456'
  AND JSON_CONTAINS(variables, '"API_BASE_URL"', '$.key');
```

## Business Rules

### Environment Constraints
- **Minimum Environments**: At least one environment per project
- **Maximum Environments**: 50 environments per project (configurable)
- **Default Environment**: Exactly one default environment per project
- **Name Uniqueness**: Environment names unique within project

### Variable Management
- **Key Format**: Alphanumeric, underscores, hyphens only
- **Key Uniqueness**: Keys must be unique within environment
- **Value Format**: String values (future: support different types)
- **Variable Limits**: Max 100 variables per environment
- **Size Limits**: Total variables data max 50KB

### Default Environment Rules
- **Single Default**: Only one environment can have `is_default = true`
- **Auto Creation**: First environment automatically set as default
- **Default Switching**: Can change default with UPDATE query
- **Deletion Constraints**: Cannot delete default if it's the only one

### Naming Conventions
- **Standard Names**: Development, Staging, Production
- **Custom Names**: User-defined environment names allowed
- **Case Sensitivity**: Names stored as entered, uniqueness case-insensitive
- **Special Characters**: Spaces, hyphens, underscores allowed

## Performance Considerations

### Optimization Strategies
- **JSON Queries**: Use JSON functions for efficient variable access
- **Index Usage**: Proper indexes for common query patterns
- **Variable Caching**: Cache parsed variables for frequent access
- **Query Optimization**: Use composite indexes for project+default queries

### Storage Optimization
- **JSON Compression**: Consider compression for large variable sets
- **Variable Parsing**: Cache parsed variables to avoid repeated JSON parsing
- **Index Maintenance**: Regular index maintenance for performance

### Monitoring Metrics
- Environment count per project
- Average variable count per environment
- JSON field size distribution
- Query performance on variable operations

## Security Considerations

### Data Protection
- **Access Control**: Environment access tied to project permissions
- **Variable Encryption**: Consider encryption for sensitive variables
- **Audit Trail**: Log all environment and variable changes
- **Variable Masking**: Mask sensitive values in responses (future)

### Variable Security
- **Injection Prevention**: Validate variable values for injection attacks
- **Secret Management**: Plan for secret variable management
- **Environment Isolation**: Variables isolated by project
- **Access Logging**: Log variable access for security monitoring

## Migration Considerations

### Schema Evolution
- **Variable Format**: Maintain backward compatibility for variable JSON format
- **Field Extensions**: Add optional fields with NULL defaults
- **Index Changes**: Plan for index modifications carefully
- **Data Validation**: Validate data during schema migrations

### Data Migration
- **Bulk Updates**: Use transactions for large data updates
- **Variable Format Changes**: Plan for variable format migrations
- **Performance**: Optimize migration for large datasets
- **Rollback Strategy**: Plan for migration rollback procedures

## Variable Substitution Implementation

### Template Format
Variables support substitution using `{{VARIABLE_NAME}}` format in:
- **Endpoint URLs**: `{{API_BASE_URL}}/users/{{userId}}`
- **Headers**: `"Authorization": "Bearer {{API_TOKEN}}"`
- **Body**: `{"username": "{{username}}"}`

### Substitution Logic
1. **Variable Extraction**: Parse template to find variable placeholders
2. **Value Lookup**: Retrieve variable values from active environment
3. **Replacement**: Replace placeholders with actual values
4. **Fallback**: Handle missing variables gracefully
5. **Caching**: Cache substitution results for performance

### Performance Optimization
- **Variable Caching**: Cache environment variables in memory
- **Template Parsing**: Cache parsed templates
- **Substitution Algorithm**: Efficient string replacement
- **Concurrent Access**: Thread-safe variable access