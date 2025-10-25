-- Seed: Endpoints Table
-- Description: Insert sample API endpoints for development environment
-- Environment: Development
-- Dependencies: Folders table (folder_id), Users table (created_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM endpoints WHERE name LIKE 'Demo %' OR name LIKE 'Sample %';

-- Insert Sample Endpoints
INSERT INTO endpoints (
    id, name, method, url, headers, body, folder_id, created_by,
    created_at, updated_at
) VALUES
-- E-Commerce Authentication Endpoints
(
    'endp-001',
    'User Login',
    'POST',
    '/auth/login',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"email": "john.doe@example.com", "password": "{{password}}"}',
    'fold-001',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 23 DAY),
    NOW()
),
(
    'endp-002',
    'User Registration',
    'POST',
    '/auth/register',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"name": "{{userName}}", "email": "{{userEmail}}", "password": "{{password}}"}',
    'fold-001',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 23 DAY),
    NOW()
),
(
    'endp-003',
    'Refresh Token',
    'POST',
    '/auth/refresh',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    '{"refreshToken": "{{refreshToken}}"}',
    'fold-001',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 22 DAY),
    NOW()
),

-- E-Commerce Product Endpoints
(
    'endp-004',
    'Get All Products',
    'GET',
    '/products?page={{page}}&limit={{limit}}&category={{category}}',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{authToken}}"}',
    NULL,
    'fold-002',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 22 DAY),
    NOW()
),
(
    'endp-005',
    'Get Product Details',
    'GET',
    '/products/{{productId}}',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{authToken}}"}',
    NULL,
    'fold-002',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 21 DAY),
    NOW()
),
(
    'endp-006',
    'Create Product',
    'POST',
    '/products',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{authToken}}"}',
    '{"name": "{{productName}}", "description": "{{description}}", "price": {{price}}, "category": "{{category}}", "stock": {{stock}}}',
    'fold-002',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 21 DAY),
    NOW()
),

-- Weather API Endpoints
(
    'endp-007',
    'Current Weather by City',
    'GET',
    '/weather/current?city={{cityName}}&units={{units}}',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    NULL,
    'fold-004',
    'user-002',
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    NOW()
),
(
    'endp-008',
    'Current Weather by Coordinates',
    'GET',
    '/weather/current?lat={{latitude}}&lon={{longitude}}&units={{units}}',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    NULL,
    'fold-004',
    'user-002',
    DATE_SUB(NOW(), INTERVAL 17 DAY),
    NOW()
),
(
    'endp-009',
    '5-Day Forecast',
    'GET',
    '/weather/forecast?city={{cityName}}&days={{days}}',
    '{"Content-Type": "application/json", "Accept": "application/json"}',
    NULL,
    'fold-005',
    'user-002',
    DATE_SUB(NOW(), INTERVAL 17 DAY),
    NOW()
),

-- User Management API Endpoints
(
    'endp-010',
    'Get All Users',
    'GET',
    '/admin/users?page={{page}}&limit={{limit}}',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{adminToken}}"}',
    NULL,
    'fold-006',
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 13 DAY),
    NOW()
),
(
    'endp-011',
    'Update User Status',
    'PATCH',
    '/admin/users/{{userId}}/status',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{adminToken}}"}',
    '{"isActive": {{isActive}}, "emailVerified": {{emailVerified}}}',
    'fold-006',
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    NOW()
),

-- File Storage API Endpoints
(
    'endp-012',
    'Upload File',
    'POST',
    '/files/upload',
    '{"Content-Type": "multipart/form-data", "Accept": "application/json", "Authorization": "Bearer {{storageToken}}"}',
    'file: {{file}}\nfolder: {{folder}}\npublic: {{isPublic}}',
    'fold-008',
    'user-004',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    NOW()
),
(
    'endp-013',
    'Download File',
    'GET',
    '/files/{{fileId}}/download',
    '{"Accept": "application/octet-stream", "Authorization": "Bearer {{storageToken}}"}',
    NULL,
    'fold-008',
    'user-004',
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
),

-- Analytics API Endpoints
(
    'endp-014',
    'Dashboard Overview',
    'GET',
    '/dashboard/overview?startDate={{startDate}}&endDate={{endDate}}',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{analyticsToken}}"}',
    NULL,
    'fold-009',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    NOW()
),
(
    'endp-015',
    'Generate Report',
    'POST',
    '/reports/generate',
    '{"Content-Type": "application/json", "Accept": "application/json", "Authorization": "Bearer {{analyticsToken}}"}',
    '{"type": "{{reportType}}", "startDate": "{{startDate}}", "endDate": "{{endDate}}", "format": "{{format}}"}',
    'fold-010',
    'user-001',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;