import {
  Download,
  Copy,
  Save,
  Search,
  Eye,
  Code,
  Maximize2,
  Minimize2,
  FileText,
  Clock,
  Database,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  Monitor,
  Smartphone,
  Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { ResponseBodyTab } from './ResponseBodyTab';
import { ResponseConsoleTab } from './ResponseConsoleTab';
import { ResponseCookiesTab } from './ResponseCookiesTab';
import { ResponseDocsTab } from './ResponseDocsTab';
import { ResponseHeadersTab } from './ResponseHeadersTab';
import { ResponseTestsTab } from './ResponseTestsTab';

import { StatusBadge, TimeDisplay } from '@/components/common';

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
  redirected?: boolean;
  redirectUrl?: string;
  cookies?: Record<string, any>;
  testResults?: any[];
  console?: any[];
  request?: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: any;
  };
}

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
  const [activeTab, setActiveTab] = useState('body');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatMode, setFormatMode] = useState<'pretty' | 'raw'>('pretty');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { toast } = useToast();

  const handleCopyResponse = () => {
    if (!response) return;

    const content =
      formatMode === 'pretty'
        ? JSON.stringify(response.data, null, 2)
        : typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);

    navigator.clipboard.writeText(content);
    toast({
      title: 'Response Copied',
      description: 'Response copied to clipboard',
    });

    onCopyResponse?.();
  };

  const handleDownloadResponse = () => {
    if (!response) return;

    const content =
      formatMode === 'pretty'
        ? JSON.stringify(response.data, null, 2)
        : typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data);

    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.status}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Response Downloaded',
      description: 'Response saved to download folder',
    });

    onDownloadResponse?.();
  };

  const handleSaveResponse = () => {
    if (!response) return;

    toast({
      title: 'Response Saved',
      description: 'Response saved to history',
    });

    onSaveResponse?.();
  };

  const getContentType = () => {
    if (!response?.headers) return 'unknown';
    const contentType =
      response.headers['content-type'] || response.headers['Content-Type'];
    return contentType?.split(';')[0] || 'unknown';
  };

  const hasResponse = response && response.status !== undefined;

  const getResponseSummary = () => {
    if (!response) return null;

    const testResults = response.testResults || [];
    const passedTests = testResults.filter(t => t.status === 'pass').length;
    const failedTests = testResults.filter(t => t.status === 'fail').length;

    return {
      status: response.status,
      statusText: response.statusText,
      time: response.time,
      size: response.size,
      contentType: getContentType(),
      testResults: {
        passed: passedTests,
        failed: failedTests,
        total: testResults.length,
      },
      hasTests: testResults.length > 0,
    };
  };

  const summary = getResponseSummary();

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
    return (
      <div className='h-full flex flex-col'>
        {/* Empty State */}
        <div className='flex-1 flex items-center justify-center text-muted-foreground'>
          <div className='text-center max-w-md'>
            <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
              <Eye className='w-8 h-8' />
            </div>
            <h3 className='text-lg font-semibold mb-2'>No Response Yet</h3>
            <p className='text-sm mb-4'>
              Send a request to see the response here. The response will include
              status, headers, body, and test results.
            </p>
            <div className='space-y-2 text-xs text-left bg-muted/50 rounded p-3'>
              <p>• Response status and timing</p>
              <p>• Response headers and metadata</p>
              <p>• Formatted response body</p>
              <p>• Test results and validation</p>
              <p>• Auto-generated documentation</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='h-full flex flex-col'>
        <div className='flex-1 flex items-center justify-center'>
          <div className='text-center'>
            <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
            <p className='text-sm text-muted-foreground'>Sending request...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}
    >
      {/* Response Header */}
      <Card className='m-4 p-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <StatusBadge status={response.status} />
            <div className='text-sm text-muted-foreground'>
              {response.statusText}
            </div>
            <Badge variant='outline' className='text-xs'>
              {getContentType()}
            </Badge>
          </div>

          <div className='flex items-center gap-4'>
            <TimeDisplay time={response.time} showDetailed />
            <span className='text-sm text-muted-foreground'>
              {response.size} bytes
            </span>

            <div className='flex items-center gap-1'>
              <Button size='sm' variant='ghost' onClick={handleCopyResponse}>
                <Copy className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={handleDownloadResponse}
              >
                <Download className='w-4 h-4' />
              </Button>
              <Button size='sm' variant='ghost' onClick={handleSaveResponse}>
                <Save className='w-4 h-4' />
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className='w-4 h-4' />
                ) : (
                  <Maximize2 className='w-4 h-4' />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Test Results Summary */}
        {summary?.hasTests && (
          <div className='mt-3 pt-3 border-t'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Tests:</span>
              <div className='flex items-center gap-1'>
                <CheckCircle className='w-3 h-3 text-green-500' />
                <span className='text-xs text-green-600'>
                  {summary.testResults.passed} passed
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <XCircle className='w-3 h-3 text-red-500' />
                <span className='text-xs text-red-600'>
                  {summary.testResults.failed} failed
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <AlertCircle className='w-3 h-3 text-yellow-500' />
                <span className='text-xs text-yellow-600'>
                  {summary.testResults.total -
                    summary.testResults.passed -
                    summary.testResults.failed}{' '}
                  skipped
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Search and Format Controls */}
      <div className='mx-4 mb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2 flex-1'>
            <Search className='w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search response...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-64 h-8'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='ghost'
              onClick={() =>
                setFormatMode(formatMode === 'pretty' ? 'raw' : 'pretty')
              }
            >
              <Code className='w-4 h-4 mr-2' />
              {formatMode === 'pretty' ? 'Raw' : 'Pretty'}
            </Button>
          </div>
        </div>
      </div>

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
      <div className='px-4 py-2 border-t bg-muted/50'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span>Status: {response.status}</span>
            <span>Time: {response.time}ms</span>
            <span>Size: {response.size} bytes</span>
            {response.redirected && (
              <span>Redirected to: {response.redirectUrl}</span>
            )}
          </div>
          <div className='flex items-center gap-4'>
            <span>Content-Type: {getContentType()}</span>
            <span>Format: {formatMode}</span>
            {searchQuery && <span>Searching: "{searchQuery}"</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
