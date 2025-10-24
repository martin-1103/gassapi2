import { FileText } from 'lucide-react';
import { useEffect } from 'react';

import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useResponseViewState } from '@/hooks/use-response-view-state';
import { ApiResponse } from '@/types/api';

import { ResponseBodyTab } from './ResponseBodyTab';
import { ResponseConsoleTab } from './ResponseConsoleTab';
import { ResponseCookiesTab } from './ResponseCookiesTab';
import { ResponseDocsTab } from './ResponseDocsTab';
import { ResponseEmptyState } from './ResponseEmptyState';
import { ResponseHeadersTab } from './ResponseHeadersTab';
import { ResponseLoadingState } from './ResponseLoadingState';
import { ResponseMetadata } from './ResponseMetadata';
import { ResponseSearchControls } from './ResponseSearchControls';
import { ResponseStatusBar } from './ResponseStatusBar';
import { ResponseTestsTab } from './ResponseTestsTab';

interface ModernResponseViewerProps {
  response: ApiResponse | null;
  isLoading?: boolean;
  onCopyResponse?: () => void;
  onDownloadResponse?: () => void;
  onSaveResponse?: () => void;
}

export default function ModernResponseViewer({
  response,
  isLoading = false,
  onCopyResponse,
  onDownloadResponse,
  onSaveResponse,
}: ModernResponseViewerProps) {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    formatMode,
    setFormatMode,
    isFullscreen,
    setIsFullscreen,
    handleCopyResponse,
    handleDownloadResponse,
    handleSaveResponse,
  } = useResponseViewState({
    response,
    onCopyResponse,
    onDownloadResponse,
    onSaveResponse,
  });

  const hasResponse = response && response.status !== undefined;

  // Mock response untuk development
  useEffect(() => {
    if (isLoading && !response) {
      // Simulate response loading
      const timer = setTimeout(() => {
        // Ini akan digantikan dengan response asli dari DirectApiClient
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, response]);

  if (!hasResponse && !isLoading) {
    return <ResponseEmptyState />;
  }

  if (isLoading) {
    return <ResponseLoadingState />;
  }

  return (
    <div
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
    >
      {/* Response Header */}
      <Card className='m-4 p-4'>
        <ResponseMetadata
          response={response}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          handleCopyResponse={handleCopyResponse}
          handleDownloadResponse={handleDownloadResponse}
          handleSaveResponse={handleSaveResponse}
        />
      </Card>

      {/* Search and Format Controls */}
      <ResponseSearchControls
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        formatMode={formatMode}
        setFormatMode={setFormatMode}
      />

      {/* Response Tabs */}
      <div className='flex-1 px-4 pb-4'>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='h-full flex flex-col'
        >
          <TabsList className='grid w-full grid-cols-6'>
            <TabsTrigger value='body' className='flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              Body
            </TabsTrigger>
            <TabsTrigger value='headers'>Headers</TabsTrigger>
            <TabsTrigger value='cookies'>Cookies</TabsTrigger>
            <TabsTrigger value='tests'>Tests</TabsTrigger>
            <TabsTrigger value='docs'>Docs</TabsTrigger>
            <TabsTrigger value='console'>Console</TabsTrigger>
          </TabsList>

          <div className='flex-1 mt-4'>
            <TabsContent value='body' className='h-full'>
              <ResponseBodyTab
                response={response}
                formatMode={formatMode}
                onFormatModeChange={setFormatMode}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </TabsContent>

            <TabsContent value='headers' className='h-full'>
              <ResponseHeadersTab headers={response.headers} />
            </TabsContent>

            <TabsContent value='cookies' className='h-full'>
              <ResponseCookiesTab cookies={response.cookies} />
            </TabsContent>

            <TabsContent value='tests' className='h-full'>
              <ResponseTestsTab testResults={response.testResults} />
            </TabsContent>

            <TabsContent value='docs' className='h-full'>
              <ResponseDocsTab
                response={response}
                requestInfo={response.request}
              />
            </TabsContent>

            <TabsContent value='console' className='h-full'>
              <ResponseConsoleTab console={response.console} />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Status Bar */}
      <ResponseStatusBar
        response={response}
        formatMode={formatMode}
        searchQuery={searchQuery}
      />
    </div>
  );
}
