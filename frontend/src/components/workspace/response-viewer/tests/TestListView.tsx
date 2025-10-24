/**
 * Komponen untuk menampilkan daftar test dalam format list
 * Menampilkan semua test result dengan sorting dan pagination
 */

import { ScrollArea } from '@/components/ui/scroll-area';

import { TestResultCard } from './TestResultCard';
import { TestResult } from './types/test-types';
import { getTestPriority } from './utils/test-helpers';

interface TestListViewProps {
  testResults: TestResult[];
  onRerun?: (testName: string) => void;
  onSettings?: (testName: string) => void;
}

export function TestListView({
  testResults,
  onRerun,
  onSettings,
}: TestListViewProps) {
  // Sort test results by priority (error > fail > skip > pass)
  const sortedTestResults = [...testResults].sort((a, b) => {
    const priorityA = getTestPriority(a);
    const priorityB = getTestPriority(b);
    return priorityA - priorityB;
  });

  if (testResults.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        <div className='w-12 h-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center'>
          <div className='w-6 h-6 bg-muted-foreground/20 rounded'></div>
        </div>
        <p className='text-lg font-medium mb-2'>Tidak Ada Hasil Test</p>
        <p className='text-sm'>
          Tambahkan test script pada request untuk melihat hasil di sini
        </p>
        <div className='mt-4 text-xs text-muted-foreground'>
          <p>Tips: Gunakan tab &quot;Tests&quot; pada request editor untuk</p>
          <p>menambahkan assertion dan validation rules</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className='h-full'>
      <div className='space-y-3 p-4'>
        {/* Summary info */}
        <div className='text-sm text-muted-foreground mb-4'>
          Menampilkan {sortedTestResults.length} test{' '}
          {sortedTestResults.length > 1 && '(diurutkan berdasarkan prioritas)'}
        </div>

        {/* Test Result Cards */}
        <div className='space-y-3'>
          {sortedTestResults.map((result, index) => (
            <TestResultCard
              key={`${result.name}-${index}`}
              result={result}
              index={index}
              onRerun={onRerun}
              onSettings={onSettings}
            />
          ))}
        </div>

        {/* Legend */}
        <div className='mt-6 pt-4 border-t text-xs text-muted-foreground'>
          <div className='font-medium mb-2'>Legenda Prioritas:</div>
          <div className='grid grid-cols-2 gap-2'>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-red-500 rounded-full'></div>
              <span>Error (prioritas 1)</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-red-400 rounded-full'></div>
              <span>Gagal (prioritas 2)</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
              <span>Dilewati (prioritas 3)</span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='w-2 h-2 bg-green-500 rounded-full'></div>
              <span>Berhasil (prioritas 4)</span>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
