-- Migration: Create users table
-- Description: Table for storing user accounts and authentication data

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `token_version` INT NOT NULL DEFAULT 0,
  `last_login_at` DATETIME DEFAULT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_is_active_idx` (`is_active`),
  KEY `users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;