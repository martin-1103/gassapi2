import { useCallback, useMemo } from 'react';

import { useToast } from '@/hooks/use-toast';
import {
  getContentType,
  getLanguage,
  formatData as formatResponseData,
  isJsonData,
} from '@/lib/response/formatting-utils';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: unknown;
  time: number;
  size: number;
}

interface UseResponseBodyStateProps {
  response: ResponseData;
  formatMode: 'pretty' | 'raw';
  searchQuery?: string; // Optional for future use
}

interface UseResponseBodyStateReturn {
  // Computed values
  contentType: string;
  language: string;
  formattedData: string;
  jsonData: boolean;
  viewerType: 'json' | 'xml' | 'html' | 'binary' | 'text';

  // Helper functions
  getSyntaxHighlighterClass: () => string;

  // UI Actions
  copyToClipboard: () => void;
  downloadResponse: () => void;
}

/**
 * Custom hook for managing response body state and business logic
 * Handles format detection, data processing, and UI actions
 */
export const useResponseBodyState = ({
  response,
  formatMode,
  searchQuery: _searchQuery, // Prefix with underscore to indicate intentionally unused
}: UseResponseBodyStateProps): UseResponseBodyStateReturn => {
  const { toast } = useToast();

  // Computed values
  const contentType = useMemo(() => {
    return getContentType(response.headers);
  }, [response.headers]);

  const language = useMemo(() => {
    return getLanguage(contentType);
  }, [contentType]);

  const formattedData = useMemo(() => {
    return formatResponseData(response.data, formatMode);
  }, [response.data, formatMode]);

  const jsonData = useMemo(() => {
    return isJsonData(response.data, language);
  }, [response.data, language]);

  // Helper function to get syntax highlighter class
  const getSyntaxHighlighterClassForTheme = useCallback(() => {
    const langMap: Record<string, string> = {
      javascript: 'language-javascript',
      json: 'language-json',
      html: 'language-html',
      xml: 'language-xml',
      css: 'language-css',
      sql: 'language-sql',
      python: 'language-python',
      java: 'language-java',
      csharp: 'language-csharp',
      php: 'language-php',
      ruby: 'language-ruby',
      go: 'language-go',
      rust: 'language-rust',
      typescript: 'language-typescript',
      yaml: 'language-yaml',
      toml: 'language-toml',
      ini: 'language-ini',
      bash: 'language-bash',
      powershell: 'language-powershell',
      markdown: 'language-markdown',
      text: 'language-text',
    };
    return langMap[language] || 'language-text';
  }, [language]);

  // UI Actions
  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(formattedData);
    toast({
      title: 'Response copied',
      description: 'Response body copied to clipboard',
    });
  }, [formattedData, toast]);

  const downloadResponse = useCallback(() => {
    const blob = new Blob([formattedData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.status}_${Date.now()}.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Response downloaded',
      description: 'Response saved to download folder',
    });
  }, [formattedData, response.status, language, toast]);

  // Format-specific viewer component selection
  const getViewerType = useCallback(() => {
    // JSON content
    if (
      contentType === 'application/json' ||
      contentType === 'application/ld+json'
    ) {
      return 'json';
    }

    // XML content
    if (contentType === 'application/xml' || contentType === 'text/xml') {
      return 'xml';
    }

    // HTML content
    if (contentType === 'text/html') {
      return 'html';
    }

    // Binary content
    if (
      contentType === 'application/octet-stream' ||
      contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType.startsWith('audio/')
    ) {
      return 'binary';
    }

    // Default to text viewer for everything else
    return 'text';
  }, [contentType]);

  return {
    // Computed values
    contentType,
    language,
    formattedData,
    jsonData,
    viewerType: getViewerType(),

    // Helper functions
    getSyntaxHighlighterClass: getSyntaxHighlighterClassForTheme,

    // UI Actions
    copyToClipboard,
    downloadResponse,
  };
};
