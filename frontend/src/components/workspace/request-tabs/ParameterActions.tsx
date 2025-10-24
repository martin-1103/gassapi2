import { Plus, Copy, Edit3 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Props interface untuk ParameterActions component
interface ParameterActionsProps {
  onImportFromUrl: () => void;
  onBulkEdit: () => void;
  onCopyAll: () => void;
  onAddParam: () => void;
  paramsCount: { enabled: number; total: number };
}

// Component untuk header actions dan bulk operations
export function ParameterActions({
  onImportFromUrl,
  onBulkEdit,
  onCopyAll,
  onAddParam,
  paramsCount,
}: ParameterActionsProps) {
  return (
    <div className='flex items-center justify-between p-4 border-b'>
      <div className='flex items-center gap-3'>
        <h3 className='font-semibold'>Query Parameters</h3>
        <Badge variant='outline'>
          {paramsCount.enabled}/{paramsCount.total} active
        </Badge>
      </div>

      <div className='flex items-center gap-2'>
        <Button size='sm' variant='outline' onClick={onImportFromUrl}>
          Import from URL
        </Button>
        <Button size='sm' variant='outline' onClick={onBulkEdit}>
          <Edit3 className='w-4 h-4 mr-2' />
          Bulk Edit
        </Button>
        <Button size='sm' variant='outline' onClick={onCopyAll}>
          <Copy className='w-4 h-4 mr-2' />
          Copy All
        </Button>
        <Button size='sm' onClick={onAddParam}>
          <Plus className='w-4 h-4 mr-2' />
          Add
        </Button>
      </div>
    </div>
  );
}
