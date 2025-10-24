import { Search, Code, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatResponseContent } from '@/lib/response/response-processor';
import { ApiResponse } from '@/types/api';

interface BodyTabProps {
  response: ApiResponse | null;
  formatMode: 'pretty' | 'raw';
  onFormatModeChange: (mode: 'pretty' | 'raw') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const BodyTab = ({
  response,
  formatMode,
  onFormatModeChange,
  searchQuery,
  onSearchChange,
}: BodyTabProps) => {
  if (!response) {
    return (
      <div className='h-full flex items-center justify-center text-muted-foreground'>
        No response body to display
      </div>
    );
  }

  const content = formatResponseContent(response, formatMode);
  let displayContent = content;

  // If search query exists, highlight matching text
  if (searchQuery) {
    // Simple text highlighting - in a real implementation you might want more sophisticated search
    displayContent = content.replace(
      new RegExp(`(${searchQuery})`, 'gi'),
      '<mark class="bg-yellow-200">$1</mark>',
    );
  }

  return (
    <div className='h-full flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='text-xs'>
            {response.headers?.['content-type']?.split(';')[0] || 'unknown'}
          </Badge>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant={formatMode === 'pretty' ? 'default' : 'outline'}
            onClick={() => onFormatModeChange('pretty')}
          >
            <Code className='w-4 h-4 mr-2' />
            Pretty
          </Button>
          <Button
            size='sm'
            variant={formatMode === 'raw' ? 'default' : 'outline'}
            onClick={() => onFormatModeChange('raw')}
          >
            <Eye className='w-4 h-4 mr-2' />
            Raw
          </Button>
        </div>
      </div>

      <div className='p-4 border-b'>
        <div className='flex items-center gap-2'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search in response body...'
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className='w-64 h-8'
          />
        </div>
      </div>

      <ScrollArea className='flex-1 p-4'>
        <pre className='text-sm whitespace-pre-wrap font-mono'>
          {formatMode === 'raw' ? (
            <code>{content}</code>
          ) : (
            <code dangerouslySetInnerHTML={{ __html: displayContent }} />
          )}
        </pre>
      </ScrollArea>

      <Separator />
      <div className='p-2 text-xs text-muted-foreground flex justify-between'>
        <div>
          {response.data
            ? `${JSON.stringify(response.data).length} characters`
            : '0 characters'}
        </div>
        <div>Format: {formatMode}</div>
      </div>
    </div>
  );
};
