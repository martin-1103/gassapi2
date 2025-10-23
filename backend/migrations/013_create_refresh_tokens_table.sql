-- Migration: Create refresh_tokens table
-- Description: Table for storing JWT refresh tokens
-- Dependencies: users table (user_id)

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` VARCHAR(255) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `refresh_token_hash_unique` (`token_hash`),
  KEY `refresh_expires_idx` (`expires_at`),
  KEY `refresh_user_idx` (`user_id`),
  CONSTRAINT `refresh_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;