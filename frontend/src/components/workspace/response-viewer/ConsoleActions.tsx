import { Download, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ConsoleActionsProps {
  onExport: () => void;
  onClear: () => void;
}

export default function ConsoleActions({
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
