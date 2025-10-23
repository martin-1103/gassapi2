# 🔗 Endpoints Table

## Table Definition
```sql
CREATE TABLE endpoints (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  method ENUM('GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS') NOT NULL,
  url TEXT NOT NULL,
  headers JSON DEFAULT '{}',
  body JSON,
  collection_id CHAR(36) NOT NULL,
  created_by CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,

  INDEX idx_collection (collection_id),
  INDEX idx_created_by (created_by),
  INDEX idx_method (method),
  INDEX idx_name (name),
  INDEX idx_collection_method (collection_id, method)
);
```

## Field Specifications

### `id` - Primary Key
- **Type**: CHAR(36)
- **Default**: UUID()
- **Description**: Unique identifier for endpoint
- **Constraints**: PRIMARY KEY

### `name` - Endpoint Name
- **Type**: VARCHAR(255)
- **Constraints**: NOT NULL
- **Description**: Human-readable endpoint name
- **Validation**:
  - Required field
  - Max 255 characters
  - Alphanumeric, spaces, hyphens, underscores
  - No duplicate names within same collection

### `method` - HTTP Method
- **Type**: ENUM
- **Values**: 'GET','POST','PUT','DELETE','PATCH','HEAD','OPTIONS'
- **Constraints**: NOT NULL
- **Description**: HTTP method for the request
- **Validation**: Must be one of supported methods

### `url` - Request URL
- **Type**: TEXT
- **Constraints**: NOT NULL
- **Description**: Complete URL with variable substitution
- **Validation**:
  - Required field
  - Max 2000 characters
  - Supports variable substitution: `{{VARIABLE_NAME}}`
  - Valid URL format or template

### `headers` - Request Headers
- **Type**: JSON
- **Default**: '{}'
- **Description**: HTTP headers as JSON object
- **Format**: `{"key": "value", "key2": "{{variable}}"}`
- **Validation**:
  - Valid JSON object
  - Max 50 header keys
  - Total size max 10KB
  - Supports variable substitution

### `body` - Request Body
- **Type**: JSON
- **Constraints**: Nullable
- **Description**: Request body content
- **Format**: Varies by content type:
  - JSON: Valid JSON object/array
  - Form data: JSON object with key-value pairs
  - Raw text: String value
  - Null: No body (GET, HEAD, OPTIONS)
- **Validation**:
  - Valid JSON if not null
  - Max 100KB size
  - Supports variable substitution

### `collection_id` - Collection Reference
- **Type**: CHAR(36)
- **Constraints**: NOT NULL, FOREIGN KEY
- **Description**: Reference to owning collection
- **Relationship**: collections.id
- **Cascade**: DELETE (endpoints deleted when collection deleted)

### `created_by` - Creator Reference
- **Type**: CHAR(36)
- **Constraints**: NOT NULL, FOREIGN KEY
- **Description**: User who created the endpoint
- **Relationship**: users.id
- **Cascade**: DELETE (endpoint deleted when creator deleted)

### `created_at` - Creation Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Description**: When endpoint was created
- **Immutable**: Never changes after creation

### `updated_at` - Update Timestamp
- **Type**: TIMESTAMP
- **Default**: CURRENT_TIMESTAMP
- **Auto Update**: ON UPDATE CURRENT_TIMESTAMP
- **Description**: When endpoint was last updated

## Indexes

### `idx_collection`
- **Columns**: collection_id
- **Purpose**: Fast retrieval of endpoints in a collection
- **Usage**: Collection endpoint listing, API responses

### `idx_created_by`
- **Columns**: created_by
- **Purpose**: Track endpoints by creator
- **Usage**: User activity reports, audit trails

### `idx_method`
- **Columns**: method
- **Purpose**: Filter endpoints by HTTP method
- **Usage**: Method-based filtering, statistics

### `idx_name`
- **Columns**: name
- **Purpose**: Fast name-based searching
- **Usage**: Search functionality, endpoint lookup

### `idx_collection_method`
- **Columns**: collection_id, method
- **Purpose**: Composite index for collection+method queries
- **Usage**: Optimized collection filtering by method

## Data Examples

### GET Endpoint
```sql
INSERT INTO endpoints VALUES (
  'ep_abc123',
  'Get User Details',
  'GET',
  '{{API_BASE_URL}}/users/{{userId}}',
  '{"Authorization": "Bearer {{API_TOKEN}}"}',
  NULL,
  'col_def456',
  'user_ghi789',
  '2025-01-21 10:00:00',
  '2025-01-21 10:00:00'
);
```

