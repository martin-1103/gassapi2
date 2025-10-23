-- Migration: Create environments table
-- Description: Table for storing environment configurations
-- Dependencies: projects table (project_id)

CREATE TABLE IF NOT EXISTS `environments` (
  `id` VARCHAR(255) NOT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `variables` LONGTEXT NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `environments_project_name_unique` (`project_id`,`name`),
  KEY `environments_project_idx` (`project_id`),
  CONSTRAINT `environments_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;