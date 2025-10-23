-- Seed: Collections Table
-- Description: Insert sample API collections for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id), Users table (created_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM collections WHERE name LIKE 'Demo %' OR name LIKE 'Sample %';

-- Insert Sample Collections
INSERT INTO collections (
    id, name, description, project_id, parent_id, headers, variables,
    is_default, created_by, created_at, updated_at
) VALUES
-- E-Commerce API Collections
(
    'coll-001',
    'Authentication',
    'User authentication and authorization endpoints',
    'proj-001',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"baseUrl": "https://api.ecommerce.example.com", "version": "v1"}',
    1,
    'user-001',
    DATE_SUB(NOW(), INTERVAL 24 DAY),
    NOW()
),
(
    'coll-002',
    'Products',
    'Product management endpoints (CRUD operations)',
    'proj-001',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{authToken}}"}',
    '{"baseUrl": "https://api.ecommerce.example.com", "version": "v1"}',
    0,
    'user-001',
    DATE_SUB(NOW(), INTERVAL 23 DAY),
    NOW()
),
(
    'coll-003',
    'Orders',
    'Order processing and management endpoints',
    'proj-001',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{authToken}}"}',
    '{"baseUrl": "https://api.ecommerce.example.com", "version": "v1"}',
    0,
    'user-001',
    DATE_SUB(NOW(), INTERVAL 22 DAY),
    NOW()
),

-- Weather API Collections
(
    'coll-004',
    'Current Weather',
    'Current weather data endpoints',
    'proj-002',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"baseUrl": "https://api.weather.example.com", "apiKey": "{{weatherApiKey}}"}',
    1,
    'user-002',
    DATE_SUB(NOW(), INTERVAL 19 DAY),
    NOW()
),
(
    'coll-005',
    'Forecasts',
    'Weather forecast endpoints',
    'proj-002',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"baseUrl": "https://api.weather.example.com", "apiKey": "{{weatherApiKey}}"}',
    0,
    'user-002',
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    NOW()
),

-- User Management API Collections
(
    'coll-006',
    'User Accounts',
    'User account management endpoints',
    'proj-003',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{adminToken}}"}',
    '{"baseUrl": "https://api.users.example.com", "version": "v1"}',
    1,
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 14 DAY),
    NOW()
),
(
    'coll-007',
    'Permissions',
    'Role and permission management endpoints',
    'proj-003',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{adminToken}}"}',
    '{"baseUrl": "https://api.users.example.com", "version": "v1"}',
    0,
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 13 DAY),
    NOW()
),

-- File Storage API Collections
(
    'coll-008',
    'File Management',
    'File upload, download, and management endpoints',
    'proj-004',
    NULL,
    '{"Content-Type": "multipart/form-data", "Accept": "application/json", "Authorization": "Bearer {{storageToken}}"}',
    '{"baseUrl": "https://api.storage.example.com", "version": "v2"}',
    1,
    'user-004',
    DATE_SUB(NOW(), INTERVAL 9 DAY),
    NOW()
),

-- Analytics API Collections
(
    'coll-009',
    'Dashboard Metrics',
    'Dashboard and analytics metrics endpoints',
    'proj-005',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{analyticsToken}}"}',
    '{"baseUrl": "https://api.analytics.example.com", "version": "v1"}',
    1,
    'user-001',
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    NOW()
),
(
    'coll-010',
    'Reports',
    'Reporting and data export endpoints',
    'proj-005',
    NULL,
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{analyticsToken}}"}',
    '{"baseUrl": "https://api.analytics.example.com", "version": "v1"}',
    0,
    'user-001',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;