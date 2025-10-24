import { Search, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ResponseSearchControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  formatMode: 'pretty' | 'raw';
  setFormatMode: (mode: 'pretty' | 'raw') => void;
}

export const ResponseSearchControls = ({
  searchQuery,
  setSearchQuery,
  formatMode,
  setFormatMode,
}: ResponseSearchControlsProps) => {
  return (
    <div className='mx-4 mb-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2 flex-1'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search response...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-64 h-8'
          />
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() =>
              setFormatMode(formatMode === 'pretty' ? 'raw' : 'pretty')
            }
          >
            <Code className='w-4 h-4 mr-2' />
            {formatMode === 'pretty' ? 'Raw' : 'Pretty'}
          </Button>
        </div>
      </div>
    </div>
  );
};