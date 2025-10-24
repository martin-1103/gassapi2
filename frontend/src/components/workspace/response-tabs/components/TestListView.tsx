import * as React from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import type { TestResult } from '../types';
import { getTestIcon, getStatusColor } from '../utils';

import { TestResultViewer } from './TestResultViewer';

interface TestListViewProps {
  testResults: TestResult[];
}

/**
 * Komponen untuk menampilkan daftar test results dalam format list
 * Menampilkan semua test dengan detail assertion results
 */
export function TestListView({ testResults }: TestListViewProps) {
  return (
    <ScrollArea className='h-full'>
      <div className='space-y-2'>
        {testResults.map(result => (
          <TestResultViewer
            key={result.id}
            result={result}
            getTestIcon={getTestIcon}
            getStatusColor={getStatusColor}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
