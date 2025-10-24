import { ScrollArea } from '@/components/ui/scroll-area';
import { Binary } from 'lucide-react';

interface BinaryResponseViewerProps {
  data: any;
  formatMode: 'pretty' | 'raw';
  formattedData: string;
  searchQuery: string;
  lineNumbers: boolean;
  wrapLines: boolean;
}

export const BinaryResponseViewer = ({
  data,
  formatMode,
  formattedData,
  searchQuery,
  lineNumbers,
  wrapLines,
}: BinaryResponseViewerProps) => {
  // For binary data, we'll show a message indicating the data type
  return (
    <div className='h-full flex flex-col items-center justify-center p-8 text-center'>
      <Binary className='w-16 h-16 text-muted-foreground mb-4' />
      <h3 className='text-lg font-medium mb-2'>Binary Content</h3>
      <p className='text-muted-foreground mb-4'>
        This response contains binary data that cannot be displayed as text.
      </p>
      <p className='text-sm text-muted-foreground'>
        Content-Type: {typeof data === 'object' && data.contentType ? data.contentType : 'application/octet-stream'}
      </p>
    </div>
  );
};