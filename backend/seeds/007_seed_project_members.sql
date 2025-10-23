-- Seed: Project Members Table
-- Description: Insert sample project membership relationships for development environment
-- Environment: Development
-- Dependencies: Projects table (project_id), Users table (user_id, invited_by)

SET FOREIGN_KEY_CHECKS = 0;

-- Clear existing seed data (for development refresh)
DELETE FROM project_members WHERE user_id LIKE 'user-%' OR project_id LIKE 'proj-%';

-- Insert Sample Project Members
INSERT INTO project_members (
    id, project_id, user_id, invited_by, joined_at, created_at
) VALUES
-- E-Commerce Project Members
(
    'pmem-001',
    'proj-001',
    'user-002', -- Jane Smith
    'user-001', -- Invited by John Doe (owner)
    DATE_SUB(NOW(), INTERVAL 20 DAY),
    DATE_SUB(NOW(), INTERVAL 20 DAY)
),
(
    'pmem-002',
    'proj-001',
    'user-004', -- Alice Brown
    'user-001', -- Invited by John Doe (owner)
    DATE_SUB(NOW(), INTERVAL 18 DAY),
    DATE_SUB(NOW(), INTERVAL 18 DAY)
),

-- Weather Project Members
(
    'pmem-003',
    'proj-002',
    'user-001', -- John Doe
    'user-002', -- Invited by Jane Smith (owner)
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    DATE_SUB(NOW(), INTERVAL 15 DAY)
),
(
    'pmem-004',
    'proj-002',
    'admin-001', -- Admin
    'user-002', -- Invited by Jane Smith (owner)
    DATE_SUB(NOW(), INTERVAL 12 DAY),
    DATE_SUB(NOW(), INTERVAL 12 DAY)
),

-- User Management Project Members
(
    'pmem-005',
    'proj-003',
    'user-001', -- John Doe
    'admin-001', -- Invited by Admin (owner)
    DATE_SUB(NOW(), INTERVAL 10 DAY),
    DATE_SUB(NOW(), INTERVAL 10 DAY)
),
(
    'pmem-006',
    'proj-003',
    'user-002', -- Jane Smith
    'admin-001', -- Invited by Admin (owner)
    DATE_SUB(NOW(), INTERVAL 8 DAY),
    DATE_SUB(NOW(), INTERVAL 8 DAY)
),
(
    'pmem-007',
    'proj-003',
    'user-004', -- Alice Brown
    'user-001', -- Invited by John Doe
    DATE_SUB(NOW(), INTERVAL 5 DAY),
    DATE_SUB(NOW(), INTERVAL 5 DAY)
),

-- File Storage Project Members
(
    'pmem-008',
    'proj-004',
    'user-002', -- Jane Smith
    'user-004', -- Invited by Alice Brown (owner)
    DATE_SUB(NOW(), INTERVAL 7 DAY),
    DATE_SUB(NOW(), INTERVAL 7 DAY)
),
(
    'pmem-009',
    'proj-004',
    'user-001', -- John Doe
    'user-004', -- Invited by Alice Brown (owner)
    DATE_SUB(NOW(), INTERVAL 6 DAY),
    DATE_SUB(NOW(), INTERVAL 6 DAY)
),

-- Analytics Project Members
(
    'pmem-010',
    'proj-005',
    'user-002', -- Jane Smith
    'user-001', -- Invited by John Doe (owner)
    DATE_SUB(NOW(), INTERVAL 3 DAY),
    DATE_SUB(NOW(), INTERVAL 3 DAY)
),
(
    'pmem-011',
    'proj-005',
    'admin-001', -- Admin
    'user-001', -- Invited by John Doe (owner)
    DATE_SUB(NOW(), INTERVAL 2 DAY),
    DATE_SUB(NOW(), INTERVAL 2 DAY)
),
(
    'pmem-012',
    'proj-005',
    'user-004', -- Alice Brown
    'user-002', -- Invited by Jane Smith
    DATE_SUB(NOW(), INTERVAL 1 DAY),
    DATE_SUB(NOW(), INTERVAL 1 DAY)
);

SET FOREIGN_KEY_CHECKS = 1;