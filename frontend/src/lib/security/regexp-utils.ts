/**
 * RegExp Security Utilities
 *
 * Utility functions untuk safe RegExp construction dan pencegahan ReDoS attacks
 */

/**
 * Escape special characters dalam string untuk digunakan dalam RegExp
 * Ini adalah polyfill untuk RegExp.escape() yang belum tersedia di JavaScript
 */
export function escapeRegExp(str: string): string {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string');
  }

  // Escape semua special regex characters
  // Based on MDN recommendations: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Validasi input untuk RegExp construction
 */
export function validateRegExpInput(input: string): {
  isValid: boolean;
  reason?: string;
} {
  if (typeof input !== 'string') {
    return { isValid: false, reason: 'Input must be a string' };
  }

  // Cek panjang input untuk prevent ReDoS
  if (input.length > 1000) {
    return { isValid: false, reason: 'Input too long (max 1000 characters)' };
  }

  // Cek nested quantifiers yang bisa menyebabkan ReDoS
  const dangerousPatterns = [
    /\*{2,}/, // Multiple asterisks
    /\+{2,}/, // Multiple plus signs
    /\?{2,}/, // Multiple question marks
    /\{[^}]*,[^}]*\}/, // Ranges with large numbers
    /\(\?[^)]*\)/, // Complex lookaheads
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, reason: 'Dangerous regex pattern detected' };
    }
  }

  return { isValid: true };
}

/**
 * Safe RegExp constructor dengan validasi dan escaping
 */
export function createSafeRegExp(
  pattern: string,
  flags?: string,
  options?: {
    maxLength?: number;
    allowComplex?: boolean;
  },
): RegExp {
  const maxLength = options?.maxLength || 1000;
  const allowComplex = options?.allowComplex || false;

  // Validasi input
  if (typeof pattern !== 'string') {
    throw new Error('Pattern must be a string');
  }

  if (pattern.length > maxLength) {
    throw new Error(`Pattern too long (max ${maxLength} characters)`);
  }

  // Validasi flags
  if (flags && typeof flags !== 'string') {
    throw new Error('Flags must be a string');
  }

  // Escape pattern jika berasal dari user input
  const escapedPattern = escapeRegExp(pattern);

  // Jika complex patterns tidak diizinkan, lakukan validasi tambahan
  if (!allowComplex) {
    const validation = validateRegExpInput(escapedPattern);
    if (!validation.isValid) {
      throw new Error(`Invalid pattern: ${validation.reason}`);
    }
  }

  try {
    // escapedPattern is safe because it was processed by escapeRegExp()
    // eslint-disable-next-line security/detect-non-literal-regexp
    return new RegExp(escapedPattern, flags);
  } catch (error) {
    throw new Error(
      `Failed to create RegExp: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Safe string search dengan RegExp fallback
 * Fungsi ini menggunakan string methods jika possible, RegExp hanya jika necessary
 */
export function safeStringSearch(
  text: string,
  pattern: string,
  options?: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
  },
): boolean {
  if (!text || !pattern) {
    return false;
  }

  const { caseSensitive = false, wholeWord = false } = options || {};

  // Simple substring search untuk case yang tidak kompleks
  if (!wholeWord && !caseSensitive) {
    return text.toLowerCase().includes(pattern.toLowerCase());
  }

  if (!wholeWord && caseSensitive) {
    return text.includes(pattern);
  }

  // Use RegExp hanya untuk whole word search
  const escapedPattern = escapeRegExp(pattern);
  const wordPattern = wholeWord ? `\\b${escapedPattern}\\b` : escapedPattern;
  const flags = caseSensitive ? 'g' : 'gi';

  try {
    // wordPattern is safe because it's built from escapedPattern
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(wordPattern, flags);
    return regex.test(text);
  } catch {
    // Fallback ke simple search
    return caseSensitive
      ? text.includes(pattern)
      : text.toLowerCase().includes(pattern.toLowerCase());
  }
}

/**
 * Highlight text dengan safe RegExp construction
 * Untuk digunakan di UI components seperti search highlighting
 */
export function safeHighlightText(
  text: string,
  searchTerm: string,
  options?: {
    className?: string;
    caseSensitive?: boolean;
  },
): string {
  if (!text || !searchTerm) {
    return text;
  }

  const { className = 'highlight', caseSensitive = false } = options || {};

  try {
    const escapedTerm = escapeRegExp(searchTerm);
    const flags = caseSensitive ? 'g' : 'gi';
    // escapedTerm is safe because it was processed by escapeRegExp()
    // eslint-disable-next-line security/detect-non-literal-regexp
    const regex = new RegExp(`(${escapedTerm})`, flags);

    return text.replace(regex, `<span class="${className}">$1</span>`);
  } catch {
    // Fallback: return original text tanpa logging untuk production
    return text;
  }
}

// Export default untuk convenience
export default {
  escapeRegExp,
  validateRegExpInput,
  createSafeRegExp,
  safeStringSearch,
  safeHighlightText,
};
