/**
 * Komponen untuk menampilkan detail satu test result
 * Menampilkan informasi lengkap test dengan assertions dan actions
 */

import { Clock, Play, Settings } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { AssertionResults } from './AssertionResults';
import { TestResult } from './types/test-types';
import {
  getTestIcon,
  getStatusColor,
  getStatusBorderColor,
  formatErrorMessage,
} from './utils/test-helpers';
import { formatDuration } from './utils/test-utils';

interface TestResultCardProps {
  result: TestResult;
  index: number;
  onRerun?: (testName: string) => void;
  onSettings?: (testName: string) => void;
}

export function TestResultCard({
  result,
  index,
  onRerun,
  onSettings,
}: TestResultCardProps) {
  const handleRerun = () => {
    onRerun?.(result.name);
  };

  const handleSettings = () => {
    onSettings?.(result.name);
  };

  return (
    <Card
      key={`${result.name}-${index}`}
      className={`border-l-4 ${getStatusBorderColor(result.status)} ${getStatusColor(result.status)}`}
    >
      <CardContent className='p-4'>
        <div className='flex items-start justify-between gap-4'>
          {/* Main Content */}
          <div className='flex-1 min-w-0'>
            {/* Header dengan status dan nama */}
            <div className='flex items-center gap-2 mb-2'>
              {getTestIcon(result.status)}
              <h4 className='font-medium text-sm truncate'>{result.name}</h4>
              <Badge variant='outline' className='text-xs shrink-0'>
                {result.status}
              </Badge>
            </div>

            {/* Message test */}
            {result.message && (
              <p className='text-sm text-muted-foreground mb-2'>
                {result.message}
              </p>
            )}

            {/* Metadata */}
            <div className='flex items-center gap-4 text-xs text-muted-foreground mb-2'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3 h-3' />
                <span>{formatDuration(result.duration)}</span>
              </div>

              {/* Error message */}
              {result.error && (
                <div className='text-red-600 font-medium'>
                  Error: {formatErrorMessage(result.error)}
                </div>
              )}

              {/* Assertion count */}
              {result.assertionResults &&
                result.assertionResults.length > 0 && (
                  <div>
                    {
                      result.assertionResults.filter(a => a.status === 'pass')
                        .length
                    }
                    /{result.assertionResults.length} assertions passed
                  </div>
                )}
            </div>

            {/* Assertion Results */}
            <AssertionResults assertions={result.assertionResults} />
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-2 shrink-0'>
            <Button
              size='sm'
              variant='ghost'
              className='text-xs h-8 px-2'
              onClick={handleRerun}
            >
              <Play className='w-3 h-3 mr-1' />
              Jalankan Ulang
            </Button>
            <Button
              size='sm'
              variant='ghost'
              className='text-xs h-8 px-2'
              onClick={handleSettings}
            >
              <Settings className='w-3 h-3 mr-1' />
              Pengaturan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
