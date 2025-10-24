# Refactoring Plan: src/lib/testing/assertions.tsx

## Current State
- File Size: 423 lines
- Purpose: Assertion library for API testing with various validators and matchers

## Issues Identified
- Large library with mixed assertion types
- All assertion logic in one file
- Difficult to maintain and extend

## Refactoring Strategy

### 1. Split by Assertion Type
- Create: `src/lib/testing/assertions/json-assertions.ts`
  - Handle JSON-specific assertions (property existence, value matching, etc.)
- Create: `src/lib/testing/assertions/header-assertions.ts`
  - Handle header-specific assertions (existence, value, etc.)
- Create: `src/lib/testing/assertions/status-assertions.ts`
  - Handle status code assertions
- Create: `src/lib/testing/assertions/content-assertions.ts`
  - Handle content-specific assertions (content type, length, etc.)

### 2. Create Assertion Factory Pattern
- Create: `src/lib/testing/assertion-factory.ts`
- Provide clean API to create different types of assertions
- Consolidate functionality while maintaining separation

### 3. Extract Utilities
- Create: `src/lib/testing/assertion-utils.ts`
- Move utility functions for assertion operations

## Implementation Steps
1. Create new files for different assertion types
2. Create assertion factory pattern
3. Move assertion logic incrementally while ensuring functionality remains
4. Update imports in any files that use assertions.ts
5. Test each step to ensure no functionality is broken
6. Update any calling code to use new structure

## Success Criteria
- Original file reduced to <300 lines or removed entirely
- All assertion functionality preserved
- Better separation of concerns by assertion type
- Improved maintainability and extensibility