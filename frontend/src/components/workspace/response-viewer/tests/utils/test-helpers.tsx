/**
 * Helper functions untuk UI dan status handling
 * Fungsi-fungsi ini membantu menentukan warna, ikon, dan status untuk tampilan test
 */

import { CheckCircle, XCircle, AlertCircle, SkipForward } from 'lucide-react';

import { TestResult } from '../../types/test-types';

/**
 * Interface untuk test summary
 */
export interface TestSummary {
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

/**
 * Mendapatkan ikon yang sesuai untuk status test
 * @param status Status dari test result
 * @returns React element untuk ikon
 */
export const getTestIcon = (status: TestResult['status']) => {
  switch (status) {
    case 'pass':
      return <CheckCircle className='w-4 h-4 text-green-500' />;
    case 'fail':
      return <XCircle className='w-4 h-4 text-red-500' />;
    case 'skip':
      return <SkipForward className='w-4 h-4 text-yellow-500' />;
    case 'error':
      return <AlertCircle className='w-4 h-4 text-orange-500' />;
    default:
      return <AlertCircle className='w-4 h-4 text-gray-500' />;
  }
};

/**
 * Mendapatkan ikon kecil untuk status test (ukuran berbeda)
 * @param status Status dari test result
 * @returns React element untuk ikon kecil
 */
export const getTestIconSmall = (status: TestResult['status']) => {
  switch (status) {
    case 'pass':
      return <CheckCircle className='w-3 h-3 text-green-500' />;
    case 'fail':
      return <XCircle className='w-3 h-3 text-red-500' />;
    case 'skip':
      return <SkipForward className='w-3 h-3 text-yellow-500' />;
    case 'error':
      return <AlertCircle className='w-3 h-3 text-orange-500' />;
    default:
      return <AlertCircle className='w-3 h-3 text-gray-500' />;
  }
};

/**
 * Mendapatkan warna CSS untuk status test
 * @param status Status dari test result
 * @returns String CSS class untuk warna
 */
export const getStatusColor = (status: TestResult['status']): string => {
  switch (status) {
    case 'pass':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'fail':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'skip':
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'error':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

/**
 * Mendapatkan warna border untuk status test
 * @param status Status dari test result
 * @returns String CSS class untuk warna border
 */
export const getStatusBorderColor = (status: TestResult['status']): string => {
  switch (status) {
    case 'pass':
      return 'border-l-green-500';
    case 'fail':
      return 'border-l-red-500';
    case 'skip':
      return 'border-l-yellow-500';
    case 'error':
      return 'border-l-orange-500';
    default:
      return 'border-l-gray-500';
  }
};

/**
 * Mendapatkan warna background untuk assertion
 * @param status Status dari assertion
 * @returns String CSS class untuk warna background
 */
export const getAssertionColor = (status: 'pass' | 'fail'): string => {
  return status === 'pass'
    ? 'bg-green-50 text-green-700'
    : 'bg-red-50 text-red-700';
};

/**
 * Menghasilkan summary test berdasarkan hasil test
 * @param testResults Array dari hasil test
 * @returns Object TestSummary dengan informasi lengkap
 */
export const getTestSummary = (testResults: TestResult[]): TestSummary => {
  const totalTests = testResults.length;
  const failedTests = testResults.filter(t => t.status === 'fail').length;
  const passedTests = testResults.filter(t => t.status === 'pass').length;

  const status =
    totalTests === 0
      ? 'no-tests'
      : failedTests === 0
        ? 'all-passed'
        : passedTests > 0
          ? 'partial-failure'
          : 'all-failed';

  switch (status) {
    case 'no-tests':
      return {
        label: 'Tidak Ada Test',
        description: 'Belum ada test yang didefinisikan untuk request ini',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
    case 'all-passed':
      return {
        label: 'Semua Test Berhasil',
        description: 'Semua assertion berhasil dijalankan',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      };
    case 'all-failed':
      return {
        label: 'Semua Test Gagal',
        description: 'Semua assertion gagal dieksekusi',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      };
    case 'partial-failure':
      return {
        label: 'Beberapa Test Gagal',
        description: `${passedTests} berhasil, ${failedTests} gagal`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      };
    default:
      return {
        label: 'Status Tidak Diketahui',
        description: 'Status test tidak dapat ditentukan',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      };
  }
};

/**
 * Mengecek apakah test memiliki assertion results
 * @param test Test result yang akan dicek
 * @returns Boolean apakah test memiliki assertions
 */
export const hasAssertions = (test: TestResult): boolean => {
  return !!(test.assertionResults && test.assertionResults.length > 0);
};

/**
 * Mendapatkan jumlah assertion yang passed dan failed
 * @param test Test result yang akan dicek
 * @returns Object dengan jumlah assertion per status
 */
export const getAssertionCounts = (test: TestResult) => {
  if (!test.assertionResults) {
    return { passed: 0, failed: 0, total: 0 };
  }

  const passed = test.assertionResults.filter(a => a.status === 'pass').length;
  const failed = test.assertionResults.filter(a => a.status === 'fail').length;
  const total = test.assertionResults.length;

  return { passed, failed, total };
};

/**
 * Format error message untuk ditampilkan
 * @param error Error object
 * @returns String error message yang sudah diformat
 */
export const formatErrorMessage = (error?: Error): string => {
  if (!error) return '';
  return error.message || 'Terjadi error yang tidak diketahui';
};

/**
 * Mendapatkan prioritas test untuk sorting
 * @param test Test result
 * @returns Number prioritas (semakin kecil semakin prioritas)
 */
export const getTestPriority = (test: TestResult): number => {
  switch (test.status) {
    case 'error':
      return 1; // Prioritas tertinggi
    case 'fail':
      return 2;
    case 'skip':
      return 3;
    case 'pass':
      return 4;
    default:
      return 5;
  }
};
