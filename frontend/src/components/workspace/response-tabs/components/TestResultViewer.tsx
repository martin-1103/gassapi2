import {
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

import { AssertionList } from './AssertionList';
import type { TestResult } from '../types';

interface TestResultViewerProps {
  result: TestResult;
  getStatusColor: (status: TestResult['status']) => string;
  getTestIcon: (status: TestResult['status']) => React.ReactNode;
}

/**
 * Komponen untuk menampilkan detail hasil test individual
 * Menampilkan informasi status, durasi, error, dan assertion results
 */
export function TestResultViewer({
  result,
  getStatusColor,
  getTestIcon,
}: TestResultViewerProps) {
  return (
    <Card
      key={result.id}
      className={`border-l-4 ${getStatusColor(result.status)}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <div className='flex items-center gap-2 mb-2'>
              {getTestIcon(result.status)}
              <h4 className='font-medium'>{result.name}</h4>
              <Badge variant='outline' className='text-xs'>
                {result.status}
              </Badge>
            </div>

            {result.message && (
              <p className='text-sm text-muted-foreground mb-2'>
                {result.message}
              </p>
            )}

            <div className='flex items-center gap-4 text-xs text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                {result.duration}ms
              </div>
              {result.error && (
                <div className='text-red-600'>
                  Error: {result.error.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assertion Results */}
        {result.assertionResults && result.assertionResults.length > 0 && (
          <AssertionList assertions={result.assertionResults} />
        )}
      </CardContent>
    </Card>
  );
}