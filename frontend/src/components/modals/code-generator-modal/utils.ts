// Export utilities terpisah dari component exports untuk React Fast Refresh
export { generateCodeSnippets } from './utils/template-utils';

export {
  getLanguageConfig,
  getFileExtension,
  LANGUAGE_CONFIGS,
} from './utils/language-configs';

// Export types separately
export type { RequestData, CodeSnippet } from './utils/template-utils';
