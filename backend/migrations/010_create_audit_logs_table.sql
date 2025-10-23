-- Migration: Create audit_logs table
-- Description: Table for tracking system audit events and user activities
-- Dependencies: users table (user_id), projects table (project_id)

CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) DEFAULT NULL,
  `project_id` VARCHAR(255) DEFAULT NULL,
  `action` VARCHAR(255) NOT NULL,
  `resource_type` VARCHAR(255) NOT NULL,
  `resource_id` VARCHAR(255) DEFAULT NULL,
  `old_values` LONGTEXT DEFAULT NULL,
  `new_values` LONGTEXT DEFAULT NULL,
  `ip_address` VARCHAR(255) DEFAULT NULL,
  `user_agent` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `category` VARCHAR(255) DEFAULT 'system',
  `duration` INT DEFAULT NULL,
  `metadata` LONGTEXT DEFAULT NULL,
  `severity` VARCHAR(255) DEFAULT 'low',
  PRIMARY KEY (`id`),
  KEY `audit_logs_action_idx` (`action`),
  KEY `audit_logs_category_idx` (`category`),
  KEY `audit_logs_created_at_idx` (`created_at`),
  KEY `audit_logs_project_idx` (`project_id`),
  KEY `audit_logs_resource_type_idx` (`resource_type`),
  KEY `audit_logs_severity_idx` (`severity`),
  KEY `audit_logs_user_idx` (`user_id`),
  CONSTRAINT `audit_logs_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  CONSTRAINT `audit_logs_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;