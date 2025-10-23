-- Migration: Create projects table
-- Description: Table for storing API projects
-- Dependencies: users table (owner_id)

CREATE TABLE IF NOT EXISTS `projects` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `owner_id` VARCHAR(255) NOT NULL,
  `api_key` VARCHAR(255) DEFAULT NULL,
  `is_public` TINYINT(1) NOT NULL DEFAULT 0,
  `settings` LONGTEXT NOT NULL,
  `last_sync_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `projects_owner_name_unique` (`owner_id`,`name`),
  UNIQUE KEY `projects_api_key_unique` (`api_key`),
  KEY `projects_api_key_idx` (`api_key`),
  CONSTRAINT `projects_owner_fk` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;