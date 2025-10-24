import type { Endpoint, Environment } from '@/types/api';

// Custom hooks

// Components
import { EndpointBuilderHeader } from './components/EndpointBuilderHeader';
import { RequestTabsContainer } from './components/RequestTabsContainer';
import { ResponseDisplay } from './components/ResponseDisplay';
import { useEndpointRequest } from './hooks/useEndpointRequest';
import { useEndpointSend } from './hooks/useEndpointSend';

interface EndpointBuilderProps {
  endpoint: Endpoint;
  environment: Environment | null;
}

export default function EndpointBuilder({
  endpoint: initialEndpoint,
  environment,
}: EndpointBuilderProps) {
  // Hook untuk request state management
  const {
    endpoint,
    handleEndpointChange,
    activeRequestTab,
    setActiveRequestTab,
    activeResponseTab,
    setActiveResponseTab,
    formatMode,
    setFormatMode,
    searchQuery,
    setSearchQuery,
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
  } = useEndpointRequest({ initialEndpoint, environment });

  // Hook untuk HTTP request logic
  const { response, isSending, handleSend, handleSave, updateMutation } =
    useEndpointSend({
      endpoint,
      environment,
      queryParams,
      headersList,
      bodyData,
      authData,
    });

  return (
    <div className='h-full flex flex-col bg-white'>
      {/* Header dengan form dan action buttons */}
      <EndpointBuilderHeader
        endpoint={endpoint}
        isSending={isSending}
        isSaving={updateMutation.isPending}
        onEndpointChange={handleEndpointChange}
        onSend={handleSend}
        onSave={handleSave}
      />

      {/* Request tabs container */}
      <RequestTabsContainer
        activeTab={activeRequestTab}
        onTabChange={setActiveRequestTab}
        endpointUrl={endpoint.url}
        queryParams={queryParams}
        onQueryParamsChange={setQueryParams}
        headersList={headersList}
        onHeadersChange={setHeadersList}
        bodyData={bodyData}
        onBodyDataChange={setBodyData}
        testScripts={testScripts}
        onTestScriptsChange={setTestScripts}
        authData={authData}
        onAuthDataChange={setAuthData}
      />

      {/* Response display (jika ada response) */}
      {response && (
        <ResponseDisplay
          response={response}
          testScripts={testScripts}
          activeResponseTab={activeResponseTab}
          setActiveResponseTab={setActiveResponseTab}
          formatMode={formatMode}
          setFormatMode={setFormatMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </div>
  );
}
