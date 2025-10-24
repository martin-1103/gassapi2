// Export types dari types.ts
export { RequestData, CodeSnippet } from './types';

// Re-export dari TemplateManager untuk backward compatibility
export { TemplateManager, generateCodeSnippets } from './TemplateManager';

// Legacy alias untuk compatibility
export { TemplateManager as CodeTemplateGenerator } from './TemplateManager';
