-- Migration: Create project_members table
-- Description: Table for managing project member relationships and invitations
-- Dependencies: projects table (project_id), users table (user_id, invited_by)

CREATE TABLE IF NOT EXISTS `project_members` (
  `id` VARCHAR(255) NOT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `invited_by` VARCHAR(255) NOT NULL,
  `joined_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `project_members_project_user_unique` (`project_id`,`user_id`),
  KEY `project_members_invited_by_idx` (`invited_by`),
  KEY `project_members_project_idx` (`project_id`),
  KEY `project_members_user_idx` (`user_id`),
  CONSTRAINT `project_members_invited_by_fk` FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`),
  CONSTRAINT `project_members_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;