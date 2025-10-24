import { ApiResponse } from '@/types/api';

interface ResponseStatusBarProps {
  response: ApiResponse;
  formatMode: 'pretty' | 'raw';
  searchQuery: string;
}

export const ResponseStatusBar = ({
  response,
  formatMode,
  searchQuery,
}: ResponseStatusBarProps) => {
  return (
    <div className='px-4 py-2 border-t bg-muted/50'>
      <div className='flex items-center justify-between text-xs text-muted-foreground'>
        <div className='flex items-center gap-4'>
          <span>Status: {response.status}</span>
          <span>Time: {response.time}ms</span>
          <span>Size: {response.size} bytes</span>
          {response.redirected && (
            <span>Redirected to: {response.redirectUrl}</span>
          )}
        </div>
        <div className='flex items-center gap-4'>
          <span>Content-Type: {response.headers?.['content-type']?.split(';')[0] || 'unknown'}</span>
          <span>Format: {formatMode}</span>
          {searchQuery && <span>Searching: "{searchQuery}"</span>}
        </div>
      </div>
    </div>
  );
};