# Refactoring Plan: src/features/endpoints/EndpointBuilder.tsx

## Current State
- File Size: 495 lines
- Purpose: Builder interface for endpoint configuration with complex UI

## Issues Identified
- Large component with complex UI for multiple concerns
- Mixed business logic and presentation logic
- Difficult to maintain and extend

## Refactoring Strategy

### 1. Extract UI Components
- Create: `MethodSelector` component
- Create: `ParameterForm` component
- Create: `RequestBodyConfig` component
- Create: `AuthenticationConfig` component
- Create: `ResponseConfig` component
- Create: `EndpointValidationForm` component

### 2. Create Custom Hook
- Create: `useEndpointBuilderState` hook
- Move all state management and business logic here
- Include functions for: form validation, endpoint configuration, etc.

### 3. Extract Validation Logic
- Create: `src/lib/validations/endpoint-validation.ts`
- Move all validation functions here
- Include validation for endpoint URLs, parameters, headers, etc.

### 4. Extract Utilities
- Create: `src/lib/utils/endpoint-builder-utils.ts`
- Move all helper functions here
- Include utility functions for URL building, parameter formatting, etc.

## Implementation Steps
1. Create new files for extracted UI components
2. Create custom hook for state management
3. Extract validation logic to separate file
4. Update imports in the main EndpointBuilder.tsx file
5. Test each step to ensure no functionality is broken
6. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All endpoint building functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic