import { PlayCircle, RefreshCw } from 'lucide-react';
// import * as React from 'react'; // Removed unused React import

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TestExecutionControlsProps {
  totalTests: number;
  isRunning: boolean;
  onRunTests?: () => void;
}

/**
 * Komponen untuk kontrol eksekusi test
 * Menampilkan tombol run test dan status running
 */
export function TestExecutionControls({
  totalTests,
  isRunning,
  onRunTests,
}: TestExecutionControlsProps) {
  return (
    <>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b'>
        <div className='flex items-center gap-3'>
          <h3 className='font-semibold'>Test Results</h3>
          <Badge variant='outline'>{totalTests} tests</Badge>
          {isRunning && (
            <Badge variant='secondary' className='animate-pulse'>
              Running...
            </Badge>
          )}
        </div>

        <div className='flex items-center gap-2'>
          <Button
            size='sm'
            variant='outline'
            onClick={onRunTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <RefreshCw className='w-4 h-4 mr-2 animate-spin' />
                Running
              </>
            ) : (
              <>
                <PlayCircle className='w-4 h-4 mr-2' />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
