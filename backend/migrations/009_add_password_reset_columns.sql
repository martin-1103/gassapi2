-- Migration: Add password reset columns to users table
-- Description: Add columns for password reset functionality

ALTER TABLE `users`
ADD COLUMN `password_reset_token` VARCHAR(255) DEFAULT NULL AFTER `email_verified`,
ADD COLUMN `password_reset_token_expires_at` DATETIME DEFAULT NULL AFTER `password_reset_token`,
ADD INDEX `users_password_reset_token_idx` (`password_reset_token`);