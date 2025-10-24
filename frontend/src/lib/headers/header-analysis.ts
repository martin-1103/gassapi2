/**
 * Header analysis logic untuk categorization dan filtering
 */

export const STANDARD_HEADERS = [
  'content-type',
  'content-length',
  'content-encoding',
  'content-disposition',
  'cache-control',
  'expires',
  'etag',
  'last-modified',
  'accept-ranges',
  'age',
  'allow',
  'server',
  'date',
  'connection',
  'authorization',
  'www-authenticate',
  'set-cookie',
  'cookie',
  'location',
  'refresh',
  'x-frame-options',
  'x-xss-protection',
  'x-content-type-options',
  'strict-transport-security',
  'content-security-policy',
];

export const categorizeHeader = (key: string) => {
  const keyLower = key.toLowerCase();
  if (keyLower.startsWith('content-')) return 'Content';
  if (keyLower.startsWith('cache-')) return 'Cache';
  if (keyLower.includes('auth') || keyLower.includes('authorization'))
    return 'Authentication';
  if (keyLower.includes('cors') || keyLower.includes('access-control'))
    return 'CORS';
  if (keyLower.startsWith('x-')) return 'Custom';
  if (keyLower.includes('security') || keyLower.includes('protection'))
    return 'Security';
  return 'General';
};

export const getHeaderCategoryColor = (category: string) => {
  switch (category) {
    case 'Content':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Cache':
      return 'bg-green-50 text-green-800 border-green-200';
    case 'Authentication':
      return 'bg-orange-50 text-orange-800 border-orange-200';
    case 'CORS':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'Security':
      return 'bg-red-50 text-red-800 border-red-200';
    case 'Custom':
      return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};

export const filterHeaders = (
  headers: Record<string, string>,
  searchQuery: string,
  showOnlyStandard: boolean
) => {
  let filtered = Object.entries(headers);

  if (showOnlyStandard) {
    filtered = filtered.filter(([key]) =>
      STANDARD_HEADERS.includes(key.toLowerCase()),
    );
  }

  if (searchQuery) {
    filtered = filtered.filter(
      ([key, value]) =>
        key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        value.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  return filtered;
};

export const groupHeadersByCategory = (
  filteredHeaders: Array<[string, string]>
) => {
  return filteredHeaders.reduce(
    (acc, [key, value]) => {
      const category = categorizeHeader(key);
      if (!acc[category]) acc[category] = [];
      acc[category].push([key, value]);
      return acc;
    },
    {} as Record<string, Array<[string, string]>>,
  );
};