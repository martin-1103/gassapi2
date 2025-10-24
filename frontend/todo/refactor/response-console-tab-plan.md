# Refactoring Plan: src/components/workspace/response-viewer/ResponseConsoleTab.tsx

## Current State
- File Size: 374 lines
- Purpose: Console log viewer for debugging with error messages and performance metrics

## Issues Identified
- Complex UI for console logs
- Mixed concerns of error display and performance metrics
- Filtering logic mixed with display logic

## Refactoring Strategy

### 1. Extract UI Components
- Create: `ConsoleLogViewer` component
- Create: `ErrorList` component
- Create: `PerformanceMetrics` component
- Create: `ConsoleFilter` component

### 2. Create Custom Hook
- Create: `useConsoleState` hook
- Move all state management and business logic here
- Include functions for: log filtering, performance data processing, etc.

### 3. Extract Filtering Logic
- Create: `src/lib/console/console-filters.ts`
- Move all filtering functions here
- Include functions for: log level filtering, search, etc.

### 4. Extract Console Utilities
- Create: `src/lib/console/console-utils.ts`
- Move all console-related utility functions here
- Include functions for: log formatting, performance metric calculation, etc.

## Implementation Steps
1. Create new files for extracted UI components
2. Create custom hook for state management
3. Extract filtering logic to separate file
4. Extract console utilities
5. Update imports in the main ResponseConsoleTab.tsx file
6. Test each step to ensure no functionality is broken
7. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All console viewer functionality preserved
- Better separation of concerns
- Improved maintainability of UI and business logic