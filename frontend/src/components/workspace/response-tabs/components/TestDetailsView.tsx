import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { PerformanceData } from '../types';

interface TestDetailsViewProps {
  performanceData: PerformanceData | null;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalTests: number;
}

/**
 * Komponen untuk menampilkan detail analisis test
 * Menampilkan performance analysis dan test categories
 */
export function TestDetailsView({
  performanceData,
  passedTests,
  failedTests,
  skippedTests,
  totalTests,
}: TestDetailsViewProps) {
  return (
    <ScrollArea className='h-full'>
      <div className='space-y-4'>
        {/* Performance Analysis */}
        {performanceData && (
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-sm font-medium'>
                    Fastest Test
                  </div>
                  <div className='text-2xl font-bold text-green-600'>
                    {performanceData.fastest}ms
                  </div>
                </div>
                <div>
                  <div className='text-sm font-medium'>
                    Slowest Test
                  </div>
                  <div className='text-2xl font-bold text-red-600'>
                    {performanceData.slowest}ms
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Categories */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>
              Test Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {[
                {
                  name: 'Status Code Tests',
                  count: passedTests,
                  color: 'bg-blue-500',
                },
                {
                  name: 'Response Time Tests',
                  count: failedTests,
                  color: 'bg-green-500',
                },
                {
                  name: 'Data Validation Tests',
                  count: skippedTests,
                  color: 'bg-yellow-500',
                },
              ].map(category => (
                <div
                  key={category.name}
                  className='flex items-center justify-between'
                >
                  <span className='text-sm'>{category.name}</span>
                  <div className='flex items-center gap-2'>
                    <div className='w-24 bg-gray-200 rounded-full h-2'>
                      <div
                        className={`${category.color} h-2 rounded-full`}
                        style={{
                          width: `${(category.count / totalTests) * 100}%`,
                        }}
                      />
                    </div>
                    <span className='text-sm text-muted-foreground w-8'>
                      {category.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}