import {
  CheckCircle,
  XCircle,
} from 'lucide-react';
import * as React from 'react';

import type { AssertionResult } from '../types';

interface AssertionListProps {
  assertions: AssertionResult[];
}

/**
 * Komponen untuk menampilkan daftar assertion dari sebuah test result
 * Menampilkan status pass/fail dengan detail expected vs actual values
 */
export function AssertionList({ assertions }: AssertionListProps) {
  return (
    <div className='mt-3 pt-3 border-t'>
      <div className='text-sm font-medium mb-2'>
        Assertions:
      </div>
      <div className='space-y-1'>
        {assertions.map((assertion, index) => (
          <div
            key={index}
            className={`text-xs p-2 rounded ${
              assertion.status === 'pass'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <div className='flex items-center gap-2'>
              {assertion.status === 'pass' ? (
                <CheckCircle className='w-3 h-3' />
              ) : (
                <XCircle className='w-3 h-3' />
              )}
              <span>{assertion.message}</span>
            </div>
            {assertion.status === 'fail' && (
              <div className='mt-1 ml-5 text-xs'>
                Expected: {JSON.stringify(assertion.expected)}
                <br />
                Actual: {JSON.stringify(assertion.actual)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}