-- Migration: Create flows table
-- Description: Table for storing API flow automation definitions
-- Dependencies: projects table (project_id), collections table (collection_id), users table (created_by)

CREATE TABLE IF NOT EXISTS `flows` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `collection_id` VARCHAR(255) DEFAULT NULL,
  `flow_data` LONGTEXT NOT NULL,
  `created_by` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `flows_project_name_unique` (`project_id`,`name`),
  KEY `flows_collection_idx` (`collection_id`),
  KEY `flows_created_by_idx` (`created_by`),
  KEY `flows_is_active_idx` (`is_active`),
  KEY `flows_project_idx` (`project_id`),
  CONSTRAINT `flows_collection_fk` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE,
  CONSTRAINT `flows_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `flows_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;