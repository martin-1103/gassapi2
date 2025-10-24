/**
 * Header Actions component
 * Copy, export, dan action buttons untuk response headers
 */

import { Copy, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface HeaderActionsProps {
  onCopyHeaders: () => void;
  onCopyAsJSON: () => void;
  onDownloadHeaders: () => void;
}

export function HeaderActions({
  onCopyHeaders,
  onCopyAsJSON,
  onDownloadHeaders,
}: HeaderActionsProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button size='sm' variant='ghost' onClick={onCopyHeaders}>
        <Copy className='w-4 h-4 mr-2' />
        Copy
      </Button>
      <Button size='sm' variant='ghost' onClick={onCopyAsJSON}>
        Copy JSON
      </Button>
      <Button size='sm' variant='ghost' onClick={onDownloadHeaders}>
        <Download className='w-4 h-4 mr-2' />
        Export
      </Button>
    </div>
  );
}
