/**
 * Header Filter component
 * Search input untuk response headers
 */

import { Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeaderFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export function HeaderFilter({
  searchQuery,
  onSearchChange,
}: HeaderFilterProps) {
  return (
    <Input
      placeholder='Search headers...'
      value={searchQuery}
      onChange={e => onSearchChange(e.target.value)}
      className='w-48 h-8'
    />
  );
}

/**
 * Header Filter Controls component
 * Filter controls untuk response headers
 */

interface HeaderFilterControlsProps {
  showOnlyStandard: boolean;
  standardHeadersCount: number;
  onToggleStandard: () => void;
}

export function HeaderFilterControls({
  showOnlyStandard,
  standardHeadersCount,
  onToggleStandard,
}: HeaderFilterControlsProps) {
  return (
    <div className='px-4 pt-4'>
      <div className='flex items-center gap-4'>
        <Button
          size='sm'
          variant={showOnlyStandard ? 'default' : 'outline'}
          onClick={onToggleStandard}
          className='flex items-center gap-2'
        >
          <Filter className='w-4 h-4' />
          Standard Headers Only
        </Button>

        {showOnlyStandard && (
          <span className='text-xs text-muted-foreground'>
            Showing {standardHeadersCount} standard header types
          </span>
        )}
      </div>
    </div>
  );
}
