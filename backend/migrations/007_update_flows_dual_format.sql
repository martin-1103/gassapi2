-- Migration: Update Flows Table for Dual Format Support
-- Description: Add support for React Flow UI format and flow inputs
-- Dependencies: 006_create_flows_table.sql

-- Add flow_inputs column for dynamic input definitions
ALTER TABLE `flows`
ADD COLUMN `flow_inputs` LONGTEXT DEFAULT NULL
COMMENT 'JSON array of flow input definitions for dynamic variables';

-- Add ui_data column for React Flow format
ALTER TABLE `flows`
ADD COLUMN `ui_data` LONGTEXT DEFAULT NULL
COMMENT 'React Flow format data for UI (nodes, edges, positions)';

-- Add metadata columns for AI support
ALTER TABLE `flows`
ADD COLUMN `ai_version` VARCHAR(100) DEFAULT NULL
COMMENT 'AI system version that generated this flow';

ALTER TABLE `flows`
ADD COLUMN `generation_strategy` VARCHAR(100) DEFAULT NULL
COMMENT 'AI strategy used for flow generation';

ALTER TABLE `flows`
ADD COLUMN `complexity_score` DECIMAL(3,2) DEFAULT NULL
COMMENT 'Flow complexity score (0.00-1.00) for AI learning';

-- Add indexes for new columns
ALTER TABLE `flows`
ADD INDEX `flows_ai_version_idx` (`ai_version`);

ALTER TABLE `flows`
ADD INDEX `flows_complexity_idx` (`complexity_score`);

-- Update existing flows to have UI data (convert from existing flow_data)
UPDATE `flows`
SET `ui_data` = `flow_data`
WHERE `ui_data` IS NULL AND `flow_data` IS NOT NULL;

-- Set default flow_inputs for existing flows (empty array)
UPDATE `flows`
SET `flow_inputs` = '[]'
WHERE `flow_inputs` IS NULL;

-- Set default complexity score for existing flows
UPDATE `flows`
SET `complexity_score` = 0.50
WHERE `complexity_score` IS NULL;