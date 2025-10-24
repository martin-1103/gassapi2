import { Globe } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ApiEndpoint, ApiResponse } from './types';

interface OverviewTabProps {
  endpoint: ApiEndpoint;
  response: ApiResponse;
}

/**
 * Komponen untuk tab Overview - menampilkan request dan response information
 */
export function OverviewTab({ endpoint, response }: OverviewTabProps) {
  const hasParameters = endpoint.parameters && endpoint.parameters.length > 0;
  const hasRequestBody = endpoint.requestBody;

  const getContentType = (): string => {
    const contentTypeHeader = Object.keys(response.headers || {}).find(
      key => key.toLowerCase() === 'content-type',
    );
    return contentTypeHeader
      ? response.headers[contentTypeHeader]
      : 'application/json';
  };

  return (
    <div className='space-y-6'>
      {/* Request Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base flex items-center gap-2'>
            <Globe className='w-4 h-4' />
            Request Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Method
              </div>
              <div className='flex items-center gap-2'>
                <Badge variant='outline'>{endpoint.method}</Badge>
                <code className='text-xs bg-muted px-2 py-1 rounded'>
                  {endpoint.url}
                </code>
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Content-Type
              </div>
              <div className='text-sm'>{getContentType()}</div>
            </div>
          </div>

          {hasParameters && (
            <>
              <Separator />
              <div>
                <div className='text-sm font-medium text-muted-foreground mb-2'>
                  Parameters
                </div>
                <div className='space-y-2'>
                  {endpoint.parameters?.map((param, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-2 text-sm'
                    >
                      <Badge variant='outline' className='text-xs'>
                        {param.in.toUpperCase()}
                      </Badge>
                      <span className='font-medium'>{param.name}</span>
                      <span className='text-muted-foreground'>
                        {param.type} {param.required && '• Required'}
                      </span>
                      {param.description && (
                        <span className='text-muted-foreground ml-2'>
                          – {param.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {hasRequestBody && (
            <>
              <Separator />
              <div>
                <div className='text-sm font-medium text-muted-foreground mb-2'>
                  Request Body
                </div>
                <div className='text-sm text-muted-foreground'>
                  Request body content type is specified in the Content-Type
                  header
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Response Information */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Response Information</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Status Code
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant={
                    response.status >= 200 && response.status < 300
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {response.status}
                </Badge>
                <span className='text-sm'>{response.statusText}</span>
              </div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Response Time
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-sm'>{response.time || 'Unknown'}ms</span>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Content Length
              </div>
              <div className='text-sm'>{response.size || 'Unknown'} bytes</div>
            </div>
            <div>
              <div className='text-sm font-medium text-muted-foreground'>
                Response Type
              </div>
              <div className='text-sm'>{getContentType()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
