import {
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  List,
  Eye,
} from 'lucide-react';
import * as React from 'react';

import type { ConsoleEntry, TestResult } from './types';

/**
 * Utility functions untuk test results
 */

/**
 * Mendapatkan icon berdasarkan status test
 */
export function getTestIcon(status: TestResult['status']): React.ReactElement {
  switch (status) {
    case 'pass':
      return <CheckCircle className='w-4 h-4 text-green-500' />;
    case 'fail':
      return <XCircle className='w-4 h-4 text-red-500' />;
    case 'skip':
      return <AlertCircle className='w-4 h-4 text-yellow-500' />;
    case 'error':
      return <AlertCircle className='w-4 h-4 text-orange-500' />;
    default:
      return <PlayCircle className='w-4 h-4 text-gray-500' />;
  }
}

/**
 * Mendapatkan warna berdasarkan status test
 */
export function getStatusColor(status: TestResult['status']): string {
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
}

/**
 * Mendapatkan icon berdasarkan level console
 */
export function getConsoleIcon(level: ConsoleEntry['level']): React.ReactElement {
  switch (level) {
    case 'log':
      return <List className='w-4 h-4 text-blue-500' />;
    case 'info':
      return <Eye className='w-4 h-4 text-blue-500' />;
    case 'warn':
      return <AlertCircle className='w-4 h-4 text-yellow-500' />;
    case 'error':
      return <XCircle className='w-4 h-4 text-red-500' />;
    case 'debug':
      return <List className='w-4 h-4 text-gray-500' />;
    default:
      return <List className='w-4 h-4' />;
  }
}

/**
 * Mendapatkan warna berdasarkan level console
 */
export function getConsoleColor(level: ConsoleEntry['level']): string {
  switch (level) {
    case 'log':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'info':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'warn':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    case 'error':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'debug':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

/**
 * Format pesan console dengan timestamp
 */
export function formatConsoleMessage(entry: ConsoleEntry): string {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const message =
    typeof entry.message === 'string'
      ? entry.message
      : JSON.stringify(entry.message);

  return `[${timestamp}] ${message}`;
}