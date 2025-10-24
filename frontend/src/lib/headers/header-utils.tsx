/**
 * Header utilities untuk response headers
 * Format dan parsing functionality
 */

import * as React from 'react';

export const formatHeaderValue = (key: string, value: string): React.ReactNode => {
  // Format certain headers for better readability
  const keyLower = key.toLowerCase();

  if (keyLower === 'content-length') {
    const bytes = parseInt(value);
    if (!isNaN(bytes)) {
      if (bytes < 1024) return `${bytes} bytes`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  if (keyLower === 'content-type') {
    return (
      <>
        {value.split(';').map((part, index) => {
          if (index === 0) {
            return <span key={index} className='font-medium'>{part}</span>;
          }
          return <span key={index} className='text-muted-foreground'>{part}</span>;
        })}
      </>
    );
  }

  return value;
};

export const getHeaderIcon = (key: string) => {
  const keyLower = key.toLowerCase();
  if (keyLower.includes('content-type')) return '📄';
  if (keyLower.includes('authorization')) return '🔐';
  if (keyLower.includes('cache')) return '💾';
  if (keyLower.includes('server')) return '🖥️';
  if (keyLower.includes('cookie')) return '🍪';
  if (keyLower.includes('security')) return '🛡️';
  return '📋';
};

export const copyHeadersToClipboard = (headers: Record<string, string>) => {
  const headersText = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  return navigator.clipboard.writeText(headersText);
};

export const copyHeadersAsJSON = (headers: Record<string, string>) => {
  const headersJSON = JSON.stringify(headers, null, 2);
  return navigator.clipboard.writeText(headersJSON);
};

export const downloadHeadersAsFile = (headers: Record<string, string>) => {
  const headersText = Object.entries(headers)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');
  const blob = new Blob([headersText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `response_headers_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const calculateHeadersSize = (headers: Record<string, string>) => {
  return new Blob([JSON.stringify(headers)]).size;
};