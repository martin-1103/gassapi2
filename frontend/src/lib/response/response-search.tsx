/**
 * Utility functions for response search functionality
 */

/**
 * Highlights search terms in text content
 */
export const highlightSearch = (text: string, searchTerm: string) => {
  if (!searchTerm) return text;

  // Safe regex construction with escaping
  const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
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
    // Validate key to prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return false;
    }
    return (
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof obj[key] === 'string' &&
        obj[key].toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });
};
