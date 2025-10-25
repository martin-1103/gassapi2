/**
 * Utility functions for response search functionality
 */

import { logger } from '@/lib/logger';
import {
  validatePropertyName,
  safePropertyAccess,
} from '@/lib/security/object-injection-utils';
import { createSafeRegExp } from '@/lib/security/regexp-utils';

/**
 * Highlights search terms in text content
 */
export const highlightSearch = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;

  try {
    // Gunakan safe RegExp construction dengan validasi
    const regex = createSafeRegExp(`(${searchTerm})`, 'gi', {
      maxLength: 200,
      allowComplex: false,
    });
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <mark key={index} className='bg-yellow-200 px-1 rounded'>
            {part}
          </mark>
        );
      }
      return part;
    });
  } catch (error) {
    // Fallback: return original text jika RegExp creation gagal
    logger.warn('Failed to highlight search term', error, 'response-search');
    return text;
  }
};

/**
 * Filters array items based on a search term
 */
export const filterArray = (arr: unknown[], searchTerm: string) => {
  if (!searchTerm) return arr;

  return arr.filter(item => {
    if (typeof item === 'string') {
      return item.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (typeof item === 'object' && item !== null) {
      return Object.values(item).some(
        value =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return false;
  });
};

/**
 * Filters object keys based on a search term
 */
export const filterObjectKeys = (
  obj: Record<string, unknown>,
  searchTerm: string,
) => {
  if (!searchTerm) return Object.keys(obj);

  return Object.keys(obj).filter(key => {
    // Validate key menggunakan security utilities
    const keyValidation = validatePropertyName(key);
    if (!keyValidation.isValid) {
      return false;
    }

    // Safe property access untuk value
    const value = safePropertyAccess(obj, key);

    return (
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof value === 'string' &&
        value.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
};
