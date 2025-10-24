import { Copy, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsoleEntry } from '@/types/console';
import { ConsoleStats } from '@/lib/console/console-utils';

interface ConsoleActionsProps {
  consoleEntries: ConsoleEntry[];
  stats: ConsoleStats;
  onExport: () => void;
  onClear: () => void;
}

export default function ConsoleActions({
  consoleEntries,
  stats,
  onExport,
  onClear,
}: ConsoleActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button size='sm' variant='outline' onClick={onExport}>
        <Download className='w-4 h-4 mr-2' />
        Export
      </Button>
      <Button size='sm' variant='outline' onClick={onClear}>
        <Trash2 className='w-4 h-4 mr-2' />
        Clear All
      </Button>
    </div>
  );
}