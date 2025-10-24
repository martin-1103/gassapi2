import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility untuk menggabungkan CSS classes dengan Tailwind
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

// Export all HTTP utilities individually for granular access
export * from './http-request-utils';
export * from './http-response-utils';
export * from './content-type-utils';
export * from './http-utils';
