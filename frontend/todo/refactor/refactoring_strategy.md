# Refactoring Strategy for Large Files

This document outlines the refactoring strategy for large files identified in the project (files with >300 lines).

## 🔴 Critical Files (> 500 lines)

### 1. **src/components/modals/import-modal.tsx** - 546 lines
- **Current Issues**: Modal for import data/request; likely contains complex parsing logic and UI
- **Refactoring Strategy**:
  - Extract parsing logic into `src/lib/parsers/import-parser.ts`
  - Extract UI components: `ImportPreviewTable`, `ImportConfigForm`, `ImportProgress`
  - Create custom hook: `useImportModalLogic` for state management
  - Move validation logic to `src/lib/validations/import-validation.ts`

### 2. **src/lib/testing/test-runner.ts** - 526 lines
- **Current Issues**: Complex test execution engine logic
- **Refactoring Strategy**:
  - Extract assertion logic to `src/lib/testing/assertion-engine.ts`
  - Extract validation logic to `src/lib/testing/validation-engine.ts`
  - Create `TestRunnerEngine` class with smaller methods
  - Extract response handling to `src/lib/testing/response-handler.ts`

## 🟡 Large Files (400-500 lines)

### 3. **src/features/endpoints/EndpointBuilder.tsx** - 495 lines
- **Current Issues**: Complex UI for endpoint configuration
- **Refactoring Strategy**:
  - Split into multiple sub-components: `MethodSelector`, `ParameterForm`, `RequestBodyConfig`, `AuthenticationConfig`
  - Create custom hook: `useEndpointBuilderState`
  - Extract form validation to `src/lib/validations/endpoint-validation.ts`

### 4. **src/components/workspace/response-tabs/tests-tab.tsx** - 492 lines
- **Current Issues**: Complex UI for test results and execution
- **Refactoring Strategy**:
  - Extract `TestResultViewer`, `AssertionList`, `TestExecutionControls`
  - Create custom hook: `useTestResultsState`
  - Extract test execution logic to `src/lib/testing/test-execution.ts`

### 5. **src/components/workspace/request-tabs/RequestParamsTab.tsx** - 470 lines
- **Current Issues**: Complex parameter management UI
- **Refactoring Strategy**:
  - Extract `QueryParamsEditor`, `PathParamEditor`, `UrlEncoder`
  - Create custom hook: `useRequestParamState`
  - Extract validation logic to `src/lib/validations/param-validation.ts`

### 6. **src/lib/history/request-history.ts** - 448 lines
- **Current Issues**: Complex history management with storage and filtering
- **Refactoring Strategy**:
  - Split into: `src/lib/history/history-storage.ts`, `src/lib/history/history-search.ts`, `src/lib/history/history-filters.ts`
  - Create `HistoryManager` class to encapsulate functionality

### 7. **src/components/workspace/request-tabs/body-tab.tsx** - 440 lines
- **Current Issues**: Complex UI for multiple content types
- **Refactoring Strategy**:
  - Extract content type editors: `JsonBodyEditor`, `XmlBodyEditor`, `FormDataEditor`, `RawBodyEditor`
  - Create custom hook: `useRequestBodyState`
  - Extract preview logic to `src/lib/preview/body-preview.ts`

### 8. **src/components/workspace/response-viewer/ResponseBodyTab.tsx** - 436 lines
- **Current Issues**: Complex response body formatting and display
- **Refactoring Strategy**:
  - Extract: `JsonViewer`, `XmlViewer`, `TextViewer`, `BinaryViewer`
  - Extract search functionality to `src/lib/response/response-search.ts`
  - Create custom hook: `useResponseBodyState`

### 9. **src/components/workspace/request-tabs/tests-tab.tsx** - 432 lines
- **Current Issues**: Complex test configuration UI
- **Refactoring Strategy**:
  - Extract: `AssertionBuilder`, `TestScriptEditor`, `TestResultViewer`
  - Create custom hook: `useTestConfigurationState`
  - Extract assertion logic to `src/lib/testing/test-assertions.ts`

## 🟢 Moderate Files (300-400 lines)

### 10. **src/lib/testing/assertions.tsx** - 423 lines
- **Current Issues**: Large assertion library
- **Refactoring Strategy**:
  - Split into: `src/lib/testing/assertions/json-assertions.ts`, `src/lib/testing/assertions/header-assertions.ts`, `src/lib/testing/assertions/status-assertions.ts`
  - Create assertion factory pattern to manage different assertion types

### 11. **src/components/workspace/response-viewer/ResponseCookiesTab.tsx** - 419 lines
- **Current Issues**: Complex cookie management UI
- **Refactoring Strategy**:
  - Extract: `CookieTable`, `CookieEditor`, `CookieSecurityInfo`
  - Create custom hook: `useCookieManagementState`

