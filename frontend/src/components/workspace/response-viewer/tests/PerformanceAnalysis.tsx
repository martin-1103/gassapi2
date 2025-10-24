/**
 * Komponen untuk menampilkan analisis performa test
 * Menampilkan metrik performa seperti fastest, slowest, dan average duration
 */

import { Zap, TrendingUp, TrendingDown, Activity } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { TestResult } from './types/test-types';
import {
  calculatePerformanceMetrics,
  formatDuration,
} from './utils/test-utils';

interface PerformanceAnalysisProps {
  testResults: TestResult[];
}

export function PerformanceAnalysis({ testResults }: PerformanceAnalysisProps) {
  const metrics = calculatePerformanceMetrics(testResults);

  if (testResults.length === 0) {
    return (
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <Zap className='w-4 h-4' />
            Analisis Performa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-6 text-muted-foreground'>
            <Activity className='w-8 h-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>Belum ada data performa</p>
            <p className='text-xs'>
              Jalankan test untuk melihat analisis performa
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine performance level
  const getPerformanceLevel = (avgDuration: number) => {
    if (avgDuration < 100)
      return { level: 'Cepat', color: 'text-green-600', icon: TrendingUp };
    if (avgDuration < 500)
      return { level: 'Sedang', color: 'text-yellow-600', icon: Activity };
    return { level: 'Lambat', color: 'text-red-600', icon: TrendingDown };
  };

  const performanceLevel = getPerformanceLevel(metrics.average);

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base flex items-center gap-2'>
          <Zap className='w-4 h-4' />
          Analisis Performa
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Overall Performance Level */}
        <div className='mb-4 p-3 bg-muted rounded-lg'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium'>Performa Keseluruhan</span>
            <div
              className={`flex items-center gap-1 ${performanceLevel.color}`}
            >
              <performanceLevel.icon className='w-4 h-4' />
              <span className='font-medium'>{performanceLevel.level}</span>
            </div>
          </div>
          <div className='text-xs text-muted-foreground mt-1'>
            Rata-rata: {formatDuration(metrics.average)}
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className='grid grid-cols-2 gap-4 mb-4'>
          {/* Fastest Test */}
          <div className='text-center p-3 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-center justify-center gap-1 mb-1'>
              <TrendingUp className='w-4 h-4 text-green-600' />
              <span className='text-xs font-medium text-green-700'>
                Test Tercepat
              </span>
            </div>
            <div className='text-xl font-bold text-green-600'>
              {formatDuration(metrics.fastest)}
            </div>
            <div className='text-xs text-green-600 mt-1'>
              {((metrics.fastest / metrics.total) * 100).toFixed(1)}% dari total
              waktu
            </div>
          </div>

          {/* Slowest Test */}
          <div className='text-center p-3 bg-red-50 rounded-lg border border-red-200'>
            <div className='flex items-center justify-center gap-1 mb-1'>
              <TrendingDown className='w-4 h-4 text-red-600' />
              <span className='text-xs font-medium text-red-700'>
                Test Terlama
              </span>
            </div>
            <div className='text-xl font-bold text-red-600'>
              {formatDuration(metrics.slowest)}
            </div>
            <div className='text-xs text-red-600 mt-1'>
              {((metrics.slowest / metrics.total) * 100).toFixed(1)}% dari total
              waktu
            </div>
          </div>
        </div>

        {/* Performance Distribution */}
        <div className='space-y-2'>
          <div className='text-sm font-medium mb-2'>Distribusi Performa:</div>

          <div className='space-y-1'>
            {/* Fast tests (< 100ms) */}
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                Cepat (&lt;100ms)
              </span>
              <span className='font-medium'>
                {testResults.filter(t => t.duration < 100).length} test
              </span>
            </div>

            {/* Medium tests (100-500ms) */}
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                Sedang (100-500ms)
              </span>
              <span className='font-medium'>
                {
                  testResults.filter(t => t.duration >= 100 && t.duration < 500)
                    .length
                }{' '}
                test
              </span>
            </div>

            {/* Slow tests (> 500ms) */}
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                Lambat (&gt;500ms)
              </span>
              <span className='font-medium'>
                {testResults.filter(t => t.duration >= 500).length} test
              </span>
            </div>
          </div>
        </div>

        {/* Total execution time */}
        <div className='mt-4 pt-3 border-t text-xs text-muted-foreground text-center'>
          Total waktu eksekusi: {formatDuration(metrics.total)} untuk{' '}
          {testResults.length} test
        </div>
      </CardContent>
    </Card>
  );
}
