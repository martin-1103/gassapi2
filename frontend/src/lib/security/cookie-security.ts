/**
 * Cookie security validation and warning functions
 */

import type { CookieType } from '@/lib/utils/cookie-utils'

/**
 * Get security icon based on cookie security attributes
 */
export const getSecurityIcon = (cookie: CookieType) => {
  if (cookie.secure && cookie.httpOnly) {
    return { icon: 'shield', className: 'text-green-600' }
  }
  if (cookie.secure) {
    return { icon: 'shield', className: 'text-blue-600' }
  }
  if (cookie.httpOnly) {
    return { icon: 'shield', className: 'text-yellow-600' }
  }
  return { icon: 'info', className: 'text-gray-400' }
}

/**
 * Get security level text for cookie
 */
export const getSecurityLevel = (cookie: CookieType): string => {
  if (cookie.secure && cookie.httpOnly) return 'Secure + HttpOnly'
  if (cookie.secure) return 'Secure only'
  if (cookie.httpOnly) return 'HttpOnly only'
  return 'No security'
}

/**
 * Get security warnings for cookie
 */
export const getSecurityWarnings = (cookie: CookieType): string[] => {
  const warnings: string[] = []

  if (!cookie.secure && !cookie.httpOnly) {
    warnings.push('Cookie is neither secure nor HttpOnly - vulnerable to XSS and interception')
  }

  if (!cookie.secure) {
    warnings.push('Cookie can be sent over unencrypted HTTP connections')
  }

  if (!cookie.httpOnly) {
    warnings.push('Cookie is accessible to JavaScript - vulnerable to XSS attacks')
  }

  if (cookie.sameSite === 'None' && !cookie.secure) {
    warnings.push('SameSite=None requires Secure attribute')
  }

  if (!cookie.expires) {
    warnings.push('Session cookie - will be cleared when browser closes')
  }

  return warnings
}

/**
 * Check if cookie has adequate security settings
 */
export const hasAdequateSecurity = (cookie: CookieType): boolean => {
  return cookie.secure && cookie.httpOnly
}

/**
 * Get cookie security score (0-100)
 */
export const getSecurityScore = (cookie: CookieType): number => {
  let score = 0

  if (cookie.secure) score += 40
  if (cookie.httpOnly) score += 40
  if (cookie.sameSite !== 'None') score += 20

  return score
}