-- Migration: Create password_reset_tokens table
-- Description: Table for storing password reset tokens
-- Dependencies: users table (user_id)

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` VARCHAR(255) NOT NULL,
  `token_hash` VARCHAR(255) NOT NULL,
  `user_id` VARCHAR(255) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `password_reset_token_hash_unique` (`token_hash`),
  KEY `password_reset_expires_idx` (`expires_at`),
  KEY `password_reset_user_idx` (`user_id`),
  CONSTRAINT `password_reset_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;