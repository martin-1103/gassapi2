# Refactoring Plan: src/components/modals/code-generator-modal/utils/template-utils.ts

## Current State
- File Size: 365 lines
- Purpose: Code generation templates for multiple languages

## Issues Identified
- Mixed templates for multiple programming languages
- All template logic in one file
- Difficult to maintain and extend

## Refactoring Strategy

### 1. Split by Programming Language
- Create: `src/components/modals/code-generator-modal/utils/curl-templates.ts`
  - Handle curl code generation templates
- Create: `src/components/modals/code-generator-modal/utils/javascript-templates.ts`
  - Handle JavaScript code generation templates
- Create: `src/components/modals/code-generator-modal/utils/python-templates.ts`
  - Handle Python code generation templates
- Create: `src/components/modals/code-generator-modal/utils/java-templates.ts`
  - Handle Java code generation templates
- Create: `src/components/modals/code-generator-modal/utils/go-templates.ts`
  - Handle Go code generation templates

### 2. Create Template Manager Class
- Create: `TemplateManager` class to handle template selection and generation
- Provide clean API to access different language templates
- Consolidate functionality while maintaining separation

### 3. Extract Utilities
- Create: `src/components/modals/code-generator-modal/utils/code-gen-utils.ts`
- Move common utility functions for code generation

## Implementation Steps
1. Create new files for different language templates
2. Create TemplateManager class
3. Move template logic incrementally while ensuring functionality remains
4. Update imports in any files that use template-utils.ts
5. Test each step to ensure no functionality is broken
6. Update any calling code to use new structure

## Success Criteria
- Original file reduced to <300 lines or removed entirely
- All code generation functionality preserved
- Better separation of concerns by language
- Improved maintainability and extensibility