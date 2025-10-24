/**
 * Header Stats component
 * Statistics footer untuk response headers
 */

import { Badge } from '@/components/ui/badge';

interface HeaderStatsProps {
  totalHeaders: number;
  showingHeaders: number;
  totalCategories: number;
  headersSize: number;
  searchQuery: string;
}

export function HeaderStats({
  totalHeaders,
  showingHeaders,
  totalCategories,
  headersSize,
  searchQuery,
}: HeaderStatsProps) {
  return (
    <div className='p-4 border-t bg-muted/50'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <div>
          {totalHeaders} total headers |
          {showingHeaders} showing
          {searchQuery && ` (filtered by "${searchQuery}")`}
        </div>

        <div className='flex items-center gap-4'>
          <span>Categories: {totalCategories}</span>
          <span>
            Total size: {headersSize} bytes
          </span>
        </div>
      </div>
    </div>
  );
}