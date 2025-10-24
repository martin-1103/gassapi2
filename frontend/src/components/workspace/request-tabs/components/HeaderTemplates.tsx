/**
 * Header templates component for common headers
 * Extracted from RequestHeadersTab for better organization
 */

import { BookOpen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMMON_HEADERS } from '@/lib/utils/header-utils';

interface HeaderTemplatesProps {
  showCommonHeaders: boolean;
  onHideCommonHeaders: () => void;
  onAddCommonHeader: (header: typeof COMMON_HEADERS[0]) => void;
}

export function HeaderTemplates({
  showCommonHeaders,
  onHideCommonHeaders,
  onAddCommonHeader,
}: HeaderTemplatesProps) {
  if (!showCommonHeaders) {
    return null;
  }

  return (
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
            onClick={onHideCommonHeaders}
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
              onClick={() => onAddCommonHeader(header)}
              className='text-xs h-6 justify-start text-left'
              title={header.description}
            >
              {header.key}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}