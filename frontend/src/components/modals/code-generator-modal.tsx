// Re-export dari struktur yang direfactor
export { CodeGeneratorModal as default, CodeGeneratorModal } from './code-generator-modal'

// Export utilities untuk penggunaan eksternal jika diperlukan
export { generateCodeSnippets, RequestData, CodeSnippet } from './code-generator-modal/utils/template-utils'
export { getLanguageConfig, getFileExtension, LANGUAGE_CONFIGS } from './code-generator-modal/utils/language-configs'
export * from './code-generator-modal/LanguageSelector'
export * from './code-generator-modal/TemplateRenderer'
export * from './code-generator-modal/CodePreview'