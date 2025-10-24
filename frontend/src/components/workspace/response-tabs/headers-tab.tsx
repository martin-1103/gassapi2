import { Search, Copy, Download, Filter, Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

interface ResponseHeadersTabProps {
  headers: Record<string, string>;
}

export function ResponseHeadersTab({ headers }: ResponseHeadersTabProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showOnlyStandard, setShowOnlyStandard] = React.useState(false);
  const { toast } = useToast();

  const standardHeaders = [
    'content-type',
    'content-length',
    'content-encoding',
    'content-disposition',
    'cache-control',
    'expires',
    'etag',
    'last-modified',
    'accept-ranges',
    'age',
    'allow',
    'server',
    'date',
    'connection',
    'authorization',
    'www-authenticate',
    'set-cookie',
    'cookie',
    'location',
    'refresh',
    'x-frame-options',
    'x-xss-protection',
    'x-content-type-options',
    'strict-transport-security',
    'content-security-policy',
  ];

  const filteredHeaders = React.useMemo(() => {
    let filtered = Object.entries(headers);

    if (showOnlyStandard) {
      filtered = filtered.filter(([key]) =>
        standardHeaders.includes(key.toLowerCase()),
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        ([key, value]) =>
          key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          value.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  }, [headers, searchQuery, showOnlyStandard]);

  const categorizeHeader = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower.startsWith('content-')) return 'Content';
    if (keyLower.startsWith('cache-')) return 'Cache';
    if (keyLower.includes('auth') || keyLower.includes('authorization'))
      return 'Authentication';
    if (keyLower.includes('cors') || keyLower.includes('access-control'))
      return 'CORS';
    if (keyLower.startsWith('x-')) return 'Custom';
    if (keyLower.includes('security') || keyLower.includes('protection'))
      return 'Security';
    return 'General';
  };

  const getHeaderCategoryColor = (category: string) => {
    switch (category) {
      case 'Content':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Cache':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'Authentication':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'CORS':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Security':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Custom':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const groupedHeaders = React.useMemo(() => {
    return filteredHeaders.reduce(
      (acc, [key, value]) => {
        const category = categorizeHeader(key);
        if (!acc[category]) acc[category] = [];
        acc[category].push([key, value]);
        return acc;
      },
      {} as Record<string, Array<[string, string]>>,
    );
  }, [filteredHeaders]);

  const copyHeaders = () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(headersText);

    toast({
      title: 'Headers copied',
      description: 'Response headers copied to clipboard',
    });
  };

  const downloadHeaders = () => {
    const headersText = Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    const blob = new Blob([headersText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_headers_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Headers downloaded',
      description: 'Response headers saved to download folder',
    });
  };

  const copyAsJSON = () => {
    const headersJSON = JSON.stringify(headers, null, 2);
    navigator.clipboard.writeText(headersJSON);

    toast({
      title: 'Headers copied as JSON',
      description: 'Response headers copied as JSON to clipboard',
    });
  };

  const formatHeaderValue = (key: string, value: string) => {
    // Format certain headers for better readability
    const keyLower = key.toLowerCase();

    if (keyLower === 'content-length') {
      const bytes = parseInt(value);
      if (!isNaN(bytes)) {
        if (bytes < 1024) return `${bytes} bytes`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
      }
    }

    if (keyLower === 'content-type') {
      return value.split(';').map((part, index) => {
        if (index === 0) return <span className='font-medium'>{part}</span>;
        return <span className='text-muted-foreground'>{part}</span>;
      });
    }

    return value;
  };

  const getHeaderIcon = (key: string) => {
    const keyLower = key.toLowerCase();
    if (keyLower.includes('content-type')) return '📄';
    if (keyLower.includes('authorization')) return '🔐';
    if (keyLower.includes('cache')) return '💾';
    if (keyLower.includes('server')) return '🖥️';
    if (keyLower.includes('cookie')) return '🍪';
    if (keyLower.includes('security')) return '🛡️';
    return '📋';
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-4'>
          <h3 className='font-semibold'>Headers</h3>
          <Badge variant='outline'>{Object.keys(headers).length} total</Badge>
          {filteredHeaders.length < Object.keys(headers).length && (
            <Badge variant='secondary' className='text-xs'>
              {filteredHeaders.length} showing
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Input
            placeholder='Search headers...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-48 h-8'
          />
          <Button size='sm' variant='ghost' onClick={copyHeaders}>
            <Copy className='w-4 h-4 mr-2' />
            Copy
          </Button>
          <Button size='sm' variant='ghost' onClick={copyAsJSON}>
            Copy JSON
          </Button>
          <Button size='sm' variant='ghost' onClick={downloadHeaders}>
            <Download className='w-4 h-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='px-4 pt-4'>
        <div className='flex items-center gap-4'>
          <Button
            size='sm'
            variant={showOnlyStandard ? 'default' : 'outline'}
            onClick={() => setShowOnlyStandard(!showOnlyStandard)}
            className='flex items-center gap-2'
          >
            <Filter className='w-4 h-4' />
            Standard Headers Only
          </Button>

          {showOnlyStandard && (
            <span className='text-xs text-muted-foreground'>
              Showing {Object.keys(standardHeaders).length} standard header
              types
            </span>
          )}
        </div>
      </div>

      {/* Headers Content */}
      <div className='flex-1 overflow-auto p-4'>
        {Object.keys(groupedHeaders).length === 0 ? (
          <div className='text-center text-muted-foreground py-8'>
            <Filter className='w-12 h-12 mx-auto mb-4 opacity-50' />
            <h3 className='text-lg font-semibold mb-2'>No headers found</h3>
            <p className='text-sm'>
              {searchQuery
                ? 'Try adjusting your search query'
                : 'No headers in this response'}
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {Object.entries(groupedHeaders).map(
              ([category, categoryHeaders]) => (
                <div
                  key={category}
                  className='border rounded-lg overflow-hidden'
                >
                  <div className='px-3 py-2 bg-muted/50 font-medium text-sm text-muted-foreground flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className={getHeaderCategoryColor(category)}
                    >
                      {category}
                    </Badge>
                    <span>{categoryHeaders.length} headers</span>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className='w-1/3'>Header Name</TableHead>
                        <TableHead className='w-2/3'>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryHeaders.map(([key, value]) => (
                        <TableRow key={key} className='hover:bg-muted/30'>
                          <TableCell className='font-mono text-sm'>
                            <div className='flex items-center gap-2'>
                              <span className='text-lg'>
                                {getHeaderIcon(key)}
                              </span>
                              <span className='break-all'>{key}</span>
                            </div>
                          </TableCell>
                          <TableCell className='font-mono text-sm break-all'>
                            {formatHeaderValue(key, value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ),
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className='p-4 border-t bg-muted/50'>
        <div className='flex items-center justify-between text-xs text-muted-foreground'>
          <div>
            {Object.keys(headers).length} total headers |
            {filteredHeaders.length} showing
            {searchQuery && ` (filtered by "${searchQuery}")`}
          </div>

          <div className='flex items-center gap-4'>
            <span>Categories: {Object.keys(groupedHeaders).length}</span>
            <span>
              Total size: {new Blob([JSON.stringify(headers)]).size} bytes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
