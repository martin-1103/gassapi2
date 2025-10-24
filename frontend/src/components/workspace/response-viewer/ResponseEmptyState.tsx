import { Eye } from 'lucide-react';

export const ResponseEmptyState = () => {
  return (
    <div className='h-full flex flex-col'>
      {/* Empty State */}
      <div className='flex-1 flex items-center justify-center text-muted-foreground'>
        <div className='text-center max-w-md'>
          <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
            <Eye className='w-8 h-8' />
          </div>
          <h3 className='text-lg font-semibold mb-2'>No Response Yet</h3>
          <p className='text-sm mb-4'>
            Send a request to see the response here. The response will include
            status, headers, body, and test results.
          </p>
          <div className='space-y-2 text-xs text-left bg-muted/50 rounded p-3'>
            <p>• Response status and timing</p>
            <p>• Response headers and metadata</p>
            <p>• Formatted response body</p>
            <p>• Test results and validation</p>
            <p>• Auto-generated documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
};