-- Seed: Users Table
-- Description: Insert sample users for development environment
-- Environment: Development

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM users WHERE email LIKE '%@gassapi.com%' OR email LIKE '%@test.%';

-- Insert Admin User
INSERT INTO users (
    id, email, password_hash, name, avatar_url, is_active, email_verified,
    token_version, last_login_at, created_at, updated_at
) VALUES (
    'admin-001',
    'admin@gassapi.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'System Administrator',
    'https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff',
    1,
    1,
    1,
    NOW(),
    NOW(),
    NOW()
);

-- Insert Test Users
INSERT INTO users (
    id, email, password_hash, name, avatar_url, is_active, email_verified,
    token_version, last_login_at, created_at, updated_at
) VALUES
(
    'user-001',
    'john.doe@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'John Doe',
    'https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff',
    1,
    1,
    2,
    DATE_SUB(NOW(), INTERVAL 1 HOUR),
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    NOW()
),
(
    'user-002',
    'jane.smith@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Jane Smith',
    'https://ui-avatars.com/api/?name=Jane+Smith&background=ec4899&color=fff',
    1,
    1,
    3,
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    NOW()
),
(
    'user-003',
    'bob.wilson@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Bob Wilson',
    'https://ui-avatars.com/api/?name=Bob+Wilson&background=10b981&color=fff',
    1,
    0, -- Not verified
    1,
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    NOW()
),
(
    'user-004',
    'alice.brown@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Alice Brown',
    'https://ui-avatars.com/api/?name=Alice+Brown&background=f59e0b&color=fff',
    1,
    1,
    4,
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    NOW()
),
(
    'user-005',
    'charlie.davis@test.com',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
    'Charlie Davis',
    'https://ui-avatars.com/api/?name=Charlie+Davis&background=8b5cf6&color=fff',
    0, -- Inactive user
    1,
    2,
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    NOW()
);

SET FOREIGN_KEY_CHECKS = 1;