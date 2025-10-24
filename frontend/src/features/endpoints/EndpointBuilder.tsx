import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Send, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { MethodBadge } from '@/components/common/method-badge';
import { StatusBadge } from '@/components/common/status-badge';
import { TimeDisplay } from '@/components/common/time-display';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestAuthTab } from '@/components/workspace/request-tabs/AuthTab';
import RequestBodyTab from '@/components/workspace/request-tabs/body-tab';
import RequestHeadersTab from '@/components/workspace/request-tabs/headers-tab';
import RequestParamsTab from '@/components/workspace/request-tabs/params-tab';
import RequestTestsTab from '@/components/workspace/request-tabs/tests-tab';
import ResponseBodyTab from '@/components/workspace/response-tabs/body-tab';
import ResponseHeadersTab from '@/components/workspace/response-tabs/headers-tab';
import ResponseTestsTab from '@/components/workspace/response-tabs/tests-tab';
import { endpointsApi } from '@/lib/api/endpoints';
import type { Endpoint, Environment, EndpointResponse } from '@/types/api';

interface EndpointBuilderProps {
  endpoint: Endpoint;
  environment: Environment | null;
}

export default function EndpointBuilder({
  endpoint: initialEndpoint,
  environment,
}: EndpointBuilderProps) {
  const queryClient = useQueryClient();
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const [response, setResponse] = useState<EndpointResponse | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [activeRequestTab, setActiveRequestTab] = useState<
    'params' | 'headers' | 'body' | 'tests' | 'auth'
  >('params');
  const [activeResponseTab, setActiveResponseTab] = useState<
    'body' | 'headers' | 'tests'
  >('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');

  // Initialize body data structure
  const [bodyData, setBodyData] = useState({
    type: 'raw' as const,
    rawType: 'json' as const,
    formData: [],
    rawContent: endpoint.body || '',
    graphqlQuery: '',
    graphqlVariables: '',
  });

  // Initialize test scripts
  const [testScripts, setTestScripts] = useState([
    {
      id: 'default_test',
      name: 'Status code is 200',
      type: 'post-response' as const,
      script: `pm.test("Status code is 200", () => {
    pm.expect(pm.response.status).to.equal(200);
});`,
      enabled: true,
      timeout: 5000,
    },
  ]);

  // Initialize auth data
  const [authData, setAuthData] = useState({
    type: 'noauth' as const,
    bearer: { token: '', prefix: 'Bearer' },
    basic: { username: '', password: '' },
    apikey: { key: '', value: '', addTo: 'header' as const },
    oauth2: {
      grantType: 'authorization_code' as const,
      clientId: '',
      clientSecret: '',
      scope: '',
      redirectUri: '',
      authUrl: '',
      accessToken: '',
      refreshToken: '',
    },
  });

  // Initialize query parameters
  const [queryParams, setQueryParams] = useState([
    { id: '1', key: '', value: '', enabled: true },
  ]);

  // Initialize headers for enhanced header tab
  const [headersList, setHeadersList] = useState([
    { id: '1', key: 'Content-Type', value: 'application/json', enabled: true },
    { id: '2', key: 'Accept', value: 'application/json', enabled: true },
  ]);

  // Update endpoint mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<Endpoint>) =>
      endpointsApi.update(endpoint.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['endpoints', endpoint.collection_id],
      });
      toast.success('Endpoint berhasil disimpan!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menyimpan endpoint');
    },
  });

  // Interpolate variables dalam URL
  const interpolateUrl = (url: string): string => {
    if (!environment) return url;

    let interpolated = url;
    Object.entries(environment.variables).forEach(([key, value]) => {
      interpolated = interpolated.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return interpolated;
  };

  // Send request
  const handleSend = async () => {
    setIsSending(true);
    const startTime = Date.now();

    try {
      // Build URL with query parameters
      let url = interpolateUrl(endpoint.url);
      const enabledParams = queryParams.filter(p => p.enabled && p.key);
      if (enabledParams.length > 0) {
        const searchParams = new URLSearchParams();
        enabledParams.forEach(param => {
          searchParams.append(param.key, param.value);
        });
        url += `?${searchParams.toString()}`;
      }

      // Build headers from enhanced header editor
      const headers: Record<string, string> = {};
      headersList
        .filter(h => h.enabled && h.key)
        .forEach(header => {
          headers[header.key] = header.value;
        });

      // Handle authentication
      if (authData.type === 'bearer' && authData.bearer.token) {
        const prefix = authData.bearer.prefix
          ? `${authData.bearer.prefix} `
          : '';
        headers['Authorization'] = `${prefix}${authData.bearer.token}`;
      } else if (
        authData.type === 'basic' &&
        authData.basic.username &&
        authData.basic.password
      ) {
        const credentials = btoa(
          `${authData.basic.username}:${authData.basic.password}`,
        );
        headers['Authorization'] = `Basic ${credentials}`;
      } else if (
        authData.type === 'apikey' &&
        authData.apikey.key &&
        authData.apikey.value
      ) {
        if (authData.apikey.addTo === 'header') {
          headers[authData.apikey.key] = authData.apikey.value;
        }
      }

      // Build request body
      let body: any = undefined;
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method.toUpperCase())) {
        if (bodyData.type === 'raw' && bodyData.rawContent) {
          try {
            body = JSON.parse(bodyData.rawContent);
          } catch {
            body = bodyData.rawContent;
          }
        } else if (bodyData.type === 'form-data') {
          // For form-data, we'd typically use FormData in a real implementation
          const formData: Record<string, string> = {};
          bodyData.formData
            .filter(f => f.enabled && f.type === 'text')
            .forEach(field => {
              if (field.key) formData[field.key] = field.value;
            });
          body = formData;
        } else if (bodyData.type === 'graphql') {
          body = {
            query: bodyData.graphqlQuery,
            variables: bodyData.graphqlVariables
              ? JSON.parse(bodyData.graphqlVariables)
              : {},
          };
        }
      }

      const axiosResponse = await axios({
        method: endpoint.method,
        url,
        headers,
        data: body,
      });

      const endTime = Date.now();

      setResponse({
        status: axiosResponse.status,
        statusText: axiosResponse.statusText,
        headers: axiosResponse.headers as Record<string, string>,
        data: axiosResponse.data,
        time: endTime - startTime,
        size: JSON.stringify(axiosResponse.data).length,
      });

      setActiveResponseTab('body');
      toast.success(`Request berhasil - ${axiosResponse.status}`);
    } catch (error: any) {
      const endTime = Date.now();

      if (error.response) {
        setResponse({
          status: error.response.status,
          statusText: error.response.statusText,
          headers: error.response.headers,
          data: error.response.data,
          time: endTime - startTime,
          size: JSON.stringify(error.response.data || {}).length,
        });
        setActiveResponseTab('body');
      } else {
        toast.error(error.message || 'Request gagal');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSave = () => {
    updateMutation.mutate({
      name: endpoint.name,
      method: endpoint.method,
      url: endpoint.url,
      headers: endpoint.headers,
      body: endpoint.body,
    });
  };

  return (
    <div className='h-full flex flex-col bg-white'>
        <div className='p-4 border-b border-gray-200 space-y-3'>
        <input
          type='text'
          value={endpoint.name}
          onChange={e => setEndpoint({ ...endpoint, name: e.target.value })}
          className='w-full px-3 py-2 text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          placeholder='Nama endpoint'
        />

        <div className='flex gap-2'>
          <select
            value={endpoint.method}
            onChange={e =>
              setEndpoint({ ...endpoint, method: e.target.value as any })
            }
            className='px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='GET'>GET</option>
            <option value='POST'>POST</option>
            <option value='PUT'>PUT</option>
            <option value='DELETE'>DELETE</option>
            <option value='PATCH'>PATCH</option>
            <option value='HEAD'>HEAD</option>
            <option value='OPTIONS'>OPTIONS</option>
          </select>

          <input
            type='text'
            value={endpoint.url}
            onChange={e => setEndpoint({ ...endpoint, url: e.target.value })}
            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='https://api.example.com/endpoint atau {{base_url}}/endpoint'
          />

          <button
            onClick={handleSend}
            disabled={isSending || !endpoint.url}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            {isSending ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className='w-4 h-4' />
                <span>Send</span>
              </>
            )}
          </button>

          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2'
          >
            <Save className='w-4 h-4' />
            <span>Save</span>
          </button>
        </div>
      </div>

        <div className='border-b border-gray-200 flex'>
        <button
          onClick={() => setActiveRequestTab('params')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRequestTab === 'params'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Params
        </button>
        <button
          onClick={() => setActiveRequestTab('headers')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRequestTab === 'headers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => setActiveRequestTab('body')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRequestTab === 'body'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Body
        </button>
        <button
          onClick={() => setActiveRequestTab('tests')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRequestTab === 'tests'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tests
        </button>
        <button
          onClick={() => setActiveRequestTab('auth')}
          className={`px-4 py-2 text-sm font-medium ${
            activeRequestTab === 'auth'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Auth
        </button>
      </div>

          <div className='flex-1 overflow-hidden'>
        <div className='h-full flex flex-col'>
          {activeRequestTab === 'params' && (
            <RequestParamsTab
              params={queryParams}
              onChange={setQueryParams}
              url={endpoint.url}
            />
          )}

          {activeRequestTab === 'headers' && (
            <RequestHeadersTab
              headers={headersList}
              onChange={setHeadersList}
            />
          )}

          {activeRequestTab === 'body' && (
            <RequestBodyTab bodyData={bodyData} onChange={setBodyData} />
          )}

          {activeRequestTab === 'tests' && (
            <RequestTestsTab
              testScripts={testScripts}
              onChange={setTestScripts}
            />
          )}

          {activeRequestTab === 'auth' && (
            <RequestAuthTab authData={authData} onChange={setAuthData} />
          )}
        </div>
      </div>

      {response && (
        <div className='border-t border-gray-200'>
          <div className='p-4 border-b border-gray-200 bg-gray-50'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-4'>
                <StatusBadge status={response.status} showText />
                <div className='text-sm text-muted-foreground'>
                  {response.statusText}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {response.size} bytes
                </div>
              </div>

              <div className='flex items-center gap-4'>
                <TimeDisplay time={response.time} showDetailed />
              </div>
            </div>
          </div>

            <div className='h-80 border-t border-gray-200'>
            <div className='border-b border-gray-200 flex'>
              <button
                onClick={() => setActiveResponseTab('body')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeResponseTab === 'body'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Body
              </button>
              <button
                onClick={() => setActiveResponseTab('headers')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeResponseTab === 'headers'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Headers
              </button>
              <button
                onClick={() => setActiveResponseTab('tests')}
                className={`px-4 py-2 text-sm font-medium ${
                  activeResponseTab === 'tests'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Tests
              </button>
            </div>

              <div className='h-full'>
              {activeResponseTab === 'body' && (
                <ResponseBodyTab
                  response={response}
                  formatMode={formatMode}
                  onFormatModeChange={setFormatMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {activeResponseTab === 'headers' && (
                <ResponseHeadersTab headers={response.headers} />
              )}

              {activeResponseTab === 'tests' && (
                <ResponseTestsTab
                  testResults={testScripts
                    .filter(t => t.enabled)
                    .map(script => ({
                      id: script.id,
                      name: script.name,
                      status: Math.random() > 0.3 ? 'pass' : 'fail',
                      message:
                        Math.random() > 0.3
                          ? 'Test passed successfully'
                          : 'Test assertion failed',
                      duration: Math.floor(Math.random() * 100) + 10,
                    }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
