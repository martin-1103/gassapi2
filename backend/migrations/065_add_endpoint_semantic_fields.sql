-- Migration: Add semantic fields to endpoints table
-- Description: Add optional fields for enhanced endpoint documentation
-- Version: 065
-- Dependencies: 004_create_endpoints_table.sql

-- First add description column if it doesn't exist
ALTER TABLE `endpoints`
ADD COLUMN `description` TEXT DEFAULT NULL COMMENT 'Endpoint description' AFTER `url`;

-- Then add semantic fields
ALTER TABLE `endpoints`
ADD COLUMN `purpose` VARCHAR(250) DEFAULT NULL COMMENT 'Business purpose of the endpoint' AFTER `description`,
ADD COLUMN `request_params` LONGTEXT DEFAULT NULL COMMENT 'JSON: Parameter documentation {param_name: "description"}',
ADD COLUMN `response_schema` LONGTEXT DEFAULT NULL COMMENT 'JSON: Response field documentation {field_name: "description"}',
ADD COLUMN `header_docs` LONGTEXT DEFAULT NULL COMMENT 'JSON: Header documentation {header_name: "description"}';