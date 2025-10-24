import { Plus, Trash2, Copy, BookOpen } from 'lucide-react';
import { useState } from 'react';

import { CodeEditor } from '@/components/common/code-editor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface RequestHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

const COMMON_HEADERS = [
  {
    key: 'Content-Type',
    value: 'application/json',
    description: 'Media type of request body',
  },
  {
    key: 'Accept',
    value: 'application/json',
    description: 'Media types that are acceptable',
  },
  {
    key: 'Authorization',
    value: 'Bearer {{token}}',
    description: 'Authentication credentials',
  },
  {
    key: 'User-Agent',
    value: 'GASS-API/1.0',
    description: 'Client identification',
  },
  { key: 'Cache-Control', value: 'no-cache', description: 'Cache directives' },
  {
    key: 'X-Requested-With',
    value: 'XMLHttpRequest',
    description: 'AJAX request identifier',
  },
  {
    key: 'X-API-Key',
    value: '{{api_key}}',
    description: 'API key authentication',
  },
  { key: 'X-Client-Version', value: '1.0.0', description: 'Client version' },
];

interface RequestHeadersTabProps {
  headers: RequestHeader[];
  onChange: (headers: RequestHeader[]) => void;
}

export function RequestHeadersTab({
  headers,
  onChange,
}: RequestHeadersTabProps) {
  const [showCommonHeaders, setShowCommonHeaders] = useState(true);

  const addHeader = () => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: '',
      value: '',
      enabled: true,
    };
    onChange([...headers, newHeader]);
  };

  const addCommonHeader = (header: (typeof COMMON_HEADERS)[0]) => {
    const newHeader: RequestHeader = {
      id: Date.now().toString(),
      key: header.key,
      value: header.value,
      enabled: true,
      description: header.description,
    };
    onChange([...headers, newHeader]);
  };

  const updateHeader = (id: string, updates: Partial<RequestHeader>) => {
    onChange(
      headers.map(header =>
        header.id === id ? { ...header, ...updates } : header,
      ),
    );
  };

  const deleteHeader = (id: string) => {
    onChange(headers.filter(header => header.id !== id));
  };

  const getHeadersObject = () => {
    const enabledHeaders = headers.filter(
      header => header.enabled && header.key,
    );
    return enabledHeaders.reduce(
      (acc, header) => {
        acc[header.key] = header.value;
        return acc;
      },
      {} as Record<string, string>,
    );
  };

  const copyHeaders = () => {
    const headersObj = getHeadersObject();
    const headersText = Object.entries(headersObj)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(headersText);
  };

  const copyAsCurl = () => {
    const headersObj = getHeadersObject();
    const curlHeaders = Object.entries(headersObj)
      .map(([key, value]) => `-H "${key}: ${value}"`)
      .join(' \\\n  ');

    const curlCommand = `curl -X GET \\
  ${curlHeaders} \\
  https://example.com`;

    navigator.clipboard.writeText(curlCommand);
  };

  const clearDisabledHeaders = () => {
    const enabledHeaders = headers.filter(header => header.enabled);
    onChange(enabledHeaders);
  };

  const enabledCount = headers.filter(h => h.enabled).length;

  return (
    <TooltipProvider>
      <div className='h-full flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-4'>
            <h3 className='font-semibold'>Headers</h3>
            <Badge variant='outline'>{enabledCount} active</Badge>
          </div>

          <div className='flex items-center gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyAsCurl}
                  disabled={enabledCount === 0}
                >
                  Copy as cURL
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy headers as cURL command</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={copyHeaders}
                  disabled={enabledCount === 0}
                >
                  <Copy className='w-4 h-4 mr-2' />
                  Copy
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy headers to clipboard</TooltipContent>
            </Tooltip>

            <Button size='sm' onClick={addHeader}>
              <Plus className='w-4 h-4 mr-2' />
              Add
            </Button>
          </div>
        </div>

        {/* Common Headers */}
        {showCommonHeaders && (
          <Card className='mx-4 mt-4'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <BookOpen className='w-4 h-4' />
                  Common Headers
                </div>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 w-6 p-0'
                  onClick={() => setShowCommonHeaders(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className='pt-0'>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2'>
                {COMMON_HEADERS.map(header => (
                  <Button
                    key={header.key}
                    size='sm'
                    variant='outline'
                    onClick={() => addCommonHeader(header)}
                    className='text-xs h-6 justify-start'
                  >
                    {header.key}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Headers Table */}
        <div className='flex-1 p-4'>
          {headers.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
              <BookOpen className='w-12 h-12 mb-4 opacity-50' />
              <p className='text-lg mb-2'>No headers added</p>
              <p className='text-sm mb-4'>
                Add common headers from the suggestions above or create custom
                ones
              </p>
              <Button size='sm' onClick={addHeader}>
                <Plus className='w-4 h-4 mr-2' />
                Add Header
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-12'>Enabled</TableHead>
                  <TableHead>Header Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className='w-20'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {headers.map(header => (
                  <TableRow key={header.id}>
                    <TableCell>
                      <Checkbox
                        checked={header.enabled}
                        onCheckedChange={checked =>
                          updateHeader(header.id, { enabled: !!checked })
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Header name'
                        value={header.key}
                        onChange={e =>
                          updateHeader(header.id, { key: e.target.value })
                        }
                        className='font-mono text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Header value'
                        value={header.value}
                        onChange={e =>
                          updateHeader(header.id, { value: e.target.value })
                        }
                        className='font-mono text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder='Description (optional)'
                        value={header.description || ''}
                        onChange={e =>
                          updateHeader(header.id, {
                            description: e.target.value,
                          })
                        }
                        className='text-sm'
                      />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size='sm' variant='ghost'>
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem>Copy Value</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => deleteHeader(header.id)}
                            className='text-destructive'
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Footer */}
        <div className='p-4 border-t bg-muted/50'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-muted-foreground'>
              Active headers will be sent with request
            </div>
            <div className='flex items-center gap-2'>
              {!showCommonHeaders && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => setShowCommonHeaders(true)}
                >
                  <BookOpen className='w-4 h-4 mr-2' />
                  Common Headers
                </Button>
              )}

              {headers.filter(h => !h.enabled).length > 0 && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={clearDisabledHeaders}
                >
                  Clear Disabled
                </Button>
              )}

              <CodeEditor
                value={JSON.stringify(getHeadersObject(), null, 2)}
                onChange={() => {}}
                language='json'
                rows={3}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
