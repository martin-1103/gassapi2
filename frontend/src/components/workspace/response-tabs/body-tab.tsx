import {
  Search,
  Maximize2,
  Minimize2,
  Download,
  Copy,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/index';
import { useResponseViewState } from '@/hooks/use-response-view-state';
import { useResponseBodyState } from '@/hooks/useResponseBodyState';

// Import viewer components
import { JsonResponseViewer } from '@/components/workspace/response-viewer/JsonResponseViewer';
import { TextViewer } from '@/components/workspace/response-viewer/TextViewer';
import { XmlResponseViewer } from '@/components/workspace/response-viewer/XmlResponseViewer';
import { HtmlResponseViewer } from '@/components/workspace/response-viewer/HtmlResponseViewer';
import { BinaryResponseViewer } from '@/components/workspace/response-viewer/BinaryResponseViewer';

interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

interface ResponseBodyTabProps {
  response: ResponseData;
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
  onSearchChange,
}: ResponseBodyTabProps) {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { lineNumbers, setLineNumbers, wrapLines, setWrapLines } = useResponseViewState();

  // Extract all business logic to custom hook
  const {
    contentType,
    language,
    formattedData,
    viewerType,
    getSyntaxHighlighterClass,
    copyToClipboard,
    downloadResponse,
  } = useResponseBodyState({
    response,
    formatMode,
    searchQuery,
  });

  // Render the appropriate viewer based on content type
  const renderContentViewer = () => {
    const commonProps = {
      data: response.data,
      formatMode,
      formattedData,
      searchQuery,
      lineNumbers,
      wrapLines,
      getSyntaxHighlighterClass,
    };

    switch (viewerType) {
      case 'json':
        return <JsonResponseViewer {...commonProps} />;
      case 'xml':
        return <XmlResponseViewer {...commonProps} />;
      case 'html':
        return <HtmlResponseViewer {...commonProps} />;
      case 'binary':
        return <BinaryResponseViewer {...commonProps} />;
      default:
        return <TextViewer {...commonProps} />;
    }
  };

  return (
    <div
      className={cn(
        'h-full flex flex-col',
        isFullscreen && 'fixed inset-0 z-50 bg-background',
      )}
    >
      {/* Toolbar */}
      <div className='flex items-center justify-between p-3 border-b'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-1'>
            <Search className='w-4 h-4 text-muted-foreground' />
            <Input
              placeholder='Search response...'
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className='w-64 h-8'
            />
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

      {/* Content */}
      <div className='flex-1 overflow-hidden'>
        {renderContentViewer()}
      </div>

      {/* Status Bar */}
      <div className='flex items-center justify-between p-3 border-t bg-muted/50 text-xs text-muted-foreground'>
        <div>
          Lines: {formattedData.split('\n').length} | Size: {response.size}{' '}
          bytes | Time: {response.time}ms
        </div>
        <div>
          Language: {language} | Encoding: UTF-8 |
          {searchQuery && ` Found: ${searchQuery}`}
        </div>
      </div>
    </div>
  );
}