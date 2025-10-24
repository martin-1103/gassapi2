import { ApiResponse } from '@/types/api';

/**
 * Processes response headers to extract content type
 */
export const getContentType = (
  headers?: Record<string, string> | null,
): string => {
  if (!headers) return 'unknown';
  const contentType =
    headers['content-type'] ||
    headers['Content-Type'] ||
    headers['Content-type'];
  return contentType?.split(';')[0] || 'unknown';
};

/**
 * Processes response data to get a summary of the response
 */
export const getResponseSummary = (response: ApiResponse | null) => {
  if (!response) return null;

  const testResults = response.testResults || [];
  const passedTests = testResults.filter(t => t.status === 'pass').length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const skippedTests = testResults.filter(t => t.status === 'skip').length;

  return {
    status: response.status,
    statusText: response.statusText,
    time: response.time,
    size: response.size,
    contentType: getContentType(response.headers),
    testResults: {
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      total: testResults.length,
    },
    hasTests: testResults.length > 0,
  };
};

/**
 * Processes response data to prepare for copying or downloading
 */
export const formatResponseContent = (
  response: ApiResponse | null,
  formatMode: 'pretty' | 'raw',
) => {
  if (!response) return '';

  const content =
    formatMode === 'pretty'
      ? JSON.stringify(response.data, null, 2)
      : typeof response.data === 'string'
        ? response.data
        : JSON.stringify(response.data);

  return content;
};

/**
 * Generates a filename for downloading the response
 */
export const generateDownloadFilename = (response: ApiResponse | null) => {
  if (!response) return 'response.json';
  return `response_${response.status}_${Date.now()}.json`;
};
