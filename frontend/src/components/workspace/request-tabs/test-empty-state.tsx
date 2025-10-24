import { TestTube } from 'lucide-react';

export function TestEmptyState() {
  return (
    <div className='flex-1 flex items-center justify-center text-muted-foreground'>
      <div className='text-center'>
        <TestTube className='w-12 h-12 mx-auto mb-4 opacity-50' />
        <h3 className='text-lg font-semibold mb-2'>No Test Selected</h3>
        <p className='text-sm'>
          Select a test script to edit or create a new one
        </p>
        <div className='mt-4 space-y-2 text-left bg-muted/50 rounded p-3 max-w-md mx-auto'>
          <p className='text-xs font-medium mb-1'>Available APIs:</p>
          <ul className='text-xs space-y-1'>
            <li>
              <code className='bg-background px-1 py-0.5 rounded'>
                pm.test(name, fn)
              </code>{' '}
              - Create test
            </li>
            <li>
              <code className='bg-background px-1 py-0.5 rounded'>
                pm.expect(value).to.equal(expected)
              </code>{' '}
              - Assertions
            </li>
            <li>
              <code className='bg-background px-1 py-0.5 rounded'>
                pm.response
              </code>{' '}
              - Response object
            </li>
            <li>
              <code className='bg-background px-1 py-0.5 rounded'>
                pm.environment
              </code>{' '}
              - Environment variables
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}