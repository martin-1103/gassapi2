/**
 * Cookie parsing and utility functions
 */

export interface CookieType {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: Date;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

/**
 * Parse cookie string from headers
 */
export const parseCookies = (cookieString: string): CookieType[] => {
  try {
    const cookies: CookieType[] = [];

    cookieString.split(';').forEach(cookie => {
      const [nameValue, ...attributes] = cookie.trim().split('=');
      if (nameValue) {
        const [name, ...valueParts] = nameValue.split(':');
        if (name && valueParts.length > 0) {
          cookies.push({
            name: name.trim(),
            value: valueParts.join(':').trim(),
            domain: attributes
              .find(attr => attr.trim().toLowerCase().startsWith('domain='))
              ?.split('=')[1]
              ?.trim(),
            path: attributes
              .find(attr => attr.trim().toLowerCase().startsWith('path='))
              ?.split('=')[1]
              ?.trim(),
            expires: (() => {
              const expiresAttr = attributes.find(attr =>
                attr.trim().toLowerCase().startsWith('expires='),
              );
              return expiresAttr
                ? new Date(expiresAttr.split('=')[1])
                : undefined;
            })(),
            httpOnly: attributes.some(
              attr => attr.trim().toLowerCase() === 'httponly',
            ),
            secure: attributes.some(
              attr => attr.trim().toLowerCase() === 'secure',
            ),
            sameSite: 'Strict' as const,
          });
        }
      }
    });

    return cookies;
  } catch {
    return [];
  }
};

/**
 * Extract cookies from response headers
 */
export const extractCookiesFromHeaders = (
  cookies: Record<string, string | string[]>,
): CookieType[] => {
  const cookieList: CookieType[] = [];

  // Parse from Set-Cookie headers
  const setCookieHeaders = Object.entries(cookies).filter(
    ([key]) => key.toLowerCase() === 'set-cookie',
  );

  setCookieHeaders.forEach(([, value]) => {
    if (typeof value === 'string') {
      cookieList.push(...parseCookies(value));
    }
  });

  // Parse from Cookie header
  const cookieHeader = cookies['cookie'] || cookies['Cookie'];
  if (cookieHeader) {
    if (typeof cookieHeader === 'string') {
      cookieList.push(...parseCookies(cookieHeader));
    } else if (Array.isArray(cookieHeader)) {
      cookieHeader.forEach(header => {
        if (typeof header === 'string') {
          cookieList.push(...parseCookies(header));
        }
      });
    }
  }

  return cookieList;
};

/**
 * Format cookie expiry date
 */
export const formatExpiry = (date?: Date): string => {
  if (!date) return 'Session';
  return date.toUTCString();
};

/**
 * Check if cookie is expired
 */
export const isCookieExpired = (cookie: CookieType): boolean => {
  if (!cookie.expires) return false;
  return cookie.expires.getTime() < Date.now();
};

/**
 * Format cookies for cURL export
 */
export const formatCookiesForCurl = (cookies: CookieType[]): string => {
  return cookies
    .map(cookie => {
      let cookieString = `${cookie.name}=${encodeURIComponent(cookie.value)}`;

      if (cookie.domain) cookieString += `; Domain=${cookie.domain}`;
      if (cookie.path) cookieString += `; Path=${cookie.path}`;
      if (cookie.expires)
        cookieString += `; Expires=${cookie.expires.toUTCString()}`;
      if (cookie.httpOnly) cookieString += '; HttpOnly';
      if (cookie.secure) cookieString += '; Secure';
      if (cookie.sameSite && cookie.sameSite !== 'None')
        cookieString += `; SameSite=${cookie.sameSite}`;

      return cookieString;
    })
    .join('\n');
};

/**
 * Prepare cookies data for export
 */
export const prepareCookiesForExport = (cookies: CookieType[]) => {
  return cookies.map(cookie => ({
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain || '',
    path: cookie.path || '',
    expires: cookie.expires ? cookie.expires.toISOString() : '',
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
  }));
};

/**
 * Filter cookies by search query
 */
export const filterCookies = (
  cookies: CookieType[],
  searchQuery: string,
): CookieType[] => {
  if (!searchQuery.trim()) return cookies;

  const query = searchQuery.toLowerCase();
  return cookies.filter(
    cookie =>
      cookie.name.toLowerCase().includes(query) ||
      cookie.value.toLowerCase().includes(query) ||
      (cookie.domain && cookie.domain.toLowerCase().includes(query)),
  );
};
