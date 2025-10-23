-- Seed: Environments Table
-- Description: Insert sample environment configurations for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM environments WHERE name IN ('Development', 'Staging', 'Production');

-- Insert Sample Environments for each project
INSERT INTO environments (
    id, project_id, name, description, variables, is_default,
    created_at, updated_at
) VALUES
-- E-Commerce API Environments
(
    'env-001',
    'proj-001',
    'Development',
    'Local development environment',
    '{"baseUrl": "http://localhost:3000", "apiKey": "dev_key_123", "timeout": 30000, "debug": true}',
    1,
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    NOW()
),
(
    'env-002',
    'proj-001',
    'Staging',
    'Staging environment for testing',
    '{"baseUrl": "https://staging-api.ecommerce.example.com", "apiKey": "staging_key_456", "timeout": 25000, "debug": false}',
    0,
    DATE_SUB(NOW(), INTERVAL 24 DAY),
    NOW()
),
(
    'env-003',
    'proj-001',
    'Production',
    'Production environment',
    '{"baseUrl": "https://api.ecommerce.example.com", "apiKey": "{{prod_api_key}}", "timeout": 20000, "debug": false}',
    0,
    DATE_SUB(NOW(), INTERVAL 24 DAY),
    NOW()
),

-- Weather API Environments
(
    'env-004',
    'proj-002',
    'Development',
    'Local weather service development',
    '{"baseUrl": "http://localhost:8080", "apiKey": "weather_dev_key", "units": "metric", "cache": false}',
    1,
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
),
(
    'env-005',
    'proj-002',
    'Staging',
    'Staging weather service',
    '{"baseUrl": "https://staging-api.weather.example.com", "apiKey": "weather_staging_key", "units": "metric", "cache": true}',
    0,
    DATE_SUB(NOW(), INTERVAL 19 DAY),
    NOW()
),
(
    'env-006',
    'proj-002',
    'Production',
    'Production weather service',
    '{"baseUrl": "https://api.weather.example.com", "apiKey": "{{weather_prod_key}}", "units": "metric", "cache": true}',
    0,
    DATE_SUB(NOW(), INTERVAL 19 DAY),
    NOW()
),

-- User Management API Environments
(
    'env-007',
    'proj-003',
    'Development',
    'Local user management development',
    '{"baseUrl": "http://localhost:4000", "adminToken": "dev_admin_token", "jwtSecret": "dev_secret", "tokenExpiry": 3600}',
    1,
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
),
(
    'env-008',
    'proj-003',
    'Production',
    'Production user management',
    '{"baseUrl": "https://api.users.example.com", "adminToken": "{{prod_admin_token}}", "jwtSecret": "{{prod_jwt_secret}}", "tokenExpiry": 1800}',
    0,
    DATE_SUB(NOW(), INTERVAL 14 DAY),
    NOW()
),

-- File Storage API Environments
(
    'env-009',
    'proj-004',
    'Development',
    'Local file storage development',
    '{"baseUrl": "http://localhost:5000", "storageToken": "dev_storage_token", "maxFileSize": "10MB", "allowedTypes": ["jpg","png","pdf","txt"]}',
    1,
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    NOW()
),
(
    'env-010',
    'proj-004',
    'Staging',
    'Staging file storage',
    '{"baseUrl": "https://staging-api.storage.example.com", "storageToken": "staging_storage_token", "maxFileSize": "50MB", "allowedTypes": ["jpg","png","gif","pdf","doc","docx","txt"]}',
    0,
    DATE_SUB(NOW(), INTERVAL 9 DAY),
    NOW()
),

-- Analytics API Environments
(
    'env-011',
    'proj-005',
    'Development',
    'Local analytics development',
    '{"baseUrl": "http://localhost:6000", "analyticsToken": "dev_analytics_token", "cacheTimeout": 300, "batchSize": 100}',
    1,
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    NOW()
),
(
    'env-012',
    'proj-005',
    'Production',
    'Production analytics',
    '{"baseUrl": "https://api.analytics.example.com", "analyticsToken": "{{prod_analytics_token}}", "cacheTimeout": 3600, "batchSize": 1000}',
    0,
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;