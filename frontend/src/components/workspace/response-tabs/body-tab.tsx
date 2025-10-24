import {
  Search,
  Code,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Download,
  Copy,
  FileText,
  Binary,
  FileJson,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils/index';

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
  const [viewMode, setViewMode] = React.useState<'pretty' | 'raw' | 'tree'>(
    'pretty',
  );
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [lineNumbers, setLineNumbers] = React.useState(true);
  const [wrapLines, setWrapLines] = React.useState(false);
  const [expandedPaths, setExpandedPaths] = React.useState<Set<string>>(
    new Set(['root']),
  );
  const { toast } = useToast();

  const getContentType = () => {
    if (!response.headers) return 'unknown';
    const contentType =
      response.headers['content-type'] || response.headers['Content-Type'];
    return contentType?.split(';')[0] || 'unknown';
  };

  const getLanguage = () => {
    const contentType = getContentType();
    if (contentType.includes('json')) return 'json';
    if (contentType.includes('xml')) return 'xml';
    if (contentType.includes('html')) return 'html';
    if (contentType.includes('javascript')) return 'javascript';
    if (contentType.includes('css')) return 'css';
    return 'text';
  };

  const formatData = (data: any) => {
    if (formatMode === 'raw') {
      return typeof data === 'string' ? data : JSON.stringify(data);
    }

    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2);
      } catch {
        return data;
      }
    }

    return JSON.stringify(data, null, 2);
  };

  const copyToClipboard = () => {
    const formatted = formatData(response.data);
    navigator.clipboard.writeText(formatted);
    toast({
      title: 'Response copied',
      description: 'Response body copied to clipboard',
    });
  };

  const downloadResponse = () => {
    const formatted = formatData(response.data);
    const blob = new Blob([formatted], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.status}_${Date.now()}.${getLanguage()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Response downloaded',
      description: 'Response saved to download folder',
    });
  };

  const highlightSearchText = (text: string) => {
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === searchQuery.toLowerCase()) {
        return (
          <mark key={index} className='bg-yellow-200 px-1 rounded'>
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const togglePath = (path: string) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderTreeView = (
    data: any,
    path: string = 'root',
    level: number = 0,
  ) => {
    if (data === null) return <span className='text-purple-600'>null</span>;
    if (data === undefined)
      return <span className='text-purple-600'>undefined</span>;

    if (typeof data === 'string') {
      return (
        <span className='text-green-600'>"{highlightSearchText(data)}"</span>
      );
    }

    if (typeof data === 'number') {
      return (
        <span className='text-blue-600'>
          {highlightSearchText(data.toString())}
        </span>
      );
    }

    if (typeof data === 'boolean') {
      return (
        <span className='text-orange-600'>
          {highlightSearchText(data.toString())}
        </span>
      );
    }

    if (Array.isArray(data)) {
      const isExpanded = expandedPaths.has(path);
      return (
        <div className={cn(level > 0 ? 'ml-4' : '')}>
          <span
            className='cursor-pointer select-none'
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'}
            <span className='text-gray-600'>[{data.length}]</span>
          </span>
          {isExpanded && (
            <div className='mt-1'>
              {data.map((item, index) => (
                <div key={index} className='ml-6'>
                  {renderTreeView(item, `${path}[${index}]`, level + 1)}
                  {index < data.length - 1 && (
                    <span className='text-gray-400'>,</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof data === 'object') {
      const isExpanded = expandedPaths.has(path);
      const keys = Object.keys(data);

      return (
        <div className={cn(level > 0 ? 'ml-4' : '')}>
          <span
            className='cursor-pointer select-none'
            onClick={() => togglePath(path)}
          >
            {isExpanded ? '▼' : '▶'}
            <span className='text-gray-600'>{'{' + keys.length + '}'}</span>
          </span>
          {isExpanded && (
            <div className='mt-1'>
              {keys.map((key, index) => (
                <div key={key} className='ml-6'>
                  <span className='text-blue-600'>"{key}"</span>
                  <span>: </span>
                  {renderTreeView(data[key], `${path}.${key}`, level + 1)}
                  {index < keys.length - 1 && (
                    <span className='text-gray-400'>,</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const language = getLanguage();
  const formattedData = formatData(response.data);
  const contentType = getContentType();

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

          <div className='flex items-center gap-1 border rounded-md'>
            <Button
              size='sm'
              variant={viewMode === 'pretty' ? 'default' : 'ghost'}
              onClick={() => setViewMode('pretty')}
              className='h-7 px-2 text-xs'
            >
              <Eye className='w-3 h-3 mr-1' />
              Pretty
            </Button>
            <Button
              size='sm'
              variant={viewMode === 'raw' ? 'default' : 'ghost'}
              onClick={() => setViewMode('raw')}
              className='h-7 px-2 text-xs'
            >
              <Code className='w-3 h-3 mr-1' />
              Raw
            </Button>
            <Button
              size='sm'
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              onClick={() => setViewMode('tree')}
              className='h-7 px-2 text-xs'
            >
              <FileJson className='w-3 h-3 mr-1' />
              Tree
            </Button>
          </div>
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
        {viewMode === 'tree' ? (
          <ScrollArea className='h-full'>
            <div className='p-4'>
              <div className='font-mono text-sm'>
                {renderTreeView(response.data)}
              </div>
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className='h-full'>
            <div className='relative'>
              {/* Line Numbers */}
              {lineNumbers && (
                <div className='absolute left-0 top-0 bottom-0 w-12 bg-muted/30 border-r text-xs text-muted-foreground p-4 text-right select-none'>
                  {formattedData.split('\n').map((_, index) => (
                    <div key={index} className='leading-6'>
                      {index + 1}
                    </div>
                  ))}
                </div>
              )}

              {/* Code Content */}
              <div
                className={cn(
                  'font-mono text-sm bg-background p-4 overflow-auto',
                  lineNumbers && 'ml-12',
                )}
              >
                <pre
                  className={cn(
                    wrapLines ? 'whitespace-pre-wrap' : 'whitespace-pre',
                  )}
                >
                  <code>
                    {searchQuery
                      ? highlightSearchText(formattedData)
                      : formattedData}
                  </code>
                </pre>
              </div>
            </div>
          </ScrollArea>
        )}
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
