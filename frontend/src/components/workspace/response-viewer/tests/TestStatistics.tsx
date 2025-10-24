/**
 * Komponen untuk menampilkan statistik test
 * Menampilkan jumlah test per status dengan ikon dan warna yang sesuai
 */

import {
  CheckCircle,
  XCircle,
  SkipForward,
  Clock,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { TestStatistics } from './types/test-types';
import { formatDuration } from './utils/test-utils';

interface TestStatisticsProps {
  statistics: TestStatistics;
}

export function TestStatistics({ statistics }: TestStatisticsProps) {
  const {
    passedTests,
    failedTests,
    skippedTests,
    errorTests,
    totalTests,
    averageDuration,
  } = statistics;

  return (
    <div className='grid grid-cols-4 gap-4 mb-6'>
      {/* Passed Tests */}
      <Card className='border-green-200 bg-green-50/30'>
        <CardContent className='p-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <CheckCircle className='w-5 h-5 text-green-600' />
            <span className='text-2xl font-bold text-green-600'>
              {passedTests}
            </span>
          </div>
          <div className='text-sm text-green-700 font-medium'>Berhasil</div>
          {totalTests > 0 && (
            <div className='text-xs text-green-600 mt-1'>
              {Math.round((passedTests / totalTests) * 100)}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Failed Tests */}
      <Card className='border-red-200 bg-red-50/30'>
        <CardContent className='p-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <XCircle className='w-5 h-5 text-red-600' />
            <span className='text-2xl font-bold text-red-600'>
              {failedTests}
            </span>
          </div>
          <div className='text-sm text-red-700 font-medium'>Gagal</div>
          {totalTests > 0 && (
            <div className='text-xs text-red-600 mt-1'>
              {Math.round((failedTests / totalTests) * 100)}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skipped Tests */}
      <Card className='border-yellow-200 bg-yellow-50/30'>
        <CardContent className='p-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <SkipForward className='w-5 h-5 text-yellow-600' />
            <span className='text-2xl font-bold text-yellow-600'>
              {skippedTests}
            </span>
          </div>
          <div className='text-sm text-yellow-700 font-medium'>Dilewati</div>
          {totalTests > 0 && (
            <div className='text-xs text-yellow-600 mt-1'>
              {Math.round((skippedTests / totalTests) * 100)}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Tests */}
      <Card className='border-orange-200 bg-orange-50/30'>
        <CardContent className='p-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <AlertCircle className='w-5 h-5 text-orange-600' />
            <span className='text-2xl font-bold text-orange-600'>
              {errorTests}
            </span>
          </div>
          <div className='text-sm text-orange-700 font-medium'>Error</div>
          {totalTests > 0 && (
            <div className='text-xs text-orange-600 mt-1'>
              {Math.round((errorTests / totalTests) * 100)}%
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Duration */}
      <Card className='border-gray-200 bg-gray-50/30'>
        <CardContent className='p-4 text-center'>
          <div className='flex items-center justify-center gap-2 mb-2'>
            <Clock className='w-5 h-5 text-gray-600' />
            <span className='text-2xl font-bold text-gray-700'>
              {formatDuration(averageDuration)}
            </span>
          </div>
          <div className='text-sm text-gray-700 font-medium'>
            Rata-rata Durasi
          </div>
          {totalTests > 0 && (
            <div className='text-xs text-gray-600 mt-1'>{totalTests} test</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
