/**
 * Empty state component for headers
 * Extracted from RequestHeadersTab for better organization
 */

import { BookOpen, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HeaderEmptyStateProps {
  onAddHeader: () => void;
}

export function HeaderEmptyState({ onAddHeader }: HeaderEmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center h-full text-muted-foreground'>
      <BookOpen className='w-12 h-12 mb-4 opacity-50' />
      <p className='text-lg mb-2'>No headers added</p>
      <p className='text-sm mb-4'>
        Add common headers from the suggestions above or create custom ones
      </p>
      <Button size='sm' onClick={onAddHeader}>
        <Plus className='w-4 h-4 mr-2' />
        Add Header
      </Button>
    </div>
  );
}