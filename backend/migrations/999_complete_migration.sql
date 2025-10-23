-- Migration: Complete migration
-- Description: Re-enable foreign key checks after all tables are created
-- This should be run last after all other migrations

SET FOREIGN_KEY_CHECKS = 1;