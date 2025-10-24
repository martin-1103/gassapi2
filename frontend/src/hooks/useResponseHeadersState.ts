/**
 * Custom hook untuk response headers state management
 */

import * as React from 'react';

import { useToast } from '@/hooks/use-toast';
import {
  filterHeaders,
  groupHeadersByCategory,
} from '@/lib/headers/header-analysis';
import {
  copyHeadersToClipboard,
  copyHeadersAsJSON,
  downloadHeadersAsFile,
  calculateHeadersSize,
} from '@/lib/headers/header-utils';

interface UseResponseHeadersStateProps {
  headers: Record<string, string>;
}

interface UseResponseHeadersStateReturn {
  // State
  searchQuery: string;
  showOnlyStandard: boolean;

  // Data
  filteredHeaders: Record<string, string>;
  groupedHeaders: Record<string, Record<string, string>>;
  totalHeaders: number;
  showingHeaders: number;
  totalCategories: number;
  headersSize: number;
  hasFilteredResults: boolean;

  // Actions
  handleCopyHeaders: () => void;
  handleCopyAsJSON: () => void;
  handleDownloadHeaders: () => void;
  handleSearchChange: (value: string) => void;
  toggleStandardFilter: () => void;
  setSearchQuery: (value: string) => void;
  setShowOnlyStandard: (value: boolean) => void;
}

export function useResponseHeadersState({
  headers,
}: UseResponseHeadersStateProps): UseResponseHeadersStateReturn {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showOnlyStandard, setShowOnlyStandard] = React.useState(false);
  const { toast } = useToast();

  // Memoized filtered headers
  const filteredHeaders = React.useMemo(() => {
    return filterHeaders(headers, searchQuery, showOnlyStandard);
  }, [headers, searchQuery, showOnlyStandard]);

  // Memoized grouped headers
  const groupedHeaders = React.useMemo(() => {
    return groupHeadersByCategory(filteredHeaders);
  }, [filteredHeaders]);

  // Action handlers
  const handleCopyHeaders = React.useCallback(() => {
    copyHeadersToClipboard(headers);
    toast({
      title: 'Headers copied',
      description: 'Response headers copied to clipboard',
    });
  }, [headers, toast]);

  const handleCopyAsJSON = React.useCallback(() => {
    copyHeadersAsJSON(headers);
    toast({
      title: 'Headers copied as JSON',
      description: 'Response headers copied as JSON to clipboard',
    });
  }, [headers, toast]);

  const handleDownloadHeaders = React.useCallback(() => {
    downloadHeadersAsFile(headers);
    toast({
      title: 'Headers downloaded',
      description: 'Response headers saved to download folder',
    });
  }, [headers, toast]);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const toggleStandardFilter = React.useCallback(() => {
    setShowOnlyStandard(prev => !prev);
  }, []);

  // Computed values
  const totalHeaders = Object.keys(headers).length;
  const showingHeaders = filteredHeaders.length;
  const totalCategories = Object.keys(groupedHeaders).length;
  const headersSize = calculateHeadersSize(headers);
  const hasFilteredResults = showingHeaders < totalHeaders;

  return {
    // State
    searchQuery,
    showOnlyStandard,

    // Data
    filteredHeaders,
    groupedHeaders,
    totalHeaders,
    showingHeaders,
    totalCategories,
    headersSize,
    hasFilteredResults,

    // Actions
    handleCopyHeaders,
    handleCopyAsJSON,
    handleDownloadHeaders,
    handleSearchChange,
    toggleStandardFilter,
  };
}
