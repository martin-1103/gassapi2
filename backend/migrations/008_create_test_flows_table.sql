-- Migration: Create test_flows table
-- Description: Table for storing automated test flow definitions and execution history
-- Dependencies: projects table (project_id), users table (created_by)

CREATE TABLE IF NOT EXISTS `test_flows` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `config` LONGTEXT NOT NULL,
  `steps` LONGTEXT NOT NULL,
  `created_by` VARCHAR(255) NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_run_at` DATETIME DEFAULT NULL,
  `last_run_status` TEXT DEFAULT NULL,
  `total_runs` INT NOT NULL DEFAULT 0,
  `success_rate` FLOAT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `test_flows_project_name_unique` (`project_id`,`name`),
  KEY `test_flows_created_by_idx` (`created_by`),
  KEY `test_flows_is_active_idx` (`is_active`),
  KEY `test_flows_project_idx` (`project_id`),
  CONSTRAINT `test_flows_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `test_flows_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;