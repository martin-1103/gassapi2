# Refactoring Plan: src/components/workspace/request-tabs/body-tab.tsx

## Current State
- File Size: 440 lines
- Purpose: Request body configuration interface supporting multiple content types

## Issues Identified
- Complex UI for multiple content types
- Mixed concerns of UI and content type handling
- Difficult to maintain and extend

## Refactoring Strategy

### 1. Extract Content Type Editors
- Create: `JsonBodyEditor` component
- Create: `XmlBodyEditor` component
- Create: `FormDataEditor` component
- Create: `RawBodyEditor` component
- Create: `BinaryBodyEditor` component

### 2. Create Custom Hook
- Create: `useRequestBodyState` hook
- Move all state management and business logic here
- Include functions for: content type switching, validation, etc.

### 3. Extract Preview Logic
- Create: `src/lib/preview/body-preview.ts`
- Move all preview generation functions here
- Include functions for: content preview, formatting, etc.

### 4. Extract Content Type Utilities
- Create: `src/lib/utils/body-utils.ts`
- Move all body-related utility functions here
- Include functions for: content type detection, formatting, etc.

## Implementation Steps
1. Create new files for content type editor components
2. Create custom hook for state management
3. Extract preview logic to separate file
4. Extract content type utilities
5. Update imports in the main body-tab.tsx file
6. Test each step to ensure no functionality is broken
7. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All body configuration functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic