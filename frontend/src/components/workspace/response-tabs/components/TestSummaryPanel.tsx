import {
  BarChart3,
} from 'lucide-react';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TestSummaryPanelProps {
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  averageDuration: number;
  totalTests: number;
}

/**
 * Komponen untuk menampilkan ringkasan hasil test
 * Menampilkan statistik pass/fail/skip dan progress bar
 */
export function TestSummaryPanel({
  passedTests,
  failedTests,
  skippedTests,
  averageDuration,
  totalTests,
}: TestSummaryPanelProps) {
  return (
    <Card className='m-4'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg flex items-center gap-2'>
          <BarChart3 className='w-5 h-5' />
          Test Results Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-4 gap-4 mb-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {passedTests}
            </div>
            <div className='text-sm text-muted-foreground'>Passed</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-red-600'>
              {failedTests}
            </div>
            <div className='text-sm text-muted-foreground'>Failed</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {skippedTests}
            </div>
            <div className='text-sm text-muted-foreground'>Skipped</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-gray-600'>
              {averageDuration.toFixed(0)}ms
            </div>
            <div className='text-sm text-muted-foreground'>Avg Duration</div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span>Overall Success Rate</span>
            <span>
              {totalTests > 0
                ? Math.round((passedTests / totalTests) * 100)
                : 0}
              %
            </span>
          </div>
          <Progress
            value={totalTests > 0 ? (passedTests / totalTests) * 100 : 0}
            className='h-2'
          />
        </div>
      </CardContent>
    </Card>
  );
}