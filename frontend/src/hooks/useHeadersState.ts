/**
 * Custom hook for header management state and logic
 * Extracted from RequestHeadersTab for better separation of concerns
 */

import { useState, useCallback } from 'react';

import {
  RequestHeader,
  COMMON_HEADERS,
  createHeader,
  headersToObject,
  headersToText,
  headersToCurl,
  getEnabledHeadersCount,
  getEnabledHeaders,
  findHeaderById,
  updateHeaderById,
  deleteHeaderById,
  duplicateHeader,
} from '@/lib/utils/header-utils';
import { validateHeaders, findDuplicateHeaders, getValidHeadersForRequest } from '@/lib/validations/header-validation';

export interface UseHeadersStateOptions {
  initialHeaders?: RequestHeader[];
  onHeadersChange?: (headers: RequestHeader[]) => void;
}

export function useHeadersState({
  initialHeaders = [],
  onHeadersChange,
}: UseHeadersStateOptions = {}) {
  const [headers, setHeaders] = useState<RequestHeader[]>(initialHeaders);
  const [showCommonHeaders, setShowCommonHeaders] = useState(true);

  // Wrapper untuk update dengan callback
  const updateHeaders = useCallback((newHeaders: RequestHeader[]) => {
    setHeaders(newHeaders);
    onHeadersChange?.(newHeaders);
  }, [onHeadersChange]);

  // Header operations
  const addHeader = useCallback(() => {
    const newHeader = createHeader();
    updateHeaders([...headers, newHeader]);
  }, [headers, updateHeaders]);

  const addCommonHeader = useCallback((commonHeader: typeof COMMON_HEADERS[0]) => {
    const newHeader = createHeader({
      key: commonHeader.key,
      value: commonHeader.value,
      description: commonHeader.description,
    });
    updateHeaders([...headers, newHeader]);
  }, [headers, updateHeaders]);

  const updateHeader = useCallback((id: string, updates: Partial<RequestHeader>) => {
    const newHeaders = updateHeaderById(headers, id, updates);
    updateHeaders(newHeaders);
  }, [headers, updateHeaders]);

  const deleteHeader = useCallback((id: string) => {
    const newHeaders = deleteHeaderById(headers, id);
    updateHeaders(newHeaders);
  }, [headers, updateHeaders]);

  const duplicateExistingHeader = useCallback((id: string) => {
    const newHeaders = duplicateHeader(headers, id);
    updateHeaders(newHeaders);
  }, [headers, updateHeaders]);

  // Bulk operations
  const clearDisabledHeaders = useCallback(() => {
    const enabledHeaders = getEnabledHeaders(headers);
    updateHeaders(enabledHeaders);
  }, [headers, updateHeaders]);

  const clearAllHeaders = useCallback(() => {
    updateHeaders([]);
  }, [updateHeaders]);

  // Copy operations
  const copyHeaders = useCallback(async () => {
    const text = headersToText(headers);
    await navigator.clipboard.writeText(text);
  }, [headers]);

  const copyAsCurl = useCallback(async (url = 'https://example.com') => {
    const curlCommand = headersToCurl(headers, url);
    await navigator.clipboard.writeText(curlCommand);
  }, [headers]);

  const copyHeaderValue = useCallback(async (id: string) => {
    const header = findHeaderById(headers, id);
    if (header) {
      await navigator.clipboard.writeText(header.value);
    }
  }, [headers]);

  // Validation
  const validation = validateHeaders(headers);
  const duplicateHeaders = findDuplicateHeaders(headers);
  const validHeadersForRequest = getValidHeadersForRequest(headers);

  // Utility functions
  const getHeadersObject = useCallback(() => headersToObject(headers), [headers]);
  const enabledHeadersCount = getEnabledHeadersCount(headers);
  const hasHeaders = headers.length > 0;

  // Search/filter
  const searchHeaders = useCallback((query: string) => {
    if (!query) return headers;

    const lowerQuery = query.toLowerCase();
    return headers.filter(header =>
      header.key.toLowerCase().includes(lowerQuery) ||
      header.value.toLowerCase().includes(lowerQuery) ||
      header.description?.toLowerCase().includes(lowerQuery)
    );
  }, [headers]);

  // Template operations
  const applyTemplate = useCallback((templateHeaders: Partial<RequestHeader>[]) => {
    const newHeaders = templateHeaders.map(data => createHeader(data));
    updateHeaders([...headers, ...newHeaders]);
  }, [headers, updateHeaders]);

  return {
    // State
    headers,
    showCommonHeaders,
    validation,
    duplicateHeaders,

    // Actions
    addHeader,
    addCommonHeader,
    updateHeader,
    deleteHeader,
    duplicateExistingHeader,
    clearDisabledHeaders,
    clearAllHeaders,
    copyHeaders,
    copyAsCurl,
    copyHeaderValue,
    searchHeaders,
    applyTemplate,

    // UI state
    setShowCommonHeaders,

    // Computed values
    getHeadersObject,
    enabledHeadersCount,
    hasHeaders,
    validHeadersForRequest,
  };
}