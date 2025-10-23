-- Seed: Projects Table
-- Description: Insert sample projects for development environment
-- Environment: Development
-- Dependencies: Users table (owner_id)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM projects WHERE name LIKE 'Sample %' OR name LIKE 'Demo %';

-- Insert Sample Projects
INSERT INTO projects (
    id, name, description, owner_id, api_key, is_public, settings,
    last_sync_at, created_at, updated_at
) VALUES
(
    'proj-001',
    'E-Commerce API',
    'Complete e-commerce backend API with products, orders, and payment processing',
    'user-001',
    'gass_ecomm_api_key_1234567890abcdef',
    0,
    '{"theme": "modern", "timeout": 30000, "retries": 3, "base_url": "https://api.ecommerce.example.com"}',
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    NOW()
),
(
    'proj-002',
    'Weather Service API',
    'Weather data API with forecasts, alerts, and historical data',
    'user-002',
    'gass_weather_api_key_0987654321fedcba',
    1,
    '{"theme": "default", "timeout": 15000, "retries": 2, "base_url": "https://api.weather.example.com"}',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
),
(
    'proj-003',
    'User Management System',
    'User authentication, authorization, and profile management API',
    'admin-001',
    'gass_usermgmt_api_key_abcdef1234567890',
    0,
    '{"theme": "dark", "timeout": 25000, "retries": 5, "base_url": "https://api.users.example.com"}',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
),
(
    'proj-004',
    'File Storage API',
    'Cloud file storage with upload, download, and sharing capabilities',
    'user-004',
    'gass_storage_api_key_1234567890abcdef',
    1,
    '{"theme": "minimal", "timeout": 60000, "retries": 3, "base_url": "https://api.storage.example.com"}',
    DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    NOW()
),
(
    'proj-005',
    'Analytics Dashboard API',
    'Business analytics and reporting API with real-time metrics',
    'user-001',
    'gass_analytics_api_key_fedcba0987654321',
    0,
    '{"theme": "enterprise", "timeout": 45000, "retries": 4, "base_url": "https://api.analytics.example.com"}',
    DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;