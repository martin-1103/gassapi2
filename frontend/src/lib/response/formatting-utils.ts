/**
 * Formatting utility functions for response handling
 */

/**
 * Determines the content type from response headers
 */
export const getContentType = (
  headers: Record<string, string> | undefined,
): string => {
  if (!headers) return 'unknown';
  const contentType = headers['content-type'] || headers['Content-Type'];
  return contentType?.split(';')[0] || 'unknown';
};

/**
 * Gets the language based on content type for syntax highlighting
 */
export const getLanguage = (contentType: string): string => {
  if (contentType.includes('json')) return 'json';
  if (contentType.includes('xml')) return 'xml';
  if (contentType.includes('html')) return 'html';
  if (contentType.includes('javascript')) return 'javascript';
  if (contentType.includes('css')) return 'css';
  if (contentType.includes('sql')) return 'sql';
  return 'text';
};

/**
 * Formats data based on the selected format mode
 */
export const formatData = (
  data: unknown,
  formatMode: 'pretty' | 'raw',
): string => {
  if (formatMode === 'raw') {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  if (typeof data === 'string') {
    try {
      return JSON.stringify(JSON.parse(data), null, 2);
    } catch {
      return data;
    }
  }

  return JSON.stringify(data, null, 2);
};

/**
 * Gets the appropriate syntax highlighter class based on language and theme
 */
export const getSyntaxHighlighterClass = (
  language: string,
  theme: 'dark' | 'light',
): string => {
  switch (language) {
    case 'json':
      return theme === 'dark' ? 'hljs-json' : 'hljs-json-light';
    case 'javascript':
      return theme === 'dark' ? 'hljs-javascript' : 'hljs-javascript-light';
    case 'html':
      return theme === 'dark' ? 'hljs-html' : 'hljs-html-light';
    case 'xml':
      return theme === 'dark' ? 'hljs-xml' : 'hljs-xml-light';
    default:
      return theme === 'dark' ? 'hljs-default' : 'hljs-default-light';
  }
};

/**
 * Determines if data should be treated as JSON for tree view
 */
export const isJsonData = (data: unknown, language: string): boolean => {
  return language === 'json' && typeof data === 'object' && data !== null;
};
