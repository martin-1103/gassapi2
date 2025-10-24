# Refactoring Plan: src/components/workspace/response-tabs/body-tab.tsx

## Current State
- File Size: 395 lines
- Purpose: Response body visualization with format detection and syntax highlighting

## Issues Identified
- Complex UI with multiple formatting options
- Format detection logic mixed with display logic
- Export functionality mixed with visualization

## Refactoring Strategy

### 1. Extract Format-Specific Viewers
- Create: `JsonResponseViewer` component
- Create: `XmlResponseViewer` component
- Create: `TextViewer` component
- Create: `BinaryResponseViewer` component
- Create: `HtmlResponseViewer` component

### 2. Create Custom Hook
- Create: `useResponseBodyViewState` hook
- Move all state management and business logic here
- Include functions for: format detection, export, etc.

### 3. Extract Search Functionality
- Create: `src/lib/response/search-response.ts`
- Move all search functions here
- Include functions for: text search in response, highlighting, etc.

### 4. Extract Format Detection Utilities
- Create: `src/lib/response/format-detection.ts`
- Move all format detection functions here
- Include functions for: content type detection, format analysis, etc.

## Implementation Steps
1. Create new files for format-specific viewer components
2. Create custom hook for state management
3. Extract search functionality to separate file
4. Extract format detection utilities
5. Update imports in the main body-tab.tsx file
6. Test each step to ensure no functionality is broken
7. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All response body visualization functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic