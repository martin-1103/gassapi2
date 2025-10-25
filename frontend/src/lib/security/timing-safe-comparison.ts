/**
 * Timing-safe comparison utilities to prevent timing attacks
 */

/**
 * Timing-safe string comparison function
 * Compares two strings in constant time regardless of their content
 *
 * @param a First string to compare
 * @param b Second string to compare
 * @returns true if strings are equal, false otherwise
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  // Early return if lengths differ - this is safe as length check is constant time
  if (a.length !== b.length) {
    return false;
  }

  // Convert strings to buffers for byte-by-byte comparison
  const bufferA = new TextEncoder().encode(a);
  const bufferB = new TextEncoder().encode(b);

  // Perform constant-time comparison
  // Using safe array access with explicit type conversion
  let result = 0;
  for (let i = 0; i < bufferA.length; i++) {
    // Ensure we're working with numbers (bytes) to prevent injection issues
    // eslint-disable-next-line security/detect-object-injection
    const byteA = Number(bufferA[i]) || 0;
    // eslint-disable-next-line security/detect-object-injection
    const byteB = Number(bufferB[i]) || 0;
    result |= byteA ^ byteB;
  }

  // result will be 0 only if all bytes match
  return result === 0;
};

/**
 * Timing-safe comparison for password confirmation
 * Specifically designed for comparing passwords and their confirmations
 *
 * @param password Original password
 * @param confirmPassword Password confirmation
 * @returns true if passwords match, false otherwise
 */
export const timingSafePasswordCompare = (
  password: string,
  confirmPassword: string,
): boolean => {
  // Handle empty strings safely
  if (!password && !confirmPassword) {
    return true;
  }

  return timingSafeEqual(password, confirmPassword);
};
