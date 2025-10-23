-- Seed: MCP Client Tokens Table
-- Description: Insert sample MCP client tokens for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id), Users table (created_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM mcp_client_tokens WHERE project_id LIKE 'proj-%';

-- Insert Sample MCP Client Tokens
INSERT INTO mcp_client_tokens (
    id, project_id, token_hash, last_validated_at, created_by,
    created_at, is_active
) VALUES
-- E-Commerce Project MCP Tokens
(
    'mcp-001',
    'proj-001',
    '$2y$10$mY8hN9vQ8wF3L7Xz2Kp5Ve9rP6sJ1tUo4YdZ5cWb7Aa8BfCcDdEeFfGgHhIiJjKk',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'user-001',
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    1
),
(
    'mcp-002',
    'proj-001',
    '$2y$10$nX9iO0wR4xG4M8Yz3Lq6Wf8rQ7sJ2tUo5YeZa9cWb8Bb9CcDdEeFfGgHhIiJjKkLl',
    DATE_SUB(NOW(), INTERVAL 2 HOUR),
    'user-002',
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    1
),

-- Weather Project MCP Tokens
(
    'mcp-003',
    'proj-002',
    '$2y$10$pY1jP2xS5yH5N9Xa4Mr7Xg9sR8tK3vUo6ZfAa0dXc9CcC1DdEeFfGgHhIiJjKkLlMm',
    DATE_SUB(NOW(), INTERVAL 15 MINUTE),
    'user-002',
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    1
),
(
    'mcp-004',
    'proj-002',
    '$2y$10$qZ2kQ3yT6zI6O0Yb5Ns8Yh0tS9uL4wUo7AgBb1eYd0DdD2EeFfGgHhIiJjKkLlMmNn',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    1
),

-- User Management Project MCP Tokens
(
    'mcp-005',
    'proj-003',
    '$2y$10$rA3lR4zU7jJ7P1Zc6Ot9Zi1uT0vM5xUo8BhCc2fZe1EeE3FfGgHhIiJjKkLlMmNnOo',
    DATE_SUB(NOW(), INTERVAL 45 MINUTE),
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 14 DAY),
    1
),
(
    'mcp-006',
    'proj-003',
    '$2y$10$sB4mS5vK8kK8Q2Ad7Pu0Aj2vU1wN6yUo9CiDd3Af2FfF4GgHhIiJjKkLlMmNnOoPp',
    DATE_SUB(NOW(), INTERVAL 3 HOUR),
    'user-001',
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    1
),
(
    'mcp-007',
    'proj-003',
    '$2y$10$tC5nT6wL9lL9R3Be8Qv1Bk3wX2oO7zUp0DjEe4Bg3Gg5HhIiJjKkLlMmNnOoPpQq',
    DATE_SUB(NOW(), INTERVAL 6 HOUR),
    'user-002',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    1
),

-- File Storage Project MCP Tokens
(
    'mcp-008',
    'proj-004',
    '$2y$10$uD7oU7xMmM8mS4Cf9Rw2Cl4yY3pP8xVq1EkFf5Ch4Hh6IiJjKkLlMmNnOoPpQqRr',
    DATE_SUB(NOW(), INTERVAL 20 MINUTE),
    'user-004',
    DATE_SUB(NOW(), INTERVAL 9 DAY),
    1
),
(
    'mcp-009',
    'proj-004',
    '$2y$10$vE8pV8yNnN9nT5Dg0Sx3Dm5zZ4qQ9yWr2FlGg6Di5Ii7JjKkLlMmNnOoPpQqRrSs',
    DATE_SUB(NOW(), INTERVAL 4 HOUR),
    'user-002',
    DATE_SUB(NOW(), INTERVAL 6 DAY),
    1
),

-- Analytics Project MCP Tokens
(
    'mcp-010',
    'proj-005',
    '$2y$10$wF9qW9zOoO0oU6Eh1Ty4En6aA5rR0zXs3GmHh7Ej6Jj8KkLlMmNnOoPpQqRrSsTt',
    DATE_SUB(NOW(), INTERVAL 10 MINUTE),
    'user-001',
    DATE_SUB(NOW(), INTERVAL 4 DAY),
    1
),
(
    'mcp-011',
    'proj-005',
    '$2y$10$xG0rX0aPpP1pV7Fi2Uz5Fo7bB6sS1aYt4HnIi8Fk7Kk9LlMmNnOoPpQqRrSsTtUu',
    DATE_SUB(NOW(), INTERVAL 30 MINUTE),
    'admin-001',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    1
),
(
    'mcp-012',
    'proj-005',
    '$2y$10$yH1sY1bQqQ2qW8Gj3V0Gp8cC7tT2bZu5JoJj9Gl8Ll0MmNnOoPpQqRrSsTtUuVv',
    DATE_SUB(NOW(), INTERVAL 90 MINUTE),
    'user-002',
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    1
),

-- Inactive MCP Tokens (for testing)
(
    'mcp-013',
    'proj-001',
    '$2y$10$zI2tZ2cRrR3rX9Hk4W1Hq9dD8uU3cXv6KpKk0Hm9Mm1NnOoPpQqRrSsTtUuVvWw',
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    'user-003',
    DATE_SUB(NOW(), INTERVAL 25 DAY),
    0
),
(
    'mcp-014',
    'proj-002',
    '$2y$10$aJ3uA3dSsS4sY0Il5X2Ir0eE9vV4dYw7LqLl1In0Nn2OoPpQqRrSsTtUuVvWwXx',
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    'user-005',
    DATE_SUB(NOW(), INTERVAL 22 DAY),
    0
);

SET FOREIGN_KEY_CHECKS = 1;