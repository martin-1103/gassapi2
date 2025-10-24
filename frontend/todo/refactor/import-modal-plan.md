# Refactoring Plan: src/components/modals/import-modal.tsx

## Current State
- File Size: 546 lines
- Purpose: Modal for import data/request with complex parsing logic and UI

## Issues Identified
- Contains both UI and business logic
- Complex parsing logic mixed with component rendering
- Large component with multiple concerns

## Refactoring Strategy

### 1. Extract Parsing Logic
- Create: `src/lib/parsers/import-parser.ts`
- Move all parsing functions and utilities here
- Include parsers for different import formats (JSON, CSV, etc.)

### 2. Extract UI Components
- Create: `ImportPreviewTable` component
- Create: `ImportConfigForm` component  
- Create: `ImportProgress` component
- Create: `ImportFormatSelector` component

### 3. Create Custom Hook
- Create: `useImportModalLogic` hook
- Move all state management and business logic here
- Include functions for: file processing, parsing, validation, progress tracking

### 4. Extract Validation Logic
- Create: `src/lib/validations/import-validation.ts`
- Move all validation functions here
- Include validation for file formats, required fields, etc.

## Implementation Steps
1. Create new files for extracted functionality
2. Move logic incrementally while ensuring functionality remains
3. Update imports in the main import-modal.tsx file
4. Test each step to ensure no functionality is broken
5. Verify UI behavior remains consistent

## Success Criteria
- Original file reduced to <300 lines
- All functionality preserved
- Better separation of concerns
- Improved testability of individual components