### 12. **src/components/workspace/response-viewer/ModernResponseViewer.tsx** - 412 lines
- **Current Issues**: Comprehensive response viewer with multiple tabs
- **Refactoring Strategy**:
  - Extract tab components: `StatusTab`, `HeadersTab`, `BodyTab`, `CookiesTab`, `TimelineTab`
  - Create custom hook: `useResponseViewState`
  - Extract metadata display to `ResponseMetadata` component

### 13. **src/components/workspace/response-tabs/body-tab.tsx** - 395 lines
- **Current Issues**: Response body visualization
- **Refactoring Strategy**:
  - Extract format-specific viewers: `JsonResponseViewer`, `XmlResponseViewer`, etc.
  - Extract search functionality to `src/lib/response/search-response.ts`
  - Create custom hook: `useResponseBodyViewState`

### 14. **src/components/workspace/request-tabs/headers-tab.tsx** - 381 lines
- **Current Issues**: Complex HTTP headers configuration
- **Refactoring Strategy**:
  - Extract: `HeaderTable`, `HeaderTemplates`, `HeaderSuggestions`
  - Create custom hook: `useHeadersState`
  - Extract validation logic to `src/lib/validations/header-validation.ts`

### 15. **src/components/workspace/response-viewer/ResponseConsoleTab.tsx** - 374 lines
- **Current Issues**: Console log viewer with error messages
- **Refactoring Strategy**:
  - Extract: `ConsoleLogViewer`, `ErrorList`, `PerformanceMetrics`
  - Create custom hook: `useConsoleState`
  - Extract filtering logic to `src/lib/console/console-filters.ts`

### 16. **src/components/modals/code-generator-modal/utils/template-utils.ts** - 365 lines
- **Current Issues**: Code generation templates for multiple languages
- **Refactoring Strategy**:
  - Split by language: `src/components/modals/code-generator-modal/utils/curl-templates.ts`, `src/components/modals/code-generator-modal/utils/javascript-templates.ts`, etc.
  - Create `TemplateManager` class to handle template selection and generation

### 17. **src/components/workspace/response-tabs/headers-tab.tsx** - 335 lines
- **Current Issues**: Response headers analysis and display
- **Refactoring Strategy**:
  - Extract: `HeaderAnalyzer`, `HeaderFilter`, `SecurityHeaderInfo`
  - Create custom hook: `useResponseHeadersState`

### 18. **src/lib/utils/http-utils.ts** - 324 lines
- **Current Issues**: Various HTTP utility functions
- **Refactoring Strategy**:
  - Split into: `src/lib/utils/http-request-utils.ts`, `src/lib/utils/http-response-utils.ts`, `src/lib/utils/content-type-utils.ts`

### 19. **src/lib/api/direct-client.ts** - 306 lines
- **Current Issues**: Direct API client with error handling
- **Refactoring Strategy**:
  - Split into: `src/lib/api/request-handler.ts`, `src/lib/api/response-handler.ts`, `src/lib/api/error-handler.ts`
  - Create `ApiClient` class with smaller methods

### 20. **src/components/workspace/request-tabs/params-tab.tsx** - 304 lines
- **Current Issues**: URL parameters management
- **Refactoring Strategy**:
  - Extract: `QueryParamEditor`, `PathParamEditor`, `ParamEncodingUtils`
  - Create custom hook: `useUrlParamsState`

## 🔄 General Refactoring Approaches

### Component Extraction
- Extract complex UI sections into smaller, focused components
- Follow single responsibility principle for each component
- Use composition to build complex UI from simpler parts

### Custom Hooks
- Move complex state management to custom hooks
- Extract business logic from components to keep them focused on UI
- Reuse logic across multiple components when appropriate

### Utility Functions
- Extract reusable functions to dedicated utility files
- Group related utilities by functionality
- Keep utility functions pure and testable

### Type Definitions
- Move complex type definitions to dedicated files
- Create type aliases for complex nested types
- Use interfaces for object shapes

### State Management
- Consider external state management solutions for complex state
- Implement context providers for shared state
- Use state machines for complex state transitions

## 📋 Refactoring Execution Order

1. **Critical Priority** (> 500 lines)
   - `import-modal.tsx`
   - `test-runner.ts`

2. **High Priority** (400-500 lines)
   - `EndpointBuilder.tsx`
   - `tests-tab.tsx` (response)
   - `RequestParamsTab.tsx`
   - `request-history.ts`
   - `body-tab.tsx` (request)
   - `ResponseBodyTab.tsx`
   - `tests-tab.tsx` (request)

3. **Medium Priority** (300-400 lines)
   - All remaining files in order of impact/importance

## ⚠️ Precautions

1. Maintain all existing functionality during refactoring
2. Update all import paths after file splitting
3. Ensure all tests pass after each refactoring step
4. Preserve existing API contracts
5. Update documentation if necessary
6. Verify UI behavior remains consistent