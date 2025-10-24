import { useState } from 'react';

import type {
  Endpoint,
  Environment,
  EndpointResponse,
  AuthData,
} from '@/types/api';

// Type definitions for endpoint builder data
export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface HeaderParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface TestScript {
  id: string;
  name: string;
  script: string;
  enabled: boolean;
}

export interface BodyData {
  type: 'json' | 'form' | 'raw' | 'binary' | 'urlencoded';
  json?: Record<string, unknown>;
  raw?: string;
  form?: Array<{ key: string; value: string; enabled: boolean }>;
  binary?: File;
  urlencoded?: Array<{ key: string; value: string; enabled: boolean }>;
}

interface UseEndpointBuilderStateProps {
  initialEndpoint: Endpoint;
  environment: Environment | null;
}

export interface EndpointBuilderState {
  // Endpoint state
  endpoint: Endpoint;
  setEndpoint: (endpoint: Endpoint) => void;

  // Response state
  response: EndpointResponse | null;
  setResponse: (response: EndpointResponse | null) => void;

  // UI state
  isSending: boolean;
  setIsSending: (isSending: boolean) => void;
  activeRequestTab: 'params' | 'headers' | 'body' | 'tests' | 'auth';
  setActiveRequestTab: (
    tab: 'params' | 'headers' | 'body' | 'tests' | 'auth',
  ) => void;
  activeResponseTab: 'body' | 'headers' | 'tests';
  setActiveResponseTab: (tab: 'body' | 'headers' | 'tests') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  formatMode: 'pretty' | 'raw';
  setFormatMode: (mode: 'pretty' | 'raw') => void;

  // Data state
  bodyData: BodyData;
  setBodyData: (bodyData: BodyData) => void;
  testScripts: TestScript[];
  setTestScripts: (scripts: TestScript[]) => void;
  authData: AuthData;
  setAuthData: (authData: AuthData) => void;
  queryParams: QueryParam[];
  setQueryParams: (params: QueryParam[]) => void;
  headersList: HeaderParam[];
  setHeadersList: (headers: HeaderParam[]) => void;
}

export const useEndpointBuilderState = ({
  initialEndpoint,
  _environment, // Prefix with underscore to indicate intentionally unused
}: UseEndpointBuilderStateProps): EndpointBuilderState => {
  // Endpoint state
  const [endpoint, setEndpoint] = useState<Endpoint>(initialEndpoint);

  // Response state
  const [response, setResponse] = useState<EndpointResponse | null>(null);

  // UI state
  const [isSending, setIsSending] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<
    'params' | 'headers' | 'body' | 'tests' | 'auth'
  >('params');
  const [activeResponseTab, setActiveResponseTab] = useState<
    'body' | 'headers' | 'tests'
  >('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');

  // Initialize data structures with defaults
  const [bodyData, setBodyData] = useState<BodyData>(() => ({
    type: 'raw',
    raw: (initialEndpoint.body as string) || '',
  }));

  const [testScripts, setTestScripts] = useState<TestScript[]>([]);

  const [authData, setAuthData] = useState<AuthData>(() => ({
    type: 'noauth',
  }));

  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  const [headersList, setHeadersList] = useState<HeaderParam[]>([]);

  return {
    // Endpoint state
    endpoint,
    setEndpoint,

    // Response state
    response,
    setResponse,

    // UI state
    isSending,
    setIsSending,
    activeRequestTab,
    setActiveRequestTab,
    activeResponseTab,
    setActiveResponseTab,
    searchQuery,
    setSearchQuery,
    formatMode,
    setFormatMode,

    // Data state
    bodyData,
    setBodyData,
    testScripts,
    setTestScripts,
    authData,
    setAuthData,
    queryParams,
    setQueryParams,
    headersList,
    setHeadersList,
  };
};
