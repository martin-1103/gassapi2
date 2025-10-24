import { Binary } from 'lucide-react';

interface BinaryData {
  contentType?: string;
  size?: number;
}

interface BinaryResponseViewerProps {
  data: BinaryData;
}

export const BinaryResponseViewer = ({ data }: BinaryResponseViewerProps) => {
  return (
    <div className='h-full flex flex-col items-center justify-center p-8 text-center'>
      <Binary className='w-16 h-16 text-muted-foreground mb-4' />
      <h3 className='text-lg font-medium mb-2'>Binary Content</h3>
      <p className='text-muted-foreground mb-4'>
        This response contains binary data that cannot be displayed as text.
      </p>
      <p className='text-sm text-muted-foreground'>
        Content-Type: {data?.contentType || 'application/octet-stream'}
      </p>
    </div>
  );
};
