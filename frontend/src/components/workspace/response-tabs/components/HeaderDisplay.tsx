/**
 * Header Display component
 * Main display area untuk grouped response headers
 */

import { Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getHeaderCategoryColor } from '@/lib/headers/header-analysis';
import { formatHeaderValue, getHeaderIcon } from '@/lib/headers/header-utils';

interface HeaderDisplayProps {
  groupedHeaders: Record<string, Array<[string, string]>>;
  searchQuery: string;
}

export function HeaderDisplay({
  groupedHeaders,
  searchQuery,
}: HeaderDisplayProps) {
  if (Object.keys(groupedHeaders).length === 0) {
    return (
      <div className='text-center text-muted-foreground py-8'>
        <Filter className='w-12 h-12 mx-auto mb-4 opacity-50' />
        <h3 className='text-lg font-semibold mb-2'>No headers found</h3>
        <p className='text-sm'>
          {searchQuery
            ? 'Try adjusting your search query'
            : 'No headers in this response'}
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {Object.entries(groupedHeaders).map(([category, categoryHeaders]) => (
        <div key={category} className='border rounded-lg overflow-hidden'>
          <div className='px-3 py-2 bg-muted/50 font-medium text-sm text-muted-foreground flex items-center gap-2'>
            <Badge
              variant='outline'
              className={getHeaderCategoryColor(category)}
            >
              {category}
            </Badge>
            <span>{categoryHeaders.length} headers</span>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-1/3'>Header Name</TableHead>
                <TableHead className='w-2/3'>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryHeaders.map(([key, value]) => (
                <TableRow key={key} className='hover:bg-muted/30'>
                  <TableCell className='font-mono text-sm'>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>{getHeaderIcon(key)}</span>
                      <span className='break-all'>{key}</span>
                    </div>
                  </TableCell>
                  <TableCell className='font-mono text-sm break-all'>
                    {formatHeaderValue(key, value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </div>
  );
}
