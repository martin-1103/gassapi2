/**
 * Komponen untuk menampilkan summary test dengan progress bar
 * Menampilkan informasi umum tentang hasil test dan success rate
 */

import { Zap, CheckCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { TestStatistics, TestSummary } from './types/test-types';

interface TestSummaryProps {
  statistics: TestStatistics;
  summary: TestSummary;
}

export function TestSummary({ statistics, summary }: TestSummaryProps) {
  const { totalTests, successRate } = statistics;

  return (
    <div className='p-4'>
      {/* Header dengan judul dan status badge */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold flex items-center gap-2'>
          <Zap className='w-5 h-5' />
          Hasil Test
        </h3>
        <Badge
          variant='outline'
          className={`${summary.bgColor} ${summary.color} border-current`}
        >
          {summary.label}
        </Badge>
      </div>

      {/* Deskripsi summary */}
      <p className='text-sm text-muted-foreground mb-4'>
        {summary.description}
      </p>

      {/* Success Rate dengan Progress Bar */}
      {totalTests > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-medium'>Tingkat Keberhasilan</span>
              <div className='flex items-center gap-1'>
                <CheckCircle className='w-4 h-4 text-green-600' />
                <span className='text-xs text-green-600 font-medium'>
                  {Math.round(successRate)}%
                </span>
              </div>
            </div>
            <span className='text-xs text-muted-foreground'>
              {Math.round(successRate)}% dari {totalTests} test
            </span>
          </div>

          <Progress value={successRate} className='h-2' />

          {/* Additional info */}
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>
              {statistics.passedTests} berhasil · {statistics.failedTests} gagal
            </span>
            <span>
              {statistics.skippedTests} dilewati · {statistics.errorTests} error
            </span>
          </div>
        </div>
      )}

      {/* Empty state untuk no tests */}
      {totalTests === 0 && (
        <div className='text-center py-6'>
          <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center'>
            <Zap className='w-6 h-6 text-muted-foreground' />
          </div>
          <p className='text-sm text-muted-foreground'>
            Belum ada test yang dijalankan
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Tambahkan test script pada request untuk melihat hasil di sini
          </p>
        </div>
      )}
    </div>
  );
}