### POST Endpoint with JSON Body
```sql
INSERT INTO endpoints VALUES (
  'ep_jkl012',
  'Create User',
  'POST',
  '{{API_BASE_URL}}/users',
  '{"Content-Type": "application/json", "Authorization": "Bearer {{API_TOKEN}}"}',
  '{"name": "{{name}}", "email": "{{email}}", "role": "user"}',
  'col_def456',
  'user_ghi789',
  '2025-01-21 10:05:00',
  '2025-01-21 10:05:00'
);
```

### PUT Endpoint with Form Data
```sql
INSERT INTO endpoints VALUES (
  'ep_mno345',
  'Update User Profile',
  'PUT',
  '{{API_BASE_URL}}/users/{{userId}}/profile',
  '{"Content-Type": "application/x-www-form-urlencoded"}',
  '{"firstName": "{{firstName}}", "lastName": "{{lastName}}"}',
  'col_def456',
  'user_ghi789',
  '2025-01-21 10:10:00',
  '2025-01-21 10:10:00'
);
```

## Query Examples

### Get Endpoints by Collection
```sql
SELECT
  id, name, method, url, created_at, updated_at
FROM endpoints
WHERE collection_id = 'col_def456'
ORDER BY name;
```

### Get Endpoints with Method Filtering
```sql
SELECT
  e.id, e.name, e.method, e.url,
  c.name as collection_name
FROM endpoints e
JOIN collections c ON e.collection_id = c.id
WHERE e.method = 'GET'
  AND c.project_id = 'proj_abc123'
ORDER BY c.name, e.name;
```

### Search Endpoints
```sql
SELECT
  e.id, e.name, e.method, e.url,
  c.name as collection_name
FROM endpoints e
JOIN collections c ON e.collection_id = c.id
WHERE c.project_id = 'proj_abc123'
  AND (
    LOWER(e.name) LIKE LOWER('%user%')
    OR LOWER(e.url) LIKE LOWER('%user%')
  )
ORDER BY e.name;
```

### Get Endpoint Statistics
```sql
SELECT
  method,
  COUNT(*) as count,
  COUNT(DISTINCT collection_id) as collections
FROM endpoints
WHERE collection_id IN (
  SELECT id FROM collections WHERE project_id = 'proj_abc123'
)
GROUP BY method
ORDER BY count DESC;
```

### Validate URL Variables
```sql
SELECT
  id, name, url
FROM endpoints
WHERE url REGEXP '\\{\\{[^}]+\\}\\}'
  AND collection_id = 'col_def456';
```

## Business Rules

### Method Validation
- **GET/HEAD/OPTIONS**: Body should be null
- **POST/PUT/PATCH**: Body typically required
- **DELETE**: Body optional
- **Method Specific**: Validation based on HTTP semantics

### URL Requirements
- **Template Variables**: Support `{{VARIABLE}}` format
- **Absolute URLs**: Must include protocol for external APIs
- **Relative URLs**: Support relative paths for same API
- **Validation**: Basic URL format validation

### Header Management
- **Case Insensitive**: Header names normalized to lowercase
- **Duplicate Keys**: Multiple values for same header key
- **Common Headers**: Auto-suggest standard headers
- **Security**: Filter sensitive headers in responses

### Body Validation
- **Content-Type**: Headers must match body format
- **Size Limits**: Enforce reasonable size limits
- **Format Validation**: JSON validation for JSON bodies
- **Variable Support**: Template variables in body content

## Performance Considerations

### Optimization Strategies
- **JSON Storage**: Efficient JSON field storage and indexing
- **Query Caching**: Cache frequently accessed endpoints
- **Text Search**: Full-text search on name and URL fields
- **Pagination**: Limit result sets for large collections

### Storage Optimization
- **JSON Compression**: Compress large JSON objects
- **Variable Extraction**: Cache extracted variables for performance
- **Index Usage**: Optimize indexes for common query patterns
- **Data Archival**: Archive unused endpoints periodically

## Security Considerations

### Data Protection
- **Sensitive Data**: Mask sensitive headers/body in logs
- **Access Control**: Enforce project-based access control
- **Audit Trail**: Log all endpoint modifications
- **Input Validation**: Strict validation of all input data

### Variable Security
- **Injection Prevention**: Prevent template injection attacks
- **Variable Validation**: Validate variable names and values
- **Environment Isolation**: Isolate variables by environment
- **Access Logging**: Log variable access for security monitoring

## Migration Considerations

### Schema Evolution
- **Method Changes**: Add new HTTP methods via ENUM alteration
- **Field Extensions**: Add optional fields with NULL defaults
- **JSON Schema**: Validate JSON structure changes
- **Backward Compatibility**: Maintain API compatibility

### Data Migration
- **Bulk Updates**: Use transactions for large data migrations
- **Validation**: Validate data integrity during migration
- **Performance**: Optimize migration for large datasets
- **Rollback**: Plan for migration rollback strategies