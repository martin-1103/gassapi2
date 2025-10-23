-- Migration: Add updated_at column to mcp_client_tokens table
-- Description: Add missing updated_at column for BaseRepository compatibility
-- Dependencies: 007_create_mcp_client_tokens_table.sql

ALTER TABLE `mcp_client_tokens`
ADD COLUMN `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`;