-- Migration: Create collections table
-- Description: Table for organizing API endpoints into collections
-- Dependencies: projects table (project_id), users table (created_by), collections table (parent_id)

CREATE TABLE IF NOT EXISTS `collections` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `parent_id` VARCHAR(255) DEFAULT NULL,
  `headers` LONGTEXT NOT NULL,
  `variables` LONGTEXT NOT NULL,
  `is_default` TINYINT(1) NOT NULL DEFAULT 0,
  `created_by` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `collections_project_name_unique` (`project_id`,`name`),
  KEY `collections_created_by_idx` (`created_by`),
  KEY `collections_parent_id_idx` (`parent_id`),
  KEY `collections_project_id_idx` (`project_id`),
  CONSTRAINT `collections_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE,
  CONSTRAINT `collections_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `collections_parent_fk` FOREIGN KEY (`parent_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;