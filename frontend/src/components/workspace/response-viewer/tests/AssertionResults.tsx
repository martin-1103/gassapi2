/**
 * Komponen untuk menampilkan hasil assertion dari sebuah test
 * Menampilkan detail assertion dengan expected dan actual values
 */

import { Card, CardContent } from '@/components/ui/card';

import { TestResult } from './types/test-types';
import { getAssertionColor, getTestIconSmall } from './utils/test-helpers';

interface AssertionResultsProps {
  assertions: TestResult['assertionResults'];
}

export function AssertionResults({ assertions }: AssertionResultsProps) {
  if (!assertions || assertions.length === 0) {
    return null;
  }

  return (
    <div className='mt-3 pt-3 border-t border-border'>
      <div className='text-sm font-medium mb-2 text-muted-foreground'>
        Assertions ({assertions.length}):
      </div>

      <div className='space-y-2'>
        {assertions.map((assertion, index) => (
          <Card key={index} className='border-none shadow-sm'>
            <CardContent
              className={`p-3 ${getAssertionColor(assertion.status)}`}
            >
              {/* Header assertion */}
              <div className='flex items-start gap-2'>
                <div className='mt-0.5'>
                  {getTestIconSmall(assertion.status)}
                </div>

                <div className='flex-1 min-w-0'>
                  {/* Assertion message */}
                  <div className='text-sm font-medium mb-1'>
                    {assertion.message}
                  </div>

                  {/* Assertion expression */}
                  <div className='text-xs opacity-75 mb-2 font-mono'>
                    {assertion.assertion}
                  </div>

                  {/* Expected vs Actual untuk failed assertions */}
                  {assertion.status === 'fail' && (
                    <div className='space-y-1 text-xs'>
                      {assertion.expected !== undefined && (
                        <div>
                          <span className='font-medium'>Expected:</span>
                          <code className='ml-2 bg-white/50 px-1 rounded'>
                            {JSON.stringify(assertion.expected)}
                          </code>
                        </div>
                      )}

                      {assertion.actual !== undefined && (
                        <div>
                          <span className='font-medium'>Actual:</span>
                          <code className='ml-2 bg-white/50 px-1 rounded'>
                            {JSON.stringify(assertion.actual)}
                          </code>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary statistics */}
      <div className='mt-3 text-xs text-muted-foreground'>
        <div className='flex items-center gap-4'>
          <span>
            ✓ {assertions.filter(a => a.status === 'pass').length} passed
          </span>
          <span>
            ✗ {assertions.filter(a => a.status === 'fail').length} failed
          </span>
        </div>
      </div>
    </div>
  );
}
