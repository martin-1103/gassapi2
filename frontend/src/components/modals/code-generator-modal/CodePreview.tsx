import { MethodBadge } from '@/components/common/method-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { RequestData } from './utils/template-utils';

interface CodePreviewProps {
  requestData: RequestData;
}

export function CodePreview({ requestData }: CodePreviewProps) {
  return (
    <Card className='mb-4'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm'>Request Details</CardTitle>
      </CardHeader>
      <CardContent className='pt-0'>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium text-muted-foreground'>Method:</span>
            <div className='mt-1'>
              <MethodBadge method={requestData.method} />
            </div>
          </div>
          <div>
            <span className='font-medium text-muted-foreground'>URL:</span>
            <code className='block mt-1 break-all bg-muted px-2 py-1 rounded text-xs'>
              {requestData.url}
            </code>
          </div>
          <div className='col-span-2'>
            <span className='font-medium text-muted-foreground'>Headers:</span>
            <code className='block mt-1 break-all bg-muted px-2 py-1 rounded text-xs'>
              {Object.keys(requestData.headers).length} headers
            </code>
          </div>
          <div className='col-span-2'>
            <span className='font-medium text-muted-foreground'>Body:</span>
            <code className='block mt-1 break-all bg-muted px-2 py-1 rounded text-xs'>
              {requestData.body
                ? JSON.stringify(requestData.body).substring(0, 50) + '...'
                : 'No body'}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
