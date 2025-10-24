#!/usr/bin/env node

/**
 * GASSAPI MCP Client CLI Entry Point
 * Executable script for global installation
 */

import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory containing this script
const scriptDir = path.dirname(fileURLToPath(import.meta.url));

// Resolve to the dist directory
const distDir = path.resolve(scriptDir, '..', 'dist');

// Add dist to NODE_PATH for TypeScript resolution
process.env.NODE_PATH = [
  path.join(distDir),
  process.env.NODE_PATH || ''
].join(path.delimiter);

// Import and run the CLI
import('file://' + path.join(distDir, 'index.js'));