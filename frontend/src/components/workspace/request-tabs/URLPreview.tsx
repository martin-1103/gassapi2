import { Button } from '@/components/ui/button';

// Props interface untuk URLPreview component
interface URLPreviewProps {
  url: string;
  queryString: string;
}

// Component untuk menampilkan preview URL yang di-generate
export function URLPreview({ url, queryString }: URLPreviewProps) {
  const generatedUrl = url.includes('?')
    ? url.split('?')[0] + '?' + queryString
    : url + '?' + queryString;

  return (
    <div className='p-4 border-t bg-muted/50'>
      <div className='flex items-center justify-between'>
        <div className='text-sm text-muted-foreground'>
          <div>Generated URL: </div>
          <code className='ml-2 px-2 py-1 bg-background rounded text-xs'>
            {generatedUrl}
          </code>
        </div>
        <div className='flex items-center gap-2'>
          <span className='text-xs text-muted-foreground'>URL Encoding:</span>
          <Button size='sm' variant='outline'>
            Apply Encoding
          </Button>
        </div>
      </div>
    </div>
  );
}
