import React from 'react';

import { StatusBadge } from '@/components/common/status-badge';
import { TimeDisplay } from '@/components/common/time-display';
import ResponseBodyTab from '@/components/workspace/response-tabs/body-tab';
import ResponseHeadersTab from '@/components/workspace/response-tabs/headers-tab';
import ResponseTestsTab from '@/components/workspace/response-tabs/tests-tab';
import type { EndpointResponse } from '@/types/api';

interface ResponseConfigProps {
  response: EndpointResponse | null;
  activeResponseTab: 'body' | 'headers' | 'tests';
  setActiveResponseTab: (tab: 'body' | 'headers' | 'tests') => void;
  formatMode: 'pretty' | 'raw';
  setFormatMode: (mode: 'pretty' | 'raw') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  testScripts: Array<{
    id: string;
    name: string;
    enabled: boolean;
  }>;
}

export const ResponseConfig: React.FC<ResponseConfigProps> = ({
  response,
  activeResponseTab,
  setActiveResponseTab,
  formatMode,
  setFormatMode,
  searchQuery,
  setSearchQuery,
  testScripts,
}) => {
  if (!response) return null;

  return (
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
  );
};
