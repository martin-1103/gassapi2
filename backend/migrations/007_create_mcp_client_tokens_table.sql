-- Migration: Create mcp_client_tokens table
-- Description: Table for storing MCP client authentication tokens
-- Dependencies: projects table (project_id), users table (created_by)

CREATE TABLE IF NOT EXISTS `mcp_client_tokens` (
  `id` VARCHAR(255) NOT NULL,
  `project_id` VARCHAR(255) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `last_validated_at` DATETIME DEFAULT NULL,
  `created_by` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `mcp_token_hash_unique` (`token_hash`),
  KEY `mcp_created_by_idx` (`created_by`),
  KEY `mcp_is_active_idx` (`is_active`),
  KEY `mcp_project_idx` (`project_id`),
  CONSTRAINT `mcp_created_by_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
  CONSTRAINT `mcp_project_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;