import { useState } from 'react';
import type { Endpoint, Environment, EndpointResponse } from '@/types/api';
import {
  createDefaultBodyData,
  createDefaultTestScripts,
  createDefaultAuthData,
  createDefaultQueryParams,
  createDefaultHeaders,
} from '@/lib/utils/endpoint-builder-utils';

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
  setActiveRequestTab: (tab: 'params' | 'headers' | 'body' | 'tests' | 'auth') => void;
  activeResponseTab: 'body' | 'headers' | 'tests';
  setActiveResponseTab: (tab: 'body' | 'headers' | 'tests') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  formatMode: 'pretty' | 'raw';
  setFormatMode: (mode: 'pretty' | 'raw') => void;
  
  // Data state
  bodyData: any; // BodyDataType would be defined here
  setBodyData: (bodyData: any) => void;
  testScripts: any[]; // TestScriptType would be defined here
  setTestScripts: (scripts: any[]) => void;
  authData: any; // AuthDataType would be defined here
  setAuthData: (authData: any) => void;
  queryParams: any[]; // ParamType would be defined here
  setQueryParams: (params: any[]) => void;
  headersList: any[]; // HeaderType would be defined here
  setHeadersList: (headers: any[]) => void;
}

export const useEndpointBuilderState = ({
  initialEndpoint,
  environment,
}: UseEndpointBuilderStateProps): EndpointBuilderState => {
  // Endpoint state
  const [endpoint, setEndpoint] = useState<Endpoint>(initialEndpoint);
  
  // Response state
  const [response, setResponse] = useState<EndpointResponse | null>(null);
  
  // UI state
  const [isSending, setIsSending] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<'params' | 'headers' | 'body' | 'tests' | 'auth'>('params');
  const [activeResponseTab, setActiveResponseTab] = useState<'body' | 'headers' | 'tests'>('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');
  
  // Initialize data structures with defaults
  const [bodyData, setBodyData] = useState(() => 
    createDefaultBodyData(initialEndpoint.body || '')
  );
  
  const [testScripts, setTestScripts] = useState(() => 
    createDefaultTestScripts()
  );
  
  const [authData, setAuthData] = useState(() => 
    createDefaultAuthData()
  );
  
  const [queryParams, setQueryParams] = useState(() => 
    createDefaultQueryParams()
  );
  
  const [headersList, setHeadersList] = useState(() => 
    createDefaultHeaders()
  );

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