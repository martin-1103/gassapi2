import { useEffect } from 'react';
import type { EndpointResponse } from '@/types/api';
import { ResponseConfig } from './ResponseConfig';

interface ResponseDisplayProps {
  response: EndpointResponse;
  testScripts: Array<{ name: string; script: string; enabled: boolean }>;
  activeResponseTab: string;
  setActiveResponseTab: (tab: string) => void;
  formatMode: 'pretty' | 'raw';
  setFormatMode: (mode: 'pretty' | 'raw') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ResponseDisplay({
  response,
  testScripts,
  activeResponseTab,
  setActiveResponseTab,
  formatMode,
  setFormatMode,
  searchQuery,
  setSearchQuery,
}: ResponseDisplayProps) {
  // Auto switch ke body tab ketika dapat response baru
  useEffect(() => {
    setActiveResponseTab('body');
  }, [response, setActiveResponseTab]);

  return (
    <ResponseConfig
      response={response}
      activeResponseTab={activeResponseTab}
      setActiveResponseTab={setActiveResponseTab}
      formatMode={formatMode}
      setFormatMode={setFormatMode}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      testScripts={testScripts}
    />
  );
}