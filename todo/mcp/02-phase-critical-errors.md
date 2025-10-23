# MCP Linting Issues - Phase 2: Critical Errors
# Prioritas: Error-level issues yang menghentikan kompilasi

## 1. Unused Variables & Imports (Parallel Tasks)
# Files: Multiple source files
- Task: Remove unused imports and variables
- Priority: CRITICAL (19 errors)
- Dependencies: Foundation phase complete
- Impact: Menghilangkan compilation errors

### 1.1 auth.ts
- Remove unused import: McpToolHandler
- File: src/tools/auth.ts:1

### 1.2 collection.ts
- Remove unused imports: GassapiEndpoint, McpToolHandler
- Remove unused variables: result (line 313, 406), collections (line 374), id (line 460)
- File: src/tools/collection.ts

### 1.3 endpoint.ts
- Remove unused import: McpToolHandler
- Remove unused variable: result (lines 379, 436)
- File: src/tools/endpoint.ts

### 1.4 environment.ts
- Remove unused import: McpToolHandler
- File: src/tools/environment.ts

### 1.5 testing.ts
- Remove unused import: McpToolHandler
- File: src/tools/testing.ts

### 1.6 discovery/ConfigLoader.ts
- Remove unused variable: targetEnv (line 338)
- File: src/discovery/ConfigLoader.ts

### 1.7 index.ts
- Remove unused functions: loadConfigurationAndStart, showHelp
- File: src/index.ts

## 2. Null Safety Issues (Sequential Tasks)
# Files: config.ts, McpServer.ts
- Task: Add proper null checks and type guards
- Priority: HIGH (15 TypeScript errors)
- Dependencies: Setelah unused variables clean
- Impact: Memperbaiki type safety

### 2.1 config.ts Null Checks
- Add null checks for config variable (lines 205, 209, 213, 215, 219, 223)
- File: src/config.ts

### 2.2 McpServer.ts Type Safety
- Add type guards for undefined arguments in tool calls
- File: src/server/McpServer.ts

## Execution Strategy:
- Parallel: Semua unused variables bisa dibersihkan bersamaan
- Sequential: Null safety harus setelah clean-up untuk avoid confusion
- Test: Run npm run typecheck setelah setiap batch

## Notes:
- Error removal akan mempercepat development cycle
- Focus pada compilation errors dulu, baru warnings
- Backup files sebelum massive cleanup