-- Migration: Create endpoints table
-- Description: Table for storing API endpoint definitions
-- Dependencies: folders table (folder_id), users table (created_by)

CREATE TABLE IF NOT EXISTS `endpoints` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `method` VARCHAR(50) NOT NULL,
  `url` VARCHAR(1024) NOT NULL,
  `headers` LONGTEXT NOT NULL,
  `body` LONGTEXT DEFAULT NULL,
  `folder_id` VARCHAR(255) NOT NULL,
  `created_by` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `endpoints_folder_name_unique` (`folder_id`,`name`),
  KEY `endpoints_folder_idx` (`folder_id`),
  KEY `endpoints_created_by_idx` (`created_by`),
  CONSTRAINT `endpoints_folder_fk` FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON DELETE CASCADE,
  CONSTRAINT `endpoints_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;