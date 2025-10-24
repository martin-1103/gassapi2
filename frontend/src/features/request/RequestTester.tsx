/**
 * Request Tester Component
 * Example implementation untuk testing API dengan Direct HTTP Client
 */

import { Loader2, Send, Copy, Download } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDirectApi } from '@/hooks/use-direct-api';
import {
  formatResponseTime,
  formatResponseSize,
  formatResponseBody,
  getStatusBadgeVariant,
  copyToClipboard,
  downloadResponse,
  generateCurlCommand,
} from '@/lib/utils/http-utils';
import type {
  HttpMethod,
  HttpRequestConfig,
  HttpHeader,
} from '@/types/http-client';

export function RequestTester() {
  // Form state
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState(
    'https://jsonplaceholder.typicode.com/posts/1',
  );
  const [headers, setHeaders] = useState<HttpHeader[]>([]);
  const [bodyText, setBodyText] = useState('');

  // API hook
  const { isLoading, response, error, sendRequest, clearResponse } =
    useDirectApi();

  // Handle send request
  const handleSend = async () => {
    const config: HttpRequestConfig = {
      method,
      url,
      headers: headers.filter(h => h.enabled),
      body: bodyText.trim()
        ? {
            type: 'json',
            json: JSON.parse(bodyText),
          }
        : undefined,
    };

    await sendRequest(config);
  };

  // Handle add header
  const handleAddHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  // Handle remove header
  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  // Handle copy response
  const handleCopyResponse = async () => {
    if (response) {
      const { formatted } = formatResponseBody(response);
      await copyToClipboard(formatted);
    }
  };

  // Handle download response
  const handleDownloadResponse = () => {
    if (response) {
      downloadResponse(response);
    }
  };

  // Handle copy cURL
  const handleCopyCurl = async () => {
    const curl = generateCurlCommand({
      method,
      url,
      headers,
      body: bodyText.trim() ? JSON.parse(bodyText) : undefined,
    });
    await copyToClipboard(curl);
  };

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      {/* Request Section */}
      <div className='space-y-4'>
        <div className='flex gap-2'>
          <Select
            value={method}
            onValueChange={v => setMethod(v as HttpMethod)}
          >
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='GET'>GET</SelectItem>
              <SelectItem value='POST'>POST</SelectItem>
              <SelectItem value='PUT'>PUT</SelectItem>
              <SelectItem value='DELETE'>DELETE</SelectItem>
              <SelectItem value='PATCH'>PATCH</SelectItem>
              <SelectItem value='HEAD'>HEAD</SelectItem>
              <SelectItem value='OPTIONS'>OPTIONS</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder='https://api.example.com/endpoint'
            value={url}
            onChange={e => setUrl(e.target.value)}
            className='flex-1'
          />

          <Button onClick={handleSend} disabled={isLoading || !url}>
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Sending...
              </>
            ) : (
              <>
                <Send className='mr-2 h-4 w-4' />
                Send
              </>
            )}
          </Button>
        </div>

        <Tabs defaultValue='headers'>
          <TabsList>
            <TabsTrigger value='headers'>Headers</TabsTrigger>
            <TabsTrigger value='body'>Body</TabsTrigger>
          </TabsList>

          <TabsContent value='headers' className='space-y-2'>
            {headers.map((header, index) => (
              <div key={index} className='flex gap-2'>
                <Input
                  placeholder='Key'
                  value={header.key}
                  onChange={e => {
                    const newHeaders = [...headers];
                    newHeaders[index].key = e.target.value;
                    setHeaders(newHeaders);
                  }}
                />
                <Input
                  placeholder='Value'
                  value={header.value}
                  onChange={e => {
                    const newHeaders = [...headers];
                    newHeaders[index].value = e.target.value;
                    setHeaders(newHeaders);
                  }}
                />
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => handleRemoveHeader(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button variant='outline' onClick={handleAddHeader}>
              Add Header
            </Button>
          </TabsContent>

          <TabsContent value='body'>
            <textarea
              className='w-full h-32 p-2 border rounded font-mono text-sm'
              placeholder='JSON body...'
              value={bodyText}
              onChange={e => setBodyText(e.target.value)}
            />
          </TabsContent>
        </Tabs>

        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={handleCopyCurl}>
            <Copy className='mr-2 h-4 w-4' />
            Copy as cURL
          </Button>
          <Button variant='outline' size='sm' onClick={clearResponse}>
            Clear Response
          </Button>
        </div>
      </div>

      {/* Response Section */}
      {error && (
        <Alert variant='destructive'>
          <AlertTitle>{error.type.toUpperCase()} Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {response && (
        <div className='space-y-4'>
          <div className='flex items-center gap-2'>
            <Label>Status:</Label>
            <Badge variant={getStatusBadgeVariant(response.status)}>
              {response.status} {response.statusText}
            </Badge>
            <Label className='ml-4'>Time:</Label>
            <span className='text-sm'>{formatResponseTime(response.time)}</span>
            <Label className='ml-4'>Size:</Label>
            <span className='text-sm'>{formatResponseSize(response.size)}</span>

            <div className='ml-auto flex gap-2'>
              <Button variant='outline' size='sm' onClick={handleCopyResponse}>
                <Copy className='mr-2 h-4 w-4' />
                Copy
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={handleDownloadResponse}
              >
                <Download className='mr-2 h-4 w-4' />
                Download
              </Button>
            </div>
          </div>

          <Tabs defaultValue='body'>
            <TabsList>
              <TabsTrigger value='body'>Body</TabsTrigger>
              <TabsTrigger value='headers'>Headers</TabsTrigger>
              <TabsTrigger value='cookies'>Cookies</TabsTrigger>
            </TabsList>

            <TabsContent value='body'>
              <pre className='p-4 bg-muted rounded text-sm overflow-auto max-h-96'>
                {formatResponseBody(response).formatted}
              </pre>
            </TabsContent>

            <TabsContent value='headers'>
              <div className='space-y-2'>
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className='flex gap-2 text-sm'>
                    <span className='font-semibold'>{key}:</span>
                    <span className='text-muted-foreground'>{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value='cookies'>
              {response.cookies && response.cookies.length > 0 ? (
                <div className='space-y-2'>
                  {response.cookies.map((cookie, index) => (
                    <div key={index} className='text-sm'>
                      <span className='font-semibold'>{cookie.name}:</span>{' '}
                      <span className='text-muted-foreground'>
                        {cookie.value}
                      </span>
                      {cookie.domain && (
                        <span className='ml-2 text-xs text-muted-foreground'>
                          (domain: {cookie.domain})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-muted-foreground'>No cookies</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
