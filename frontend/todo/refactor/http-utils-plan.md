# Refactoring Plan: src/lib/utils/http-utils.ts

## Current State
- File Size: 324 lines
- Purpose: HTTP utility functions for request/response processing

## Issues Identified
- Mixed utilities for different HTTP operations
- All HTTP-related utilities in one file
- Difficult to maintain and extend

## Refactoring Strategy

### 1. Split by HTTP Operation Type
- Create: `src/lib/utils/http-request-utils.ts`
  - Handle request-specific utilities (request building, formatting, etc.)
- Create: `src/lib/utils/http-response-utils.ts`
  - Handle response-specific utilities (parsing, formatting, etc.)
- Create: `src/lib/utils/content-type-utils.ts`
  - Handle content type detection and parsing utilities

### 2. Extract into Separate Modules
- Group related functions by their purpose
- Create focused utility modules

### 3. Create HTTP Utilities Manager
- Create: `HttpUtils` class to provide organized access to utilities
- Consolidate functionality while maintaining separation

## Implementation Steps
1. Create new files for different HTTP utility types
2. Move utility functions incrementally while ensuring functionality remains
3. Update imports in any files that use http-utils.ts
4. Create HttpUtils class if needed for unified access
5. Test each step to ensure no functionality is broken
6. Update any calling code to use new structure

## Success Criteria
- Original file reduced to <300 lines or removed entirely
- All HTTP utility functionality preserved
- Better separation of concerns by operation type
- Improved maintainability and extensibility