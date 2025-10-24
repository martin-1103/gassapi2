import { useState } from 'react';

import type { Endpoint, Environment, AuthData, RequestBody } from '@/types/api';

interface UseEndpointRequestProps {
  initialEndpoint: Endpoint;
  environment: Environment | null;
}

export function useEndpointRequest({
  initialEndpoint,
}: UseEndpointRequestProps) {
  // State untuk endpoint utama
  const [endpoint, setEndpoint] = useState<Endpoint>(initialEndpoint);

  // State untuk request tabs
  const [activeRequestTab, setActiveRequestTab] = useState('params');

  // State untuk response tabs dan format
  const [activeResponseTab, setActiveResponseTab] = useState('body');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');
  const [searchQuery, setSearchQuery] = useState('');

  // State untuk request data
  const [queryParams, setQueryParams] = useState<
    Array<{ key: string; value: string; enabled: boolean }>
  >([]);
  const [headersList, setHeadersList] = useState<
    Array<{ key: string; value: string; enabled: boolean }>
  >([]);
  const [bodyData, setBodyData] = useState<RequestBody>('');
  const [testScripts, setTestScripts] = useState<
    Array<{ name: string; script: string; enabled: boolean }>
  >([]);
  const [authData, setAuthData] = useState<AuthData>({ type: 'noauth' });

  // Update endpoint data
  const handleEndpointChange = (
    field: 'name' | 'method' | 'url',
    value: string,
  ) => {
    setEndpoint({ ...endpoint, [field]: value });
  };

  return {
    // Endpoint state
    endpoint,
    setEndpoint,
    handleEndpointChange,

    // Request tabs state
    activeRequestTab,
    setActiveRequestTab,

    // Response tabs dan format state
    activeResponseTab,
    setActiveResponseTab,
    formatMode,
    setFormatMode,
    searchQuery,
    setSearchQuery,

    // Request data states
    queryParams,
    setQueryParams,
    headersList,
    setHeadersList,
    bodyData,
    setBodyData,
    testScripts,
    setTestScripts,
    authData,
    setAuthData,
  };
}
