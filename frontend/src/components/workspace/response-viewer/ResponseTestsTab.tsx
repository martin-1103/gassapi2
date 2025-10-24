/**
 * Komponen utama untuk menampilkan hasil test response
 * Component ini telah direfactor menjadi komponen-komponen kecil yang lebih maintainable
 */

import { List, Eye } from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import dari components yang telah dipisah
import {
  TestSummary,
  TestStatistics,
  TestListView,
  PerformanceAnalysis,
  TestCategories,
  // Types dan utilities
  TestResult,
  calculateTestStatistics,
  getTestSummary,
} from './tests';

interface ResponseTestsTabProps {
  testResults: TestResult[];
  // Optional callbacks untuk actions
  onRerunTest?: (testName: string) => void;
  onTestSettings?: (testName: string) => void;
}

export function ResponseTestsTab({
  testResults,
  onRerunTest,
  onTestSettings,
}: ResponseTestsTabProps) {
  // Hitung statistik dan summary menggunakan utilities
  const statistics = calculateTestStatistics(testResults);
  const summary = getTestSummary(testResults);

  return (
    <div className='h-full flex flex-col'>
      {/* Header Section dengan Summary dan Statistics */}
      <div className='border-b'>
        <TestSummary statistics={statistics} summary={summary} />
        <div className='px-4 pb-4'>
          <TestStatistics statistics={statistics} />
        </div>
      </div>

      {/* Tab Content untuk List View dan Details */}
      <div className='flex-1'>
        <Tabs defaultValue='list' className='h-full flex flex-col'>
          <div className='px-4 pt-4'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='list' className='flex items-center gap-2'>
                <List className='w-4 h-4' />
                Daftar Test
              </TabsTrigger>
              <TabsTrigger value='details' className='flex items-center gap-2'>
                <Eye className='w-4 h-4' />
                Detail Analisis
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='flex-1 mt-4'>
            {/* List View Tab */}
            <TabsContent value='list' className='h-full mt-0'>
              <TestListView
                testResults={testResults}
                onRerun={onRerunTest}
                onSettings={onTestSettings}
              />
            </TabsContent>

            {/* Details Tab */}
            <TabsContent value='details' className='h-full mt-0'>
              <div className='space-y-6 p-4'>
                <PerformanceAnalysis testResults={testResults} />
                <TestCategories testResults={testResults} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
