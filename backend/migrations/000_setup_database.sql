-- Migration: Setup database
-- Description: Create database and disable foreign key checks for migration
-- This should be run first before other migrations

SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `gassapi` DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
USE `gassapi`;