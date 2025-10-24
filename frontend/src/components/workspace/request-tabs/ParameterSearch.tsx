import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Props interface untuk ParameterSearch component
interface ParameterSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToggleAll: (enabled: boolean) => void;
  paramsCount: { enabled: number; total: number };
}

// Component untuk search dan filter parameters
export function ParameterSearch({
  searchTerm,
  onSearchChange,
  onToggleAll,
  paramsCount: _paramsCount,
}: ParameterSearchProps) {
  return (
    <div className='mx-4 mb-4'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-2 flex-1'>
          <Search className='w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Search parameters...'
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className='flex-1'
          />
        </div>

        <div className='flex items-center gap-2'>
          <Button size='sm' variant='outline' onClick={() => onToggleAll(true)}>
            Enable All
          </Button>
          <Button
            size='sm'
            variant='outline'
            onClick={() => onToggleAll(false)}
          >
            Disable All
          </Button>
        </div>
      </div>
    </div>
  );
}
