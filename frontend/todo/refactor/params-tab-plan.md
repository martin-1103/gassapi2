# Refactoring Plan: src/components/workspace/request-tabs/params-tab.tsx

## Current State
- File Size: 304 lines
- Purpose: URL parameters management with query builder and encoding

## Issues Identified
- Complex UI for parameter management
- Mixed concerns of UI and parameter processing
- Encoding functionality mixed with form logic

## Refactoring Strategy

### 1. Extract UI Components
- Create: `QueryParamEditor` component
- Create: `PathParamEditor` component
- Create: `ParamEncodingUtils` component
- Create: `ParamBuilderForm` component

### 2. Create Custom Hook
- Create: `useUrlParamsState` hook
- Move all state management and business logic here
- Include functions for: parameter validation, URL encoding, etc.

### 3. Extract Parameter Utilities
- Create: `src/lib/utils/param-building-utils.ts`
- Move all parameter-related utility functions here
- Include functions for: URL building, encoding/decoding, etc.

### 4. Extract Validation Logic
- Create: `src/lib/validations/url-param-validation.ts`
- Move all validation functions here
- Include validation for query params, path params, encoding, etc.

## Implementation Steps
1. Create new files for extracted UI components
2. Create custom hook for state management
3. Extract parameter utilities to separate file
4. Extract validation logic
5. Update imports in the main params-tab.tsx file
6. Test each step to ensure no functionality is broken
7. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All parameter management functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic