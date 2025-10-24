/**
 * Komponen untuk menampilkan analisis test berdasarkan kategori
 * Menampilkan test yang dikelompokkan berdasarkan status code, response time, dan data validation
 */

import { CheckCircle, Clock, Database, Filter } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import { TestResult } from './types/test-types';
import { getStatusColor } from './utils/test-helpers';
import {
  categorizeTests,
  calculateCategorySuccessRate,
} from './utils/test-utils';

interface TestCategoriesProps {
  testResults: TestResult[];
}

export function TestCategories({ testResults }: TestCategoriesProps) {
  const categories = categorizeTests(testResults);

  if (testResults.length === 0) {
    return (
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base flex items-center gap-2'>
            <Filter className='w-4 h-4' />
            Kategori Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-6 text-muted-foreground'>
            <Filter className='w-8 h-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>Belum ada data kategori</p>
            <p className='text-xs'>
              Jalankan test untuk melihat analisis kategori
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CategorySection = ({
    title,
    icon: Icon,
    tests,
    description,
  }: {
    title: string;
    icon: any;
    tests: TestResult[];
    description: string;
  }) => {
    const successRate = calculateCategorySuccessRate(tests);
    const passedCount = tests.filter(t => t.status === 'pass').length;
    const totalCount = tests.length;

    return (
      <div className='p-3 border rounded-lg'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center gap-2'>
            <Icon className='w-4 h-4 text-muted-foreground' />
            <span className='text-sm font-medium'>{title}</span>
          </div>
          <Badge variant='outline' className='text-xs'>
            {totalCount}
          </Badge>
        </div>

        <p className='text-xs text-muted-foreground mb-2'>{description}</p>

        {totalCount > 0 ? (
          <div className='space-y-2'>
            {/* Success Rate */}
            <div className='flex items-center justify-between text-xs'>
              <span className='flex items-center gap-1'>
                <CheckCircle className='w-3 h-3 text-green-600' />
                Success Rate
              </span>
              <span className='font-medium'>{Math.round(successRate)}%</span>
            </div>

            {/* Progress Bar */}
            <Progress value={successRate} className='h-1.5' />

            {/* Statistics */}
            <div className='flex items-center justify-between text-xs text-muted-foreground'>
              <span>{passedCount} berhasil</span>
              <span>{totalCount - passedCount} gagal</span>
            </div>

            {/* Average duration */}
            <div className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Clock className='w-3 h-3' />
              <span>
                Rata-rata:{' '}
                {tests.length > 0
                  ? Math.round(
                      tests.reduce((sum, t) => sum + t.duration, 0) /
                        tests.length,
                    )
                  : 0}
                ms
              </span>
            </div>
          </div>
        ) : (
          <div className='text-xs text-muted-foreground text-center py-2'>
            Tidak ada test dalam kategori ini
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-base flex items-center gap-2'>
          <Filter className='w-4 h-4' />
          Kategori Test
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {/* Status Code Tests */}
          <CategorySection
            title='Test Status Code'
            icon={CheckCircle}
            tests={categories.status}
            description='Test untuk memvalidasi HTTP response status'
          />

          {/* Response Time Tests */}
          <CategorySection
            title='Test Response Time'
            icon={Clock}
            tests={categories.time}
            description='Test untuk memvalidasi kecepatan response'
          />

          {/* Data Validation Tests */}
          <CategorySection
            title='Test Validasi Data'
            icon={Database}
            tests={categories.data}
            description='Test untuk memvalidasi struktur dan isi response data'
          />

          {/* Uncategorized Tests */}
          {testResults.length > 0 && (
            <div className='mt-4 pt-4 border-t'>
              <div className='text-sm font-medium mb-2'>
                Test Tidak Terkategori:
              </div>
              <div className='flex items-center justify-between text-xs text-muted-foreground'>
                <span>
                  {testResults.length -
                    categories.status.length -
                    categories.time.length -
                    categories.data.length}{' '}
                  test
                </span>
                <span>Lihat tab List View untuk detail lengkap</span>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className='mt-4 pt-4 border-t text-xs text-muted-foreground'>
            <div className='flex items-center justify-between'>
              <span>Total test yang dianalisis:</span>
              <span className='font-medium'>{testResults.length} test</span>
            </div>
            <div className='flex items-center justify-between mt-1'>
              <span>Test yang terkategori:</span>
              <span className='font-medium'>
                {categories.status.length +
                  categories.time.length +
                  categories.data.length}{' '}
                test
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
