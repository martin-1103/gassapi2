import { Copy, Download } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResponseViewState } from '@/hooks/use-response-view-state';
import { useToast } from '@/hooks/use-toast';
import {
  getContentType,
  getLanguage,
  formatData,
  getSyntaxHighlighterClass,
  isJsonData,
} from '@/lib/response/formatting-utils';

import { BinaryResponseViewer } from './BinaryResponseViewer';
import { HtmlResponseViewer } from './HtmlResponseViewer';
import { JsonResponseViewer } from './JsonResponseViewer';
import { TextViewer } from './TextViewer';
import { XmlResponseViewer } from './XmlResponseViewer';

import { useTheme } from '@/contexts/theme-context';

interface ResponseBodyTabProps {
  response: {
    data: unknown;
    headers?: Record<string, string>;
    status: number;
    size: number;
    time: number;
  };
  formatMode: 'pretty' | 'raw';
  onFormatModeChange: (mode: 'pretty' | 'raw') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ResponseBodyTab({
  response,
  formatMode,
  onFormatModeChange,
  searchQuery,
  _onSearchChange,
}: ResponseBodyTabProps) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const { lineNumbers, setLineNumbers, wrapLines, setWrapLines } =
    useResponseViewState();

  const contentType = getContentType(response?.headers);
  const language = getLanguage(contentType);
  const formattedBody = formatData(response.data, formatMode);
  const jsonData = isJsonData(response.data, language);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(formattedBody);
    toast({
      title: 'Copied',
      description: 'Response body copied to clipboard',
    });
  };

  const downloadResponse = () => {
    const blob = new Blob([formattedBody], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.status}_${Date.now()}.${language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Determine the appropriate viewer component based on content type
  const getViewerComponent = () => {
    if (jsonData && formatMode === 'pretty') {
      return (
        <JsonResponseViewer
          data={response.data}
          formatMode={formatMode}
          formattedData={formattedBody}
          searchQuery={searchQuery}
          lineNumbers={lineNumbers}
          wrapLines={wrapLines}
          getSyntaxHighlighterClass={() =>
            getSyntaxHighlighterClass(
              language,
              resolvedTheme === 'dark' ? 'dark' : 'light',
            )
          }
        />
      );
    }

    // For binary data, use BinaryResponseViewer
    if (
      contentType.includes('application/') &&
      !contentType.includes('json') &&
      !contentType.includes('xml') &&
      !contentType.includes('html') &&
      !contentType.includes('javascript') &&
      !contentType.includes('css')
    ) {
      return (
        <BinaryResponseViewer
          data={response.data}
          formatMode={formatMode}
          formattedData={formattedBody}
          searchQuery={searchQuery}
          lineNumbers={lineNumbers}
          wrapLines={wrapLines}
        />
      );
    }

    // For XML or HTML, use their specific viewers
    if (contentType.includes('xml')) {
      return (
        <XmlResponseViewer
          data={response.data}
          formatMode={formatMode}
          formattedData={formattedBody}
          searchQuery={searchQuery}
          lineNumbers={lineNumbers}
          wrapLines={wrapLines}
          getSyntaxHighlighterClass={() =>
            getSyntaxHighlighterClass(
              language,
              resolvedTheme === 'dark' ? 'dark' : 'light',
            )
          }
        />
      );
    }

    if (contentType.includes('html')) {
      return (
        <HtmlResponseViewer
          data={response.data}
          formatMode={formatMode}
          formattedData={formattedBody}
          searchQuery={searchQuery}
          lineNumbers={lineNumbers}
          wrapLines={wrapLines}
          getSyntaxHighlighterClass={() =>
            getSyntaxHighlighterClass(
              language,
              resolvedTheme === 'dark' ? 'dark' : 'light',
            )
          }
        />
      );
    }

    // Default to TextViewer for text-based content
    return (
      <TextViewer
        data={response.data}
        formatMode={formatMode}
        formattedData={formattedBody}
        searchQuery={searchQuery}
        lineNumbers={lineNumbers}
        wrapLines={wrapLines}
        getSyntaxHighlighterClass={() =>
          getSyntaxHighlighterClass(
            language,
            resolvedTheme === 'dark' ? 'dark' : 'light',
          )
        }
      />
    );
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Toolbar */}
      <div className='flex items-center justify-between p-3 border-b'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1 border rounded-md'>
            <Button
              size='sm'
              variant={formatMode === 'pretty' ? 'default' : 'ghost'}
              onClick={() => onFormatModeChange('pretty')}
              className='h-7 px-2 text-xs'
            >
              Pretty
            </Button>
            <Button
              size='sm'
              variant={formatMode === 'raw' ? 'default' : 'ghost'}
              onClick={() => onFormatModeChange('raw')}
              className='h-7 px-2 text-xs'
            >
              Raw
            </Button>
          </div>

          <Badge variant='outline' className='text-xs'>
            {contentType}
          </Badge>
        </div>

        <div className='flex items-center gap-1'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setLineNumbers(!lineNumbers)}
          >
            {lineNumbers ? 'Hide' : 'Show'} Lines
          </Button>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setWrapLines(!wrapLines)}
          >
            {wrapLines ? 'Unwrap' : 'Wrap'}
          </Button>
          <Button size='sm' variant='ghost' onClick={copyToClipboard}>
            <Copy className='w-4 h-4' />
          </Button>
          <Button size='sm' variant='ghost' onClick={downloadResponse}>
            <Download className='w-4 h-4' />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className='flex-1'>{getViewerComponent()}</div>

      {/* Status Bar */}
      <div className='px-4 py-2 border-t bg-muted/50'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span>Lines: {formattedBody.split('\n').length}</span>
            <span>Size: {response.size} bytes</span>
            <span>Time: {response.time}ms</span>
          </div>
          <div className='flex items-center gap-4'>
            <span>Language: {language}</span>
            <span>Encoding: UTF-8</span>
            {searchQuery && <span>Found: {searchQuery}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
