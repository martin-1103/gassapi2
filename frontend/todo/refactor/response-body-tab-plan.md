# Refactoring Plan: src/components/workspace/response-viewer/ResponseBodyTab.tsx

## Current State
- File Size: 436 lines
- Purpose: Response body display and formatting with search functionality

## Issues Identified
- Complex UI with multiple formatting options
- Mixed concerns of UI and content formatting
- Search functionality mixed with display logic

## Refactoring Strategy

### 1. Extract Format-Specific Viewers
- Create: `JsonResponseViewer` component
- Create: `XmlResponseViewer` component
- Create: `TextViewer` component
- Create: `BinaryResponseViewer` component
- Create: `HtmlResponseViewer` component

### 2. Create Custom Hook
- Create: `useResponseBodyState` hook
- Move all state management and business logic here
- Include functions for: format detection, search, etc.

### 3. Extract Search Functionality
- Create: `src/lib/response/response-search.ts`
- Move all search functions here
- Include functions for: text search in response, highlighting, etc.

### 4. Extract Formatting Utilities
- Create: `src/lib/response/formatting-utils.ts`
- Move all response formatting functions here
- Include functions for: syntax highlighting, formatting, etc.

## Implementation Steps
1. Create new files for format-specific viewer components
2. Create custom hook for state management
3. Extract search functionality to separate file
4. Extract formatting utilities
5. Update imports in the main ResponseBodyTab.tsx file
6. Test each step to ensure no functionality is broken
7. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All response body display functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic