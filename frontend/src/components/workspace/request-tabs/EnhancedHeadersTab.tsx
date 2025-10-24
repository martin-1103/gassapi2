// EnhancedHeadersTab - Refactored into modular components
// This file now exports the refactored version for backward compatibility

// Export component only for Fast Refresh
export { default } from './enhanced-headers-tab';

// Export types secara terpisah
export type {
  RequestHeader,
  EnhancedHeadersTabProps,
} from './enhanced-headers-tab/types';
