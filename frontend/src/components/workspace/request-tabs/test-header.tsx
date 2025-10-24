import { Plus, Play, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TestResult } from '@/hooks/useTestConfigurationState';

interface TestHeaderProps {
  testScripts: any[];
  testResults: TestResult[];
  isRunning: boolean;
  onRunTests: () => void;
  onAddTestScript: () => void;
}

export function TestHeader({
  testScripts,
  testResults,
  isRunning,
  onRunTests,
  onAddTestScript,
}: TestHeaderProps) {
  return (
    <div className='flex items-center justify-between p-4 border-b'>
      <div className='flex items-center gap-3'>
        <h3 className='font-semibold'>Tests</h3>
        <Badge variant='outline'>
          {testScripts.filter(t => t.enabled).length} active
        </Badge>
        {testResults.length > 0 && (
          <div className='flex items-center gap-2'>
            <CheckCircle className='w-4 h-4 text-green-500' />
            <span className='text-xs text-green-600'>
              {testResults.filter(t => t.status === 'pass').length} passed
            </span>
            <XCircle className='w-4 h-4 text-red-500' />
            <span className='text-xs text-red-600'>
              {testResults.filter(t => t.status === 'fail').length} failed
            </span>
          </div>
        )}
      </div>

      <div className='flex items-center gap-2'>
        <Button
          size='sm'
          variant='outline'
          onClick={onRunTests}
          disabled={isRunning}
        >
          <Play className='w-4 h-4 mr-2' />
          {isRunning ? 'Running...' : 'Run Tests'}
        </Button>
        <Button size='sm' onClick={onAddTestScript}>
          <Plus className='w-4 h-4 mr-2' />
          Add Test
        </Button>
      </div>
    </div>
  );
}