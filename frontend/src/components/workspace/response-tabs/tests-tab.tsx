import { List, Eye, AlertCircle } from 'lucide-react';
import * as React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTestResultsState } from '@/hooks/useTestResultsState';

import { ConsoleViewer } from './components/ConsoleViewer';
import { TestDetailsView } from './components/TestDetailsView';
import { TestExecutionControls } from './components/TestExecutionControls';
import { TestListView } from './components/TestListView';
import { TestSummaryPanel } from './components/TestSummaryPanel';
import type { ConsoleEntry, TestResult } from './types';

interface ResponseTestsTabProps {
  testResults: TestResult[];
  console?: ConsoleEntry[];
  onRunTests?: () => void;
  isRunning?: boolean;
}

export function ResponseTestsTab({
  testResults,
  console = [],
  onRunTests,
  isRunning = false,
}: ResponseTestsTabProps) {
  // Gunakan custom hook untuk state management dan processing
  const {
    passedTests,
    failedTests,
    skippedTests,
    totalTests,
    averageDuration,
    performanceData,
  } = useTestResultsState(testResults, console);

  return (
    <div className='h-full flex flex-col'>
      {/* Header dengan kontrol eksekusi test */}
      <TestExecutionControls
        totalTests={totalTests}
        isRunning={isRunning}
        onRunTests={onRunTests}
      />

      {/* Summary Panel */}
      <TestSummaryPanel
        passedTests={passedTests}
        failedTests={failedTests}
        skippedTests={skippedTests}
        averageDuration={averageDuration}
        totalTests={totalTests}
      />

      {/* Test Results Content */}
      <div className='flex-1 px-4 pb-4'>
        <Tabs defaultValue='list' className='h-full flex flex-col'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='list' className='flex items-center gap-2'>
              <List className='w-4 h-4' />
              List View
            </TabsTrigger>
            <TabsTrigger value='details' className='flex items-center gap-2'>
              <Eye className='w-4 h-4' />
              Details
            </TabsTrigger>
            <TabsTrigger value='console' className='flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' />
              Console
            </TabsTrigger>
          </TabsList>

          <div className='flex-1 mt-4'>
            <TabsContent value='list' className='h-full'>
              <TestListView testResults={testResults} />
            </TabsContent>

            <TabsContent value='details' className='h-full'>
              <TestDetailsView
                performanceData={performanceData}
                passedTests={passedTests}
                failedTests={failedTests}
                skippedTests={skippedTests}
                totalTests={totalTests}
              />
            </TabsContent>

            <TabsContent value='console' className='h-full'>
              <ConsoleViewer console={console} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
