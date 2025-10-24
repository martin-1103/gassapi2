import RequestHeadersTab from '@/components/workspace/request-tabs/headers-tab';
import RequestTestsTab from '@/components/workspace/request-tabs/tests-tab';
import type { RequestBody, AuthData } from '@/types/api';

import { AuthenticationConfig } from './AuthenticationConfig';
import { ParameterForm } from './ParameterForm';
import { RequestBodyConfig } from './RequestBodyConfig';

interface RequestTabsContainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  endpointUrl: string;
  queryParams: Array<{ key: string; value: string; enabled: boolean }>;
  onQueryParamsChange: (
    params: Array<{ key: string; value: string; enabled: boolean }>,
  ) => void;
  headersList: Array<{ key: string; value: string; enabled: boolean }>;
  onHeadersChange: (
    headers: Array<{ key: string; value: string; enabled: boolean }>,
  ) => void;
  bodyData: RequestBody;
  onBodyDataChange: (data: RequestBody) => void;
  testScripts: Array<{ name: string; script: string; enabled: boolean }>;
  onTestScriptsChange: (
    scripts: Array<{ name: string; script: string; enabled: boolean }>,
  ) => void;
  authData: AuthData;
  onAuthDataChange: (data: AuthData) => void;
}

export function RequestTabsContainer({
  activeTab,
  onTabChange,
  endpointUrl,
  queryParams,
  onQueryParamsChange,
  headersList,
  onHeadersChange,
  bodyData,
  onBodyDataChange,
  testScripts,
  onTestScriptsChange,
  authData,
  onAuthDataChange,
}: RequestTabsContainerProps) {
  return (
    <>
      {/* Tab navigation */}
      <div className='border-b border-gray-200 flex'>
        <button
          onClick={() => onTabChange('params')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'params'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Params
        </button>
        <button
          onClick={() => onTabChange('headers')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'headers'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Headers
        </button>
        <button
          onClick={() => onTabChange('body')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'body'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Body
        </button>
        <button
          onClick={() => onTabChange('tests')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'tests'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tests
        </button>
        <button
          onClick={() => onTabChange('auth')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'auth'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Auth
        </button>
      </div>

      {/* Tab content */}
      <div className='flex-1 overflow-hidden'>
        <div className='h-full flex flex-col'>
          {activeTab === 'params' && (
            <ParameterForm
              params={queryParams}
              onChange={onQueryParamsChange}
              url={endpointUrl}
            />
          )}

          {activeTab === 'headers' && (
            <RequestHeadersTab
              headers={headersList}
              onChange={onHeadersChange}
            />
          )}

          {activeTab === 'body' && (
            <RequestBodyConfig
              bodyData={bodyData}
              onChange={onBodyDataChange}
            />
          )}

          {activeTab === 'tests' && (
            <RequestTestsTab
              testScripts={testScripts}
              onChange={onTestScriptsChange}
            />
          )}

          {activeTab === 'auth' && (
            <AuthenticationConfig
              authData={authData}
              onChange={onAuthDataChange}
            />
          )}
        </div>
      </div>
    </>
  );
}